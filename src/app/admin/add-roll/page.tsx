"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function AddRollPage() {
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
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Success Message */}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/20 backdrop-blur-sm p-4 border border-green-400/20"
          >
            <p className="text-green-400 lowercase">
              ✓ roll subido exitosamente
            </p>
          </motion.div>
        )}

        {/* Form Card */}
        <div className="bg-neutral-950/40 backdrop-blur-lg p-8 shadow-lg border border-neutral-800">
          <div className="mb-6">
            <h2 className="text-2xl font-['Playfair'] font-bold mb-2 lowercase text-white">
              crear nuevo roll
            </h2>
            <p className="text-sm text-neutral-400 lowercase">
              completa la información y sube las imágenes para crear un nuevo
              roll
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="rollId"
                  className="text-sm lowercase text-neutral-300"
                >
                  id del roll *
                </Label>
                <Input
                  id="rollId"
                  type="text"
                  value={rollId}
                  onChange={(e) => setRollId(e.target.value)}
                  required
                  placeholder="ej: roll-001"
                  className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm focus-visible:ring-0 focus-visible:border-primary text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="rollName"
                  className="text-sm lowercase text-neutral-300"
                >
                  nombre del roll *
                </Label>
                <Input
                  id="rollName"
                  type="text"
                  value={rollName}
                  onChange={(e) => setRollName(e.target.value)}
                  required
                  placeholder="ej: Santiago Centro"
                  className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm focus-visible:ring-0 focus-visible:border-primary text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="rollDate"
                  className="text-sm lowercase text-neutral-300"
                >
                  fecha
                </Label>
                <Input
                  id="rollDate"
                  type="text"
                  value={rollDate}
                  onChange={(e) => setRollDate(e.target.value)}
                  placeholder="ej: Diciembre 2024"
                  className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm focus-visible:ring-0 focus-visible:border-primary text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="filmstock"
                  className="text-sm lowercase text-neutral-300"
                >
                  filmstock
                </Label>
                <Input
                  id="filmstock"
                  type="text"
                  value={filmstock}
                  onChange={(e) => setFilmstock(e.target.value)}
                  placeholder="ej: Kodak Portra 400"
                  className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm focus-visible:ring-0 focus-visible:border-primary text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="files"
                className="text-sm lowercase text-neutral-300"
              >
                imágenes *
              </Label>
              <Input
                id="files"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                required
                className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm cursor-pointer focus-visible:ring-0 focus-visible:border-primary text-white file:text-neutral-400"
              />
              {files.length > 0 && (
                <p className="text-sm text-neutral-400 lowercase">
                  {files.length} archivo(s) seleccionado(s)
                </p>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm lowercase text-neutral-300">
                  notas para cada imagen (opcional)
                </Label>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="bg-neutral-950/30 backdrop-blur-sm p-4 space-y-2 border border-neutral-800"
                    >
                      <p className="text-sm font-medium truncate lowercase text-neutral-300">
                        {index + 1}. {file.name}
                      </p>
                      <Input
                        type="text"
                        value={notes[index] || ""}
                        onChange={(e) =>
                          handleNoteChange(index, e.target.value)
                        }
                        placeholder="añadir nota para esta imagen"
                        className="bg-transparent border-neutral-700 rounded-none backdrop-blur-sm text-sm focus-visible:ring-0 focus-visible:border-primary text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-transparent hover:bg-neutral-600/20 rounded-none lowercase border border-neutral-700 text-white"
              disabled={isUploading}
              size="lg"
            >
              {isUploading ? "subiendo..." : "crear roll"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
