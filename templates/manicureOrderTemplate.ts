export interface ManicureOrderItem {
  image?: string;
  name: string;
  shape?: string;
  length?: string;
  finish?: string;
  quantity: number | string;
  total: string;
}

export interface ManicureOrderEmailData {
  storeUrl?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  customerFirstName?: string;
  orderNumber?: string;
  orderDate?: string;
  items?: ManicureOrderItem[];
  product1?: ManicureOrderItem;
  product2?: ManicureOrderItem;
  subtotal?: string;
  shippingCost?: string;
  taxAmount?: string;
  orderTotal?: string;
  orderStatusUrl?: string;
  supportEmail?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  storeName?: string;
  storeAddress?: string;
  privacyPolicyUrl?: string;
  contactUrl?: string;
}

export function generateManicureOrderEmailHtml(data: ManicureOrderEmailData = {}): string {
  const storeUrl = data.storeUrl || "https://cherrybrush.in";
  const logoUrl = data.logoUrl || "cid:cherrybrush_logo";
  const heroImageUrl = data.heroImageUrl || "cid:cherrybrush_hero";
  const customerFirstName = data.customerFirstName ? ` ${data.customerFirstName}` : "";
  const orderNumber = data.orderNumber || "";
  const orderDate = data.orderDate || "";

  // Dynamic real items mapping - zero static fallbacks
  const items: ManicureOrderItem[] =
    data.items && data.items.length > 0
      ? data.items
      : [data.product1, data.product2].filter(Boolean) as ManicureOrderItem[];

  const subtotal = data.subtotal || "";
  const shippingCost = data.shippingCost || "";
  const taxAmount = data.taxAmount || "";
  const orderTotal = data.orderTotal || "";

  const orderStatusUrl = data.orderStatusUrl || "https://cherrybrush.in/account/orders";
  const supportEmail = data.supportEmail || "support@cherrybrush.com";
  const trackingNumber = data.trackingNumber || "";
  const estimatedDelivery = data.estimatedDelivery || "";

  const instagramUrl = data.instagramUrl || "https://instagram.com/cherrybrush";
  const tiktokUrl = data.tiktokUrl || "https://tiktok.com/@cherrybrush";
  const storeName = data.storeName || "CherryBrush International";
  const storeAddress = data.storeAddress || "New Delhi, India";
  const privacyPolicyUrl = data.privacyPolicyUrl || "https://cherrybrush.in/privacy";
  const contactUrl = data.contactUrl || "https://cherrybrush.in/contact";

  const itemsHtml = items.map((item) => {
    const details = [
      item.shape && `Shape: ${item.shape}`,
      item.length && `Length: ${item.length}`,
      item.finish && `Finish: ${item.finish}`,
    ].filter(Boolean).join("<br>");

    const imgTag = item.image
      ? `<img class="product-image" src="${item.image}" alt="${item.name || "Product"}" width="88" height="88" style="width:88px;height:88px;object-fit:cover;border-radius:12px;">`
      : "";

    return `
      <tr>
        <td class="mobile-padding" style="padding:12px 36px 0;">
          <table role="presentation" width="100%" style="border-bottom:1px solid #f0dfde;">
            <tr>
              ${imgTag ? `<td width="88" valign="top" style="padding:12px 0 20px;">${imgTag}</td>` : ""}
              <td class="product-details" valign="top" style="padding:12px 10px 20px ${imgTag ? "16px" : "0"};">
                <p style="margin:0 0 6px;font-size:14px;font-weight:bold;color:#432b2b;">
                  ${item.name || ""}
                </p>
                ${details ? `<p class="muted" style="margin:0 0 6px;font-size:11px;line-height:1.8;">${details}</p>` : ""}
                <p style="margin:0;font-size:13px;color:#432b2b;">
                  Qty: ${item.quantity || 1}
                </p>
              </td>
              <td align="right" valign="top" style="padding:14px 0 20px;white-space:nowrap;">
                <p style="margin:0;font-size:13px;font-weight:bold;color:#432b2b;">
                  ${item.total || ""}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Your order is confirmed</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8eeee;
      font-family: Arial, Helvetica, sans-serif;
      color: #432b2b;
      -webkit-text-size-adjust: 100%;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    img {
      display: block;
      border: 0;
      max-width: 100%;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .email-shell {
      width: 100%;
      max-width: 680px;
    }

    .serif {
      font-family: Georgia, "Times New Roman", serif;
    }

    .muted {
      color: #987d7c;
    }

    .product-image {
      width: 88px;
      height: 88px;
      object-fit: cover;
      border-radius: 12px;
    }

    @media screen and (max-width: 600px) {
      .email-shell {
        width: 100% !important;
      }

      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      .mobile-title {
        font-size: 37px !important;
        line-height: 1.1 !important;
      }

      .product-image {
        width: 74px !important;
        height: 74px !important;
      }
    }
  </style>
</head>

<body>
  <table role="presentation" width="100%" bgcolor="#f8eeee">
    <tr>
      <td align="center" style="padding:24px 12px 40px;">

        <table role="presentation" class="email-shell" bgcolor="#ffffff"
          style="border-radius:24px;overflow:hidden;
          box-shadow:0 12px 30px rgba(135,76,82,0.08);">

          <!-- HEADER -->
          <tr>
            <td class="mobile-padding"
              style="padding:28px 36px 20px;border-bottom:1px solid #f6e8e8;">
              <table role="presentation" width="100%">
                <tr>
                  <td align="left">
                    <img src="${logoUrl}"
                      alt="${storeName}"
                      width="120"
                      style="max-width:120px;height:auto;">
                  </td>
                  <td align="right">
                    <span style="display:inline-block;
                      padding:6px 14px;background:#fdf2f2;
                      border:1px solid #f2d2d2;border-radius:20px;
                      font-size:11px;letter-spacing:1px;
                      color:#9e555e;font-weight:600;">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO IMAGE -->
          <tr>
            <td style="padding:0;">
              <img src="${heroImageUrl}"
                alt="CherryBrush Luxury Nail Care"
                width="680"
                style="width:100%;max-width:680px;height:auto;display:block;">
            </td>
          </tr>

          <!-- HERO MESSAGE -->
          <tr>
            <td class="mobile-padding"
              style="padding:32px 36px 20px;text-align:center;">

              <p style="margin:0 0 10px;font-size:11px;
                letter-spacing:2px;color:#a16d73;font-weight:bold;">
                ORDER CONFIRMATION
              </p>

              <h1 class="serif mobile-title"
                style="margin:0 0 10px;font-size:48px;
                line-height:1.05;font-weight:400;color:#432525;">
                Thank you${customerFirstName ? `,${customerFirstName}` : ""}
              </h1>

              <p class="serif"
                style="margin:0 0 12px;font-size:19px;
                font-style:italic;color:#9b5a63;">
                Your bespoke manicure is being prepared.
              </p>

              <p class="muted"
                style="margin:0 auto;max-width:440px;
                font-size:13px;line-height:1.8;">
                We're so excited for you to receive your new set.
                Each tip is carefully inspected, packed, and polished
                before heading your way.
              </p>
            </td>
          </tr>

          <!-- ORDER NUMBER & DATE -->
          <tr>
            <td class="mobile-padding"
              style="padding:16px 36px;
              background-color:#fcf6f6;
              border-top:1px solid #f2e3e2;
              border-bottom:1px solid #f2e3e2;">

              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;
                      letter-spacing:1.5px;color:#987d7c;font-weight:bold;">
                      ORDER SUMMARY
                    </p>
                  </td>
                  <td align="right">
                    ${orderNumber ? `
                    <span style="display:inline-block;
                      padding:9px 12px;background:#f8e9e9;
                      border-radius:20px;font-size:11px;
                      color:#86595b;font-weight:600;">
                      #${orderNumber}
                    </span>` : ""}
                  </td>
                </tr>
              </table>

              ${orderDate ? `
              <p class="muted"
                style="margin:8px 0 0;font-size:12px;">
                Placed on ${orderDate}
              </p>` : ""}
            </td>
          </tr>

          <!-- DYNAMIC ORDER ITEMS -->
          ${itemsHtml}

          <!-- ORDER TOTALS -->
          <tr>
            <td class="mobile-padding"
              style="padding:24px 36px 28px;">

              <h2 class="serif"
                style="margin:0 0 18px;font-size:25px;
                font-weight:400;color:#432525;">
                The little details
              </h2>

              <table role="presentation" width="100%">
                ${subtotal ? `
                <tr>
                  <td style="padding:7px 0;font-size:12px;
                    color:#987d7c;">
                    Subtotal
                  </td>
                  <td align="right"
                    style="padding:7px 0;font-size:12px;">
                    ${subtotal}
                  </td>
                </tr>` : ""}

                ${shippingCost ? `
                <tr>
                  <td style="padding:7px 0;font-size:12px;
                    color:#987d7c;">
                    Shipping
                  </td>
                  <td align="right"
                    style="padding:7px 0;font-size:12px;">
                    ${shippingCost}
                  </td>
                </tr>` : ""}

                ${taxAmount ? `
                <tr>
                  <td style="padding:7px 0;font-size:12px;
                    color:#987d7c;">
                    Tax
                  </td>
                  <td align="right"
                    style="padding:7px 0;font-size:12px;">
                    ${taxAmount}
                  </td>
                </tr>` : ""}

                <tr>
                  <td colspan="2"
                    style="padding-top:12px;
                    border-bottom:1px solid #ead5d4;">
                  </td>
                </tr>

                ${orderTotal ? `
                <tr>
                  <td style="padding:19px 0 10px;
                    font-size:15px;font-weight:bold;">
                    Total
                  </td>
                  <td align="right"
                    style="padding:19px 0 10px;
                    font-size:22px;font-weight:bold;
                    color:#432525;">
                    ${orderTotal}
                  </td>
                </tr>` : ""}
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%"
                style="margin-top:12px;">
                <tr>
                  <td align="center" bgcolor="#754747"
                    style="border-radius:9px;">
                    <a href="${orderStatusUrl}"
                      style="display:block;padding:16px 18px;
                      font-size:13px;font-weight:bold;
                      letter-spacing:.4px;color:#ffffff;">
                      VIEW YOUR ORDER &nbsp; →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;text-align:center;
                font-size:11px;line-height:1.8;color:#987d7c;">
                Questions about your order?
                <a href="mailto:${supportEmail}"
                  style="color:#9e656d;text-decoration:underline;">
                  We're happy to help.
                </a>
              </p>
            </td>
          </tr>

          <!-- DELIVERY TRACKING -->
          <tr>
            <td class="mobile-padding"
              style="padding:24px 36px;
              background-color:#f8eded;
              border-top:1px solid #f0dfde;">

              <p style="margin:0 0 12px;font-size:10px;
                letter-spacing:2px;color:#a16d73;">
                WHAT HAPPENS NEXT
              </p>

              <h2 class="serif"
                style="margin:0 0 18px;font-size:25px;
                font-weight:400;color:#432525;">
                Your nails are on their way
              </h2>

              <table role="presentation" width="100%">
                <tr>
                  <td width="32" valign="top">
                    <div style="width:25px;height:25px;
                      line-height:25px;text-align:center;
                      background:#d995a0;border-radius:50%;
                      color:#ffffff;font-size:12px;">
                      ✓
                    </div>
                  </td>
                  <td style="padding:4px 0 15px;">
                    <p style="margin:0 0 4px;font-size:12px;
                      font-weight:bold;">
                      Order confirmed
                    </p>
                    <p class="muted"
                      style="margin:0;font-size:11px;">
                      We've received your order.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td width="32" valign="top">
                    <div style="width:25px;height:25px;
                      line-height:25px;text-align:center;
                      border:1px solid #e6c5c9;border-radius:50%;
                      color:#8f6569;font-size:12px;">
                      2
                    </div>
                  </td>
                  <td style="padding:4px 0 15px;">
                    <p style="margin:0 0 4px;font-size:12px;
                      font-weight:bold;">
                      Preparing your order
                    </p>
                    <p class="muted"
                      style="margin:0;font-size:11px;">
                      Your nail set is getting ready.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td width="32" valign="top">
                    <div style="width:25px;height:25px;
                      line-height:25px;text-align:center;
                      border:1px solid #e6c5c9;border-radius:50%;
                      color:#8f6569;font-size:12px;">
                      3
                    </div>
                  </td>
                  <td style="padding:4px 0;">
                    <p style="margin:0 0 4px;font-size:12px;
                      font-weight:bold;">
                      Shipped
                    </p>
                    <p class="muted"
                      style="margin:0;font-size:11px;">
                      ${trackingNumber ? `Tracking: ${trackingNumber}` : "Tracking details will be provided once dispatched."}
                    </p>
                  </td>
                </tr>
              </table>

              ${estimatedDelivery ? `
              <p style="margin:16px 0 0;font-size:11px;
                line-height:1.8;color:#987d7c;">
                Estimated delivery: ${estimatedDelivery}
              </p>` : ""}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" class="mobile-padding"
              style="padding:28px 36px 30px;">

              <p class="serif"
                style="margin:0 0 8px;font-size:24px;
                font-style:italic;color:#a76d79;">
                A little art at your fingertips. ♡
              </p>

              <p style="margin:0 0 18px;font-size:11px;
                line-height:1.8;color:#987d7c;">
                Thank you for supporting our small business
                and letting us be part of your self-expression.
              </p>

              <p style="margin:0 0 16px;font-size:11px;
                letter-spacing:1px;color:#81585b;">
                <a href="${instagramUrl}">INSTAGRAM</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${tiktokUrl}">TIKTOK</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="${storeUrl}">SHOP ALL SETS</a>
              </p>

              <div style="height:1px;background:#eedcdb;
                margin-bottom:16px;"></div>

              <p style="margin:0 0 8px;font-size:10px;
                line-height:1.8;color:#ab9290;">
                ${storeName} · ${storeAddress}
              </p>

              <p style="margin:0;font-size:10px;
                line-height:1.8;color:#ab9290;">
                <a href="${privacyPolicyUrl}">Privacy policy</a>
                &nbsp;·&nbsp;
                <a href="${contactUrl}">Contact us</a>
              </p>

              <p style="margin:12px 0 0;font-size:9px;
                line-height:1.7;color:#b49e9c;">
                You're receiving this email because you placed an order.
              </p>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0;font-size:10px;
          line-height:1.6;color:#ad9291;text-align:center;">
          Made with care, delivered with love.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
