"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  UserPlus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Check,
  X,
  RefreshCw,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { generateMemorablePassword } from "@/lib/password-generator";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "admin",
  });

  // Availability checking states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Password generation state
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Edit password generation state
  const [showEditPasswordGenerator, setShowEditPasswordGenerator] =
    useState(false);
  const [editPasswordCopied, setEditPasswordCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
    // Generate initial password
    setGeneratedPassword(generateMemorablePassword());
  }, []);

  // Debounced availability check
  const checkAvailability = useCallback(
    async (field: "username" | "email", value: string) => {
      if (!value || value.length < 3) {
        if (field === "username") setUsernameAvailable(null);
        if (field === "email") setEmailAvailable(null);
        return;
      }

      // Don't check if we're editing a user and the value hasn't changed
      if (editingUser) {
        if (field === "username" && value === editingUser.username) {
          setUsernameAvailable(true);
          return;
        }
        if (field === "email" && value === editingUser.email) {
          setEmailAvailable(true);
          return;
        }
      }

      if (field === "username") setCheckingUsername(true);
      if (field === "email") setCheckingEmail(true);

      try {
        const response = await fetch("/pages/api/admin/check-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });

        const data = await response.json();

        if (data.success) {
          if (field === "username") {
            setUsernameAvailable(data.usernameAvailable);
          } else {
            setEmailAvailable(data.emailAvailable);
          }
        }
      } catch (error) {
        console.error("Error checking availability:", error);
      } finally {
        if (field === "username") setCheckingUsername(false);
        if (field === "email") setCheckingEmail(false);
      }
    },
    [editingUser]
  );

  // Debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username) {
        checkAvailability("username", formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, checkAvailability]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        checkAvailability("email", formData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, checkAvailability]);

  // Reset availability checks when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      setUsernameAvailable(null);
      setEmailAvailable(null);
      setPasswordCopied(false);
    }
  }, [isCreateDialogOpen]);

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

    // Validate availability before submission
    if (!usernameAvailable) {
      toast.error("El nombre de usuario no está disponible");
      return;
    }
    if (!emailAvailable) {
      toast.error("El email no está disponible");
      return;
    }

    try {
      const response = await fetch("/pages/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password: generatedPassword, // Use generated password
        }),
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
        setUsernameAvailable(null);
        setEmailAvailable(null);
        setGeneratedPassword(generateMemorablePassword());
        setPasswordCopied(false);
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

  const handleRegeneratePassword = () => {
    setGeneratedPassword(generateMemorablePassword());
    setPasswordCopied(false);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      toast.success("Contraseña copiada al portapapeles");
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar contraseña");
    }
  };

  const handleGenerateEditPassword = () => {
    const newPassword = generateMemorablePassword();
    setFormData({ ...formData, password: newPassword });
    setShowEditPasswordGenerator(true);
    setEditPasswordCopied(false);
  };

  const handleCopyEditPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setEditPasswordCopied(true);
      toast.success("Contraseña copiada al portapapeles");
      setTimeout(() => setEditPasswordCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar contraseña");
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
        setShowEditPasswordGenerator(false);
        setEditPasswordCopied(false);
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
    // Check if this is the last active admin
    const activeAdmins = users.filter(
      (u) => u.role === "admin" && u.is_active && u.id !== userId
    );

    if (activeAdmins.length === 0) {
      toast.error(
        "no puedes eliminar el último administrador activo del sistema"
      );
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/pages/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Usuario eliminado correctamente");
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Error al eliminar usuario");
      }
    } catch (error) {
      toast.error("Error al eliminar usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    // Check if trying to deactivate the last active admin
    if (user.is_active && user.role === "admin") {
      const activeAdmins = users.filter(
        (u) => u.role === "admin" && u.is_active && u.id !== user.id
      );

      if (activeAdmins.length === 0) {
        toast.error(
          "no puedes desactivar el último administrador activo del sistema"
        );
        return;
      }
    }

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

  // Helper function to check if user is the last active admin
  const isLastActiveAdmin = (user: User) => {
    if (user.role !== "admin" || !user.is_active) return false;

    const activeAdmins = users.filter((u) => u.role === "admin" && u.is_active);

    return activeAdmins.length === 1;
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
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    className={
                      usernameAvailable === false
                        ? "border-red-500"
                        : usernameAvailable === true
                        ? "border-green-500"
                        : ""
                    }
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-neutral-400" />
                    ) : usernameAvailable === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {usernameAvailable === false && (
                  <p className="text-xs text-red-500 lowercase">
                    este nombre de usuario ya está en uso
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="lowercase">
                  email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className={
                      emailAvailable === false
                        ? "border-red-500"
                        : emailAvailable === true
                        ? "border-green-500"
                        : ""
                    }
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingEmail ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-neutral-400" />
                    ) : emailAvailable === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : emailAvailable === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {emailAvailable === false && (
                  <p className="text-xs text-red-500 lowercase">
                    este email ya está en uso
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="generated-password" className="lowercase">
                  contraseña generada
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="generated-password"
                    value={generatedPassword}
                    readOnly
                    className="font-mono bg-neutral-900 text-neutral-100"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRegeneratePassword}
                    className="shrink-0"
                    title="generar nueva contraseña"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                    className="shrink-0"
                    title="copiar contraseña"
                  >
                    {passwordCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-neutral-400 lowercase">
                  contraseña segura y fácil de recordar. haz clic en refrescar
                  para generar otra.
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
              <Button
                type="submit"
                className="w-full lowercase"
                disabled={!usernameAvailable || !emailAvailable}
              >
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
                      setShowEditPasswordGenerator(false);
                      setEditPasswordCopied(false);
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
                    disabled={isLastActiveAdmin(user)}
                    title={
                      isLastActiveAdmin(user)
                        ? "último admin activo, no se puede desactivar"
                        : user.is_active
                        ? "desactivar usuario"
                        : "activar usuario"
                    }
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
                    onClick={() => {
                      setUserToDelete(user);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={isLastActiveAdmin(user)}
                    title={
                      isLastActiveAdmin(user)
                        ? "último admin activo, no se puede eliminar"
                        : "eliminar usuario"
                    }
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
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-password" className="lowercase">
                  nueva contraseña (opcional)
                </Label>
                {!showEditPasswordGenerator && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateEditPassword}
                    className="lowercase text-xs h-auto py-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    generar contraseña
                  </Button>
                )}
              </div>
              {showEditPasswordGenerator ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="edit-password"
                      value={formData.password}
                      readOnly
                      className="font-mono bg-neutral-900 text-neutral-100"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGenerateEditPassword}
                      className="shrink-0"
                      title="generar nueva contraseña"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyEditPassword}
                      className="shrink-0"
                      title="copiar contraseña"
                    >
                      {editPasswordCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditPasswordGenerator(false);
                      setFormData({ ...formData, password: "" });
                      setEditPasswordCopied(false);
                    }}
                    className="lowercase text-xs h-auto py-1"
                  >
                    <X className="h-3 w-3 mr-1" />
                    cancelar cambio de contraseña
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 lowercase">
                  deja vacío para mantener la contraseña actual, o genera una
                  nueva
                </p>
              )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-neutral-950 border border-red-900/50 rounded-none">
          <DialogHeader>
            <DialogTitle className="text-red-400 lowercase">
              eliminar usuario
            </DialogTitle>
            <DialogDescription className="text-neutral-400 lowercase">
              estás a punto de eliminar el usuario{" "}
              <span className="text-white font-bold">
                {userToDelete?.username}
              </span>
              . esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
              className="rounded-none border border-neutral-700"
              disabled={isDeleting}
            >
              cancelar
            </Button>
            <Button
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              className="rounded-none bg-red-900 hover:bg-red-800 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  eliminando...
                </>
              ) : (
                "eliminar usuario"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
