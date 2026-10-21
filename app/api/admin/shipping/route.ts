import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import ShippingMethod from "@/lib/shipping.model";
import { getStoreBaseCurrency } from "@/lib/storeSettings";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/shipping
 * List all shipping methods for the admin management dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    const methods = await ShippingMethod.find().sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: methods,
    });
  } catch (error: any) {
    console.error("GET /api/admin/shipping error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load shipping methods" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shipping
 * Create or update a shipping method (price, estimated delivery time, carrier, regions).
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const {
      _id,
      name,
      slug,
      description,
      price,
      currency,
      estimatedDays,
      freeShippingThreshold,
      regions,
      carrier,
      isActive,
      isDefault,
      sortOrder,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Shipping method name is required" },
        { status: 400 }
      );
    }

    if (price === undefined || typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { success: false, error: "Valid non-negative shipping price is required" },
        { status: 400 }
      );
    }

    const baseCurrency = currency || (await getStoreBaseCurrency());

    const updatePayload: any = {
      name: name.trim(),
      description: description || "",
      price: Number(price),
      currency: baseCurrency.toUpperCase(),
      estimatedDays: {
        min: Number(estimatedDays?.min ?? 3),
        max: Number(estimatedDays?.max ?? 5),
        unit: estimatedDays?.unit || "business_days",
        label: estimatedDays?.label || `${estimatedDays?.min ?? 3}–${estimatedDays?.max ?? 5} Business Days`,
      },
      freeShippingThreshold:
        freeShippingThreshold !== undefined && freeShippingThreshold !== null && freeShippingThreshold !== ""
          ? Number(freeShippingThreshold)
          : null,
      regions: {
        type: regions?.type || "all",
        countries: Array.isArray(regions?.countries)
          ? regions.countries.map((c: string) => c.toUpperCase().trim())
          : [],
      },
      carrier: carrier ? carrier.trim() : "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isDefault: Boolean(isDefault),
      sortOrder: Number(sortOrder || 0),
    };

    if (slug) {
      updatePayload.slug = slug.toLowerCase().trim();
    }

    let result;
    if (_id) {
      result = await ShippingMethod.findByIdAndUpdate(_id, updatePayload, {
        new: true,
        runValidators: true,
      });
      if (!result) {
        return NextResponse.json(
          { success: false, error: "Shipping method not found" },
          { status: 404 }
        );
      }
    } else {
      result = await ShippingMethod.create(updatePayload);
    }

    // If marked as default, unset other defaults
    if (updatePayload.isDefault) {
      await ShippingMethod.updateMany(
        { _id: { $ne: result._id } },
        { $set: { isDefault: false } }
      );
    }

    return NextResponse.json({
      success: true,
      message: _id
        ? "Shipping method updated successfully"
        : "Shipping method created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/admin/shipping error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save shipping method" },
      { status: 500 }
    );
  }
}
