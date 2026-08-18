import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  // 1. Verify Admin Authentication
  const admin = await getAdminSession(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Access denied. Admins only." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    // Fallback: also check for single "file" or "image" field
    if (files.length === 0) {
      const singleFile = formData.get("image") || formData.get("file");
      if (singleFile && singleFile instanceof File) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No image files provided in form data" },
        { status: 400 }
      );
    }

    // 2. Upload each file to Cloudinary in parallel
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadToCloudinary(buffer, "cherrybrush/products");
      return result.secure_url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload images to Cloudinary" },
      { status: 500 }
    );
  }
}
