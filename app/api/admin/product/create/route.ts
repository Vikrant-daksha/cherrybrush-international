import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import Product from "@/lib/product.model";
import { generateUniqueSlug } from "@/lib/slug";

export async function POST(req: NextRequest) {
  // 1. Verify Admin Session
  const admin = await getAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Access denied. Admins only." },
      { status: 401 },
    );
  }

  try {
    await connectDB();

    const body = await req.json();
    const {
      productName,
      name,
      slug,
      customSlug,
      productDescription,
      description,
      productPrice,
      price,
      productCollection,
      collection,
      productImage,
      productImages,
      images,
      productSizes,
      sizes,
      productColors,
      colors,
      productShapes,
      shapes,
      style,
      badge,
    } = body;

    // Normalizing field names for flexibility
    const finalName = productName || name;
    const finalDescription = productDescription || description;
    const finalPrice =
      productPrice !== undefined ? Number(productPrice) : Number(price);
    const finalCollection = productCollection || collection;

    // Normalize images into an array of URLs
    let finalImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      finalImages = images;
    } else if (Array.isArray(productImages) && productImages.length > 0) {
      finalImages = productImages;
    } else if (Array.isArray(productImage) && productImage.length > 0) {
      finalImages = productImage;
    } else if (typeof productImage === "string" && productImage.trim()) {
      finalImages = [productImage.trim()];
    }

    // Validation
    if (
      !finalName ||
      !finalDescription ||
      !finalCollection ||
      finalImages.length === 0 ||
      isNaN(finalPrice)
    ) {
      return NextResponse.json(
        {
          error:
            "All required fields must be provided (name, description, price, collection, and at least one image URL)",
        },
        { status: 400 },
      );
    }

    if (finalPrice < 0) {
      return NextResponse.json(
        { error: "Product price cannot be negative" },
        { status: 400 },
      );
    }

    // Generate or format unique slug
    const finalSlug = await generateUniqueSlug(
      Product,
      finalName,
      customSlug || slug,
    );

    // If marking as Hero product, reset previous hero product
    if (body.isHero) {
      await Product.updateMany({ isHero: true }, { isHero: false });
    }

    // 2. Create the Product in MongoDB
    const product = await Product.create({
      name: finalName,
      slug: finalSlug,
      description: finalDescription,
      price: finalPrice,
      collection: finalCollection,
      images: finalImages,
      sizes: productSizes || sizes,
      colors: productColors || colors || [],
      shapes: productShapes || shapes,
      lengths: body.lengths,
      style,
      badge,
      isHero: Boolean(body.isHero),
      isFeatured: Boolean(body.isFeatured),
      packageType: body.packageType,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create Product API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 },
    );
  }
}
