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
