"use client";

import { useState } from "react";
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
import { motion } from "framer-motion";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-['Playfair']">
                Administración
              </CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="font-['Quicksand']"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="font-['Quicksand']"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => setIsAuthenticated(false)} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [rollId, setRollId] = useState("");
  const [rollName, setRollName] = useState("");
  const [rollDate, setRollDate] = useState("");
  const [filmstock, setFilmstock] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      setNotes(new Array(fileArray.length).fill(""));
    }
  };

  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...notes];
    newNotes[index] = value;
    setNotes(newNotes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("rollId", rollId);
      formData.append("rollName", rollName);
      formData.append("rollDate", rollDate);
      formData.append("filmstock", filmstock);

      files.forEach((file) => {
        formData.append("files", file);
      });

      notes.forEach((note) => {
        formData.append("notes", note);
      });

      const response = await fetch("/pages/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadSuccess(true);
        // Limpiar el formulario
        setRollId("");
        setRollName("");
        setRollDate("");
        setFilmstock("");
        setFiles([]);
        setNotes([]);
        // Reset file input
        const fileInput = document.getElementById("files") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Error al subir el roll");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-['Playfair'] font-bold">
              Panel de Administración
            </h1>
            <Button variant="outline" onClick={onLogout}>
              Cerrar sesión
            </Button>
          </div>

          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
            >
              <p className="text-green-800 dark:text-green-200">
                ✓ Roll subido exitosamente
              </p>
            </motion.div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-['Playfair']">
                Crear nuevo roll
              </CardTitle>
              <CardDescription>
                Completa la información y sube las imágenes para crear un nuevo
                roll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollId">ID del Roll *</Label>
                    <Input
                      id="rollId"
                      type="text"
                      value={rollId}
                      onChange={(e) => setRollId(e.target.value)}
                      required
                      placeholder="ej: roll-001"
                      className="font-['Quicksand']"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollName">Nombre del Roll *</Label>
                    <Input
                      id="rollName"
                      type="text"
                      value={rollName}
                      onChange={(e) => setRollName(e.target.value)}
                      required
                      placeholder="ej: Santiago Centro"
                      className="font-['Quicksand']"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollDate">Fecha</Label>
                    <Input
                      id="rollDate"
                      type="text"
                      value={rollDate}
                      onChange={(e) => setRollDate(e.target.value)}
                      placeholder="ej: Diciembre 2024"
                      className="font-['Quicksand']"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filmstock">Filmstock</Label>
                    <Input
                      id="filmstock"
                      type="text"
                      value={filmstock}
                      onChange={(e) => setFilmstock(e.target.value)}
                      placeholder="ej: Kodak Portra 400"
                      className="font-['Quicksand']"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="files">Imágenes *</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="font-['Quicksand'] cursor-pointer"
                  />
                  {files.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {files.length} archivo(s) seleccionado(s)
                    </p>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="space-y-4">
                    <Label>Notas para cada imagen (opcional)</Label>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="border border-border rounded-lg p-3 space-y-2"
                        >
                          <p className="text-sm font-medium truncate">
                            {index + 1}. {file.name}
                          </p>
                          <Input
                            type="text"
                            value={notes[index] || ""}
                            onChange={(e) =>
                              handleNoteChange(index, e.target.value)
                            }
                            placeholder="Añadir nota para esta imagen"
                            className="font-['Quicksand'] text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUploading}
                  size="lg"
                >
                  {isUploading ? "Subiendo..." : "Crear Roll"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
