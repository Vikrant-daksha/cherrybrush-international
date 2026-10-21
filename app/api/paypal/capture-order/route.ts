import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/order.model";
import { capturePayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/capture-order
 *
 * RESTful endpoint to capture payment for an approved PayPal order.
 * Includes complete idempotency protection to prevent double charges.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { paypalOrderId, orderId, idempotencyKey } = body;

    if (!paypalOrderId) {
      return NextResponse.json(
        { success: false, error: "paypalOrderId is required to capture payment." },
        { status: 400 }
      );
    }

    // 1. Locate the corresponding MongoDB Order snapshot BEFORE charging
    const query = orderId
      ? { $or: [{ _id: orderId }, { orderNumber: orderId }, { "payment.paypalOrderId": paypalOrderId }] }
      : { "payment.paypalOrderId": paypalOrderId };

    const orderDoc = await Order.findOne(query);

    // 2. IDEMPOTENCY GUARD: If order is ALREADY paid in our database, return immediately!
    if (orderDoc && orderDoc.payment.status === "completed") {
      return NextResponse.json({
        success: true,
        alreadyCaptured: true,
        message: "This order has already been successfully captured and paid.",
        status: "COMPLETED",
        captureId: orderDoc.payment.paypalCaptureId,
        payer: {
          emailAddress: orderDoc.payment.paypalPayerEmail,
          payerId: orderDoc.payment.paypalPayerId,
        },
        order: orderDoc,
      });
    }

    // 3. Capture funds via PayPal REST API with idempotency header
    const captureKey = idempotencyKey || orderDoc?.idempotencyKey || orderDoc?.orderNumber || `capture-${paypalOrderId}`;
    let captureResult;

    try {
      captureResult = await capturePayPalOrder(paypalOrderId, captureKey);
    } catch (captureErr: any) {
      // If PayPal reports ORDER_ALREADY_CAPTURED (e.g. from network retry or parallel request)
      if (captureErr.message?.includes("ORDER_ALREADY_CAPTURED")) {
        if (orderDoc) {
          orderDoc.payment.status = "completed";
          orderDoc.orderStatus = "paid";
          await orderDoc.save();
        }
        return NextResponse.json({
          success: true,
          alreadyCaptured: true,
          status: "COMPLETED",
          order: orderDoc || null,
        });
      }
      throw captureErr;
    }

    // 4. Update the MongoDB Order Snapshot with final payment details
    if (orderDoc) {
      const isCompleted = captureResult.status === "COMPLETED";

      orderDoc.payment.status = isCompleted ? "completed" : "pending";
      orderDoc.payment.paypalCaptureId = captureResult.captureId;
      orderDoc.payment.paypalPayerId = captureResult.payer?.payerId;
      orderDoc.payment.paypalPayerEmail = captureResult.payer?.emailAddress;
      orderDoc.payment.rawDetails = captureResult.raw;

      if (isCompleted) {
        orderDoc.payment.paidAt = new Date();
        orderDoc.orderStatus = "paid";

        if (orderDoc.pricing?.couponCode) {
          try {
            const { incrementCouponUsage } = await import("@/lib/couponService");
            await incrementCouponUsage(orderDoc.pricing.couponCode);
          } catch (e) {
            console.warn("Could not increment coupon usage count:", e);
          }
        }
      }

      await orderDoc.save();
    }

    return NextResponse.json({
      success: true,
      status: captureResult.status,
      captureId: captureResult.captureId,
      payer: captureResult.payer,
      order: orderDoc || null,
    });
  } catch (error: any) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to capture PayPal order.",
      },
      { status: 500 }
    );
  }
}
