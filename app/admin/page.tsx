import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminDashboardClient from "./AdminDashboardClient";

interface AdminPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const tab = resolvedParams?.tab;

  const validTabs = ["orders", "settings", "users", "products"] as const;
  const initialTab = validTabs.includes(tab as any)
    ? (tab as "orders" | "settings" | "users" | "products")
    : "orders";

  return <AdminDashboardClient admin={admin} initialTab={initialTab} />;
}
