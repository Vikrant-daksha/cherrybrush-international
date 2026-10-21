import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/order.model";

export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/webhook
 *
 * Event-Driven Pub/Sub Listener for PayPal.
 * PayPal publishes payment events (Webhooks) directly to this subscriber endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const event = await req.json();

    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal Webhook Received] Event: ${eventType}`, {
      id: resource?.id,
      status: resource?.status,
    });

    switch (eventType) {
      // 1. Payment has been successfully captured and settled
      case "PAYMENT.CAPTURE.COMPLETED":
      case "CHECKOUT.ORDER.COMPLETED": {
        const paypalOrderId =
          resource?.supplementary_data?.related_ids?.order_id ||
          resource?.custom_id ||
          (resource?.intent ? resource?.id : undefined);
        const captureId = resource?.id;

        const query = paypalOrderId
          ? { $or: [{ "payment.paypalOrderId": paypalOrderId }, { orderNumber: paypalOrderId }] }
          : { "payment.paypalCaptureId": captureId };

        const order = await Order.findOne(query);

        if (order) {
          order.payment.status = "completed";
          if (captureId) order.payment.paypalCaptureId = captureId;
          order.payment.paidAt = new Date();
          order.orderStatus = "paid";
          order.payment.rawDetails = resource;
          await order.save();
          console.log(`[PayPal Webhook] Order ${order.orderNumber} marked as PAID via Webhook.`);
        }
        break;
      }

      // 2. Buyer approved order on PayPal checkout
      case "CHECKOUT.ORDER.APPROVED": {
        const paypalOrderId = resource?.id;
        const order = await Order.findOne({ "payment.paypalOrderId": paypalOrderId });

        if (order && order.payment.status === "pending") {
          order.payment.status = "authorized";
          order.orderStatus = "processing";
          await order.save();
          console.log(`[PayPal Webhook] Order ${order.orderNumber} marked as AUTHORIZED.`);
        }
        break;
      }

      // 3. Payment was denied, declined, or voided
      case "PAYMENT.CAPTURE.DECLINED":
      case "PAYMENT.CAPTURE.DENIED":
      case "CHECKOUT.ORDER.DECLINED":
      case "CHECKOUT.ORDER.VOIDED": {
        const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id || resource?.id;
        const order = await Order.findOne({
          $or: [{ "payment.paypalOrderId": paypalOrderId }, { orderNumber: paypalOrderId }],
        });

        if (order && order.payment.status !== "completed") {
          order.payment.status = "failed";
          order.orderStatus = "cancelled";
          await order.save();
          console.log(`[PayPal Webhook] Order ${order.orderNumber} marked as FAILED/DECLINED.`);
        }
        break;
      }

      // 4. Payment was refunded
      case "PAYMENT.CAPTURE.REFUNDED": {
        const captureId = resource?.id;
        const order = await Order.findOne({ "payment.paypalCaptureId": captureId });

        if (order) {
          order.payment.status = "refunded";
          order.orderStatus = "refunded";
          await order.save();
          console.log(`[PayPal Webhook] Order ${order.orderNumber} marked as REFUNDED.`);
        }
        break;
      }

      default:
        // Ignore unhandled informational events
        break;
    }

    // Always respond 200 OK to PayPal so it doesn't retry sending the same webhook event
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("PayPal webhook processing error:", error);
    // Returning 200 avoids PayPal endlessly queueing retries on app errors
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}
