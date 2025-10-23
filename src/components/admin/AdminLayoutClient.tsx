"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/admin/Sidebar";
import { SiteHeader } from "@/components/admin/AdminHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  defaultOpen: boolean;
}

export function AdminLayoutClient({
  children,
  defaultOpen,
}: AdminLayoutClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const session = sessionStorage.getItem("isAdminAuthenticated");
    if (session) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/pages/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("isAdminAuthenticated", "true");
        setIsAuthenticated(true);
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    setIsAuthenticated(false);
  };

  if (!isClient) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171717] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-neutral-950/40 backdrop-blur-lg p-8 shadow-lg border border-neutral-800">
            <div className="mb-6">
              <h1 className="text-3xl font-['Playfair'] font-bold mb-2 lowercase text-white">
                administración
              </h1>
              <p className="text-sm text-neutral-400 lowercase">
                ingresa tus credenciales para acceder
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm lowercase text-neutral-300"
                >
                  usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm focus-visible:ring-0 focus-visible:border-primary text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm lowercase text-neutral-300"
                >
                  contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm focus-visible:ring-0 focus-visible:border-primary text-white"
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 lowercase">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-transparent hover:bg-neutral-600/20 rounded-none lowercase border border-neutral-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "iniciando sesión..." : "iniciar sesión"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dark">
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col mt-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
