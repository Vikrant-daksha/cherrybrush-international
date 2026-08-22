import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminProductsClient admin={admin} />;
}
