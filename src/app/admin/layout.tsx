import "../globals.css";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return <AdminLayoutClient defaultOpen={defaultOpen}>{children}</AdminLayoutClient>;
}
