import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/lib/order.model";
import { createOrderSnapshot } from "@/lib/orderService";
import { createPayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/create-order
 *
 * RESTful endpoint to create a PayPal checkout order.
 * Accepts either:
 * 1. An existing orderId / orderNumber from MongoDB Order snapshot
 * OR
 * 2. Fresh order data { items, customer, shippingAddress, currency }
 *    which verifies products and prices against MongoDB, creates an Order snapshot,
 *    and initializes the PayPal transaction.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    let orderDoc: any;

    if (body.orderId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(body.orderId);
      const query = isObjectId
        ? { $or: [{ _id: body.orderId }, { orderNumber: body.orderId }] }
        : { orderNumber: body.orderId };

      orderDoc = await Order.findOne(query);

      if (!orderDoc) {
        return NextResponse.json(
          { success: false, error: `Order "${body.orderId}" not found in database.` },
          { status: 404 }
        );
      }
    } else if (body.items && body.customer && body.shippingAddress) {
      // Validate against MongoDB and create snapshot (with optional idempotency key)
      orderDoc = await createOrderSnapshot(body);
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Provide either 'orderId' of an existing order snapshot, or full order details { items, customer, shippingAddress }.",
        },
        { status: 400 }
      );
    }

    // 1. Guard against duplicate payments if order is already paid
    if (orderDoc.payment?.status === "completed" || orderDoc.orderStatus === "paid") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: "This order has already been paid for.",
        orderId: orderDoc._id,
        orderNumber: orderDoc.orderNumber,
        status: "COMPLETED",
        order: orderDoc,
      });
    }

    // 2. Check if a PayPal order was already initialized for this snapshot (Resume capability)
    if (orderDoc.payment?.paypalOrderId && !body.forceNewPaypalOrder) {
      return NextResponse.json({
        success: true,
        resumed: true,
        orderId: orderDoc._id,
        orderNumber: orderDoc.orderNumber,
        paypalOrderId: orderDoc.payment.paypalOrderId,
        status: "CREATED",
        approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderDoc.payment.paypalOrderId}`,
      });
    }

    // Convert Order snapshot items to PayPal Line Items
    const paypalLineItems = orderDoc.items.map((item: any) => {
      // Line item unit price in order currency
      const unitAmountInCurrency = Number(
        (item.price * orderDoc.pricing.exchangeRate).toFixed(2)
      );

      const variantParts = [
        item.size && `Size: ${item.size}`,
        item.shape && `Shape: ${item.shape}`,
        item.length && `Length: ${item.length}`,
        (item.shade || item.color) && `Color: ${item.shade || item.color}`,
      ].filter(Boolean);

      const description = variantParts.length > 0 ? variantParts.join(" | ") : item.name;

      return {
        name: item.name,
        unitAmount: unitAmountInCurrency,
        quantity: item.quantity,
        description,
        sku: item.slug || item.productId,
      };
    });

    // Create the PayPal order with verified totals
    const paypalOrder = await createPayPalOrder({
      orderNumber: orderDoc.orderNumber,
      currency: orderDoc.pricing.currency,
      items: paypalLineItems,
      subtotal: orderDoc.pricing.itemsSubtotal,
      shippingFee: orderDoc.pricing.shippingFee,
      tax: orderDoc.pricing.tax,
      discount: orderDoc.pricing.discount,
      total: orderDoc.pricing.totalAmount,
      idempotencyKey: body.idempotencyKey || orderDoc.idempotencyKey || orderDoc.orderNumber,
      returnUrl: body.returnUrl,
      cancelUrl: body.cancelUrl,
    });

    // Update MongoDB Order Snapshot with the PayPal order reference
    orderDoc.payment.paypalOrderId = paypalOrder.id;
    orderDoc.payment.status = "pending";
    await orderDoc.save();

    return NextResponse.json({
      success: true,
      orderId: orderDoc._id,
      orderNumber: orderDoc.orderNumber,
      paypalOrderId: paypalOrder.id,
      status: paypalOrder.status,
      approvalUrl: paypalOrder.approvalUrl,
      links: paypalOrder.links,
    });
  } catch (error: any) {
    console.error("PayPal create order API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create PayPal order.",
      },
      { status: 500 }
    );
  }
}
