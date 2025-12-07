"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/api-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if we're on an admin route
    if (pathname?.startsWith("/admin")) {
      // If no token, redirect to login
      if (!isAuthenticated()) {
        router.push("/login");
      }
    }

    // If on login page with valid token, redirect to admin
    if (pathname === "/login") {
      if (isAuthenticated()) {
        router.push("/admin");
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
