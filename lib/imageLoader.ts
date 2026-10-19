/**
 * Custom Cloudinary loader for Next.js Image component.
 * Transforms Cloudinary URLs directly on the client CDN rather than proxying through Next.js Node server.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src) return "/product.png";
  if (src.startsWith("/")) return src; // local public asset

  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    // Insert Cloudinary dynamic transformation parameters (w_width, q_auto, f_auto)
    const params = `f_auto,q_${quality || "auto"},w_${width}`;
    return src.replace("/upload/", `/upload/${params}/`);
  }

  return src;
}

/**
 * Generates an optimized thumbnail URL using Cloudinary on-the-fly transformations.
 * Downsamples high-resolution images server-side on Cloudinary's CDN to prevent detail bleeding,
 * moiré patterns, and excessive memory/network overhead in small frames.
 */
export function getCloudinaryThumbnail(
  src?: string,
  width: number = 240,
  height: number = 240
): string {
  if (!src) return "/product.png";
  if (src.startsWith("/")) return src;

  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    // Check if the URL already contains transformation flags
    const uploadIndex = src.indexOf("/upload/");
    const afterUpload = src.slice(uploadIndex + 8);
    if (
      afterUpload.startsWith("c_") ||
      afterUpload.startsWith("w_") ||
      afterUpload.startsWith("f_auto")
    ) {
      return src;
    }

    const params = `c_fill,g_auto,w_${width},h_${height},q_auto,f_auto`;
    return src.replace("/upload/", `/upload/${params}/`);
  }

  return src;
}
