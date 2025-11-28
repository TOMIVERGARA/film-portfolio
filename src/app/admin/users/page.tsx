"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  last_login: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "admin",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/pages/api/admin/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/pages/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Usuario creado correctamente");
        setIsCreateDialogOpen(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          full_name: "",
          role: "admin",
        });
        fetchUsers();
      } else {
        if (data.errors) {
          data.errors.forEach((error: string) => toast.error(error));
        } else {
          toast.error(data.error || "Error al crear usuario");
        }
      }
    } catch (error) {
      toast.error("Error al crear usuario");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/pages/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Usuario actualizado correctamente");
        setEditingUser(null);
        setFormData({
          username: "",
          email: "",
          password: "",
          full_name: "",
          role: "admin",
        });
        fetchUsers();
      } else {
        if (data.errors) {
          data.errors.forEach((error: string) => toast.error(error));
        } else {
          toast.error(data.error || "Error al actualizar usuario");
        }
      }
    } catch (error) {
      toast.error("Error al actualizar usuario");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`/pages/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Usuario eliminado correctamente");
        fetchUsers();
      } else {
        toast.error(data.error || "Error al eliminar usuario");
      }
    } catch (error) {
      toast.error("Error al eliminar usuario");
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch(`/pages/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          user.is_active ? "Usuario desactivado" : "Usuario activado"
        );
        fetchUsers();
      } else {
        toast.error(data.error || "Error al actualizar usuario");
      }
    } catch (error) {
      toast.error("Error al actualizar usuario");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-400">cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lowercase">gestión de usuarios</h1>
          <p className="text-sm text-neutral-400 lowercase">
            administra los usuarios del sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="lowercase">
              <UserPlus className="mr-2 h-4 w-4" />
              nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="lowercase">
                crear nuevo usuario
              </DialogTitle>
              <DialogDescription className="lowercase">
                completa los datos del nuevo usuario
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="lowercase">
                  nombre de usuario
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="lowercase">
                  email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="lowercase">
                  contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-neutral-400 lowercase">
                  mínimo 8 caracteres, incluir mayúsculas, minúsculas y números
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name" className="lowercase">
                  nombre completo (opcional)
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full lowercase">
                crear usuario
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 lowercase">
                    {user.username}
                    {user.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="lowercase">
                    {user.email}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingUser(user);
                      setFormData({
                        username: user.username,
                        email: user.email,
                        password: "",
                        full_name: user.full_name || "",
                        role: user.role,
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.is_active ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400 lowercase">nombre completo</p>
                  <p className="lowercase">{user.full_name || "-"}</p>
                </div>
                <div>
                  <p className="text-neutral-400 lowercase">rol</p>
                  <p className="lowercase">{user.role}</p>
                </div>
                <div>
                  <p className="text-neutral-400 lowercase">creado</p>
                  <p className="lowercase">
                    {new Date(user.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 lowercase">último acceso</p>
                  <p className="lowercase">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString("es-ES")
                      : "nunca"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="lowercase">editar usuario</DialogTitle>
            <DialogDescription className="lowercase">
              modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="lowercase">
                email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="lowercase">
                nueva contraseña (dejar vacío para mantener)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-full_name" className="lowercase">
                nombre completo
              </Label>
              <Input
                id="edit-full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full lowercase">
              actualizar usuario
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
