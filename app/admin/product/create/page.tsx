import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateProductForm from "./CreateProductForm";

export const metadata = {
  title: "Create Product | Cherrybrush Admin",
  description: "Secure administrator product management",
};

export default async function AdminCreateProductPage() {
  // 🔒 Server-Side Security Guard:
  // Checked on server before sending any HTML to browser
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return <CreateProductForm admin={admin} />;
}
