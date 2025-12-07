"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAuthToken, authenticatedPost } from "@/lib/api-client";

const getPageTitle = (pathname: string): string => {
  if (pathname === "/admin") return "home";
  if (pathname === "/admin/rolls") return "rolls";
  if (pathname === "/admin/add-roll") return "add roll";
  if (pathname === "/admin/metrics") return "metrics";
  if (pathname === "/admin/export") return "export";
  if (pathname === "/admin/users") return "users";
  if (pathname.startsWith("/admin/rolls/")) return "roll details";
  return "admin";
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getPageTitle(pathname || "/admin");

  const handleLogout = async () => {
    try {
      // Call logout endpoint to revoke session
      await authenticatedPost("/pages/api/admin/logout", {}).catch(() => {
        // Ignore errors, still clear token locally
      });

      // Clear token using centralized function
      clearAuthToken();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Still clear token and redirect even if endpoint fails
      clearAuthToken();
      router.push("/login");
    }
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
