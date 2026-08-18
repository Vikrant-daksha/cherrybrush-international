import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

/**
 * Configure Cloudinary with support for either individual keys or CLOUDINARY_URL
 */
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/['"]/g, "").trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/['"]/g, "").trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/['"]/g, "").trim();
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.replace(/['"]/g, "").trim();

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true,
    });
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  } else {
    console.error("❌ Cloudinary credentials missing in .env.local! Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET or CLOUDINARY_URL.");
  }

  return cloudinary;
}

/**
 * Upload an image Buffer to Cloudinary
 * @param buffer - File data as a Node Buffer
 * @param folder - Cloudinary folder path
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "cherrybrush/products"
): Promise<UploadApiResponse> {
  const cld = getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" }, // Automatic CDN webp/avif compression
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary Stream Error:", error);
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export default cloudinary;
