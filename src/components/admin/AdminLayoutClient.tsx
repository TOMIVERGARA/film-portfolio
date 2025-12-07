"use client";

import { AppSidebar } from "@/components/admin/Sidebar";
import { SiteHeader } from "@/components/admin/AdminHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  defaultOpen: boolean;
}

export function AdminLayoutClient({
  children,
  defaultOpen,
}: AdminLayoutClientProps) {
  return (
    <div className="dark">
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
        className="h-svh overflow-hidden"
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-y-auto">
          <SiteHeader />
          <div className="flex flex-1 flex-col mt-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
