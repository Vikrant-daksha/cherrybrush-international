/**
 * PayPal REST API v2 Integration Service
 *
 * This service handles:
 * 1. OAuth2 Client-Credentials Access Token generation (with in-memory caching).
 * 2. Creating PayPal Checkout Orders with itemized breakdowns.
 * 3. Capturing approved PayPal Orders.
 * 4. Fetching order status directly from PayPal.
 */

interface PayPalTokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

let cachedToken: PayPalTokenCache | null = null;

/**
 * Returns the PayPal API base URL based on PAYPAL_MODE environment variable.
 * Defaults to Sandbox for safety.
 */
export function getPayPalBaseUrl(): string {
  const mode =
    process.env.PAYPAL_MODE || process.env.PAYPAL_ENVIRONMENT || "sandbox";
  return mode.toLowerCase() === "live" || mode.toLowerCase() === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/**
 * Validates and retrieves PayPal credentials from environment variables.
 */
function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error(
      "Missing PayPal credentials. Please define PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env.local",
    );
  }

  return { clientId, secret };
}

/**
 * Retrieves a valid OAuth2 Bearer Access Token from PayPal.
 * Reuses cached token if it has not yet expired.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if valid with a 60-second safety buffer
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }

  const { clientId, secret } = getCredentials();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal OAuth2 Error:", errorText);
    throw new Error(
      `Failed to authenticate with PayPal: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  const expiresInMs = (data.expires_in || 3600) * 1000;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + expiresInMs,
  };

  return data.access_token;
}

export interface PayPalLineItem {
  name: string;
  unitAmount: number;
  quantity: number;
  description?: string;
  sku?: string;
}

export interface CreatePayPalOrderParams {
  orderNumber: string;
  currency: string;
  items: PayPalLineItem[];
  subtotal: number;
  shippingFee?: number;
  tax?: number;
  discount?: number;
  total: number;
  idempotencyKey?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  approvalUrl?: string;
}

/**
 * Creates a PayPal Order using PayPal Checkout REST API v2 (/v2/checkout/orders).
 */
export async function createPayPalOrder(
  params: CreatePayPalOrderParams,
): Promise<PayPalOrderResponse> {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const currency = params.currency.toUpperCase();
  const formatAmount = (val: number) => Math.max(0, val).toFixed(2);

  const subtotalFormatted = formatAmount(params.subtotal);
  const shippingFormatted = formatAmount(params.shippingFee || 0);
  const taxFormatted = formatAmount(params.tax || 0);
  const discountFormatted = formatAmount(params.discount || 0);
  const totalFormatted = formatAmount(params.total);

  // Format line items for PayPal's strict specification
  const formattedItems = params.items.map((item) => ({
    name: item.name.substring(0, 127), // PayPal item name max length is 127
    description: (item.description || item.sku || "").substring(0, 127),
    sku: (item.sku || "").substring(0, 127),
    unit_amount: {
      currency_code: currency,
      value: formatAmount(item.unitAmount),
    },
    quantity: item.quantity.toString(),
    category: "PHYSICAL_GOODS",
  }));

  const payload: Record<string, any> = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: params.orderNumber,
        custom_id: params.orderNumber,
        invoice_id: `${params.orderNumber}-${Date.now().toString().slice(-4)}`,
        description: `Cherrybrush Order ${params.orderNumber}`,
        amount: {
          currency_code: currency,
          value: totalFormatted,
          breakdown: {
            item_total: {
              currency_code: currency,
              value: subtotalFormatted,
            },
            shipping: {
              currency_code: currency,
              value: shippingFormatted,
            },
            tax_total: {
              currency_code: currency,
              value: taxFormatted,
            },
            discount: {
              currency_code: currency,
              value: discountFormatted,
            },
          },
        },
        items: formattedItems,
      },
    ],
  };

  // Optional redirect URLs if frontend wants to use standard redirect flow
  if (params.returnUrl && params.cancelUrl) {
    payload.application_context = {
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      brand_name: "Cherrybrush Nails",
      user_action: "PAY_NOW",
    };
  }

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": params.idempotencyKey || params.orderNumber,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal Create Order Error:", JSON.stringify(data, null, 2));
    throw new Error(
      data.message ||
        data.details?.[0]?.description ||
        `PayPal Order Creation Failed with status ${response.status}`,
    );
  }

  const approvalLink = data.links?.find((link: any) => link.rel === "approve");

  return {
    id: data.id,
    status: data.status,
    links: data.links || [],
    approvalUrl: approvalLink?.href,
  };
}

export interface PayPalCaptureResponse {
  id: string; // PayPal Order ID
  status: string; // E.g. "COMPLETED"
  captureId?: string; // Transaction ID of the capture
  payer?: {
    emailAddress?: string;
    payerId?: string;
    name?: {
      givenName?: string;
      surname?: string;
    };
  };
  raw: any;
}

/**
 * Captures payment for an approved PayPal order (/v2/checkout/orders/{id}/capture).
 */
export async function capturePayPalOrder(
  paypalOrderId: string,
  idempotencyKey?: string,
): Promise<PayPalCaptureResponse> {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "PayPal-Request-Id": idempotencyKey || `capture-${paypalOrderId}`,
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal Capture Error:", JSON.stringify(data, null, 2));
    throw new Error(
      data.message ||
        data.details?.[0]?.description ||
        `PayPal Capture Failed with status ${response.status}`,
    );
  }

  // Extract the capture transaction ID from the first capture unit
  const captureUnit = data.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId = captureUnit?.id;

  return {
    id: data.id,
    status: data.status,
    captureId,
    payer: {
      emailAddress: data.payer?.email_address,
      payerId: data.payer?.payer_id,
      name: {
        givenName: data.payer?.name?.given_name,
        surname: data.payer?.name?.surname,
      },
    },
    raw: data,
  };
}

/**
 * Fetches the current status and details of an order from PayPal (/v2/checkout/orders/{id}).
 */
export async function getPayPalOrderDetails(
  paypalOrderId: string,
): Promise<any> {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paypalOrderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to retrieve PayPal order: ${response.status} - ${errorText}`,
    );
  }

  return response.json();
}
