import "../globals.css";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { cookies } from "next/headers";

export const metadata = {
  title: "portfolio - admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <AuthGuard>
      <AdminLayoutClient defaultOpen={defaultOpen}>
        {children}
      </AdminLayoutClient>
    </AuthGuard>
  );
}
