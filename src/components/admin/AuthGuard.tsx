"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if we're on an admin route
    if (pathname?.startsWith("/admin")) {
      const token = localStorage.getItem("auth-token");

      // If no token, redirect to login
      if (!token) {
        router.push("/login");
      }
    }

    // If on login page with valid token, redirect to admin
    if (pathname === "/login") {
      const token = localStorage.getItem("auth-token");
      if (token) {
        router.push("/admin");
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
