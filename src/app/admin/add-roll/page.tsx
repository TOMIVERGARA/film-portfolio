"use client";

import { useEffect, useRef, useState } from "react";
import { Zap, Trash } from "lucide-react";
import { showSuccess, showError } from "@/components/ui/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function AddRollPage() {
  const [rollId, setRollId] = useState("");
  const [rollName, setRollName] = useState("");
  const [rollDate, setRollDate] = useState("");
  const [filmstock, setFilmstock] = useState("");
  const [files, setFiles] = useState<
    {
      file: File;
      preview: string;
      note: string;
      progress: number;
      originalSize: number;
      compressedSize: number;
    }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const generateId = () => {
    return `roll-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  };

  useEffect(() => {
    setRollId(generateId());
  }, []);

  // Compress / resize image on the client to try to respect Cloudinary free plan limits
  const compressImage = async (
    file: File,
    {
      maxDimension = 2500,
      maxBytes = 9_500_000,
    }: { maxDimension?: number; maxBytes?: number } = {}
  ): Promise<Blob> => {
    try {
      // Create an ImageBitmap (faster than Image element)
      const imageBitmap = await createImageBitmap(file);

      let { width, height } = imageBitmap;

      // If either dimension is larger than maxDimension, scale down keeping aspect
      let scale = 1;
      if (Math.max(width, height) > maxDimension) {
        scale = maxDimension / Math.max(width, height);
      }

      let targetWidth = Math.round(width * scale);
      let targetHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

      // Try WebP first (usually better compression), then JPEG fallback
      const tryFormats = ["image/webp", "image/jpeg"];

      for (const fmt of tryFormats) {
        // iterative quality reduction
        for (let q = 0.92; q >= 0.5; q -= 0.08) {
          // toBlob is callback-based
          const blob: Blob | null = await new Promise((res) =>
            canvas.toBlob(res, fmt, q)
          );
          if (!blob) continue;
          if (blob.size <= maxBytes) return blob;
          // otherwise continue decreasing quality
        }

        // If not under size, try downscaling further by halving dimensions until small enough or too small
        let downscale = 0.9;
        let currentWidth = targetWidth;
        let currentHeight = targetHeight;
        while (downscale > 0.2) {
          currentWidth = Math.round(currentWidth * 0.8);
          currentHeight = Math.round(currentHeight * 0.8);
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          ctx.clearRect(0, 0, currentWidth, currentHeight);
          ctx.drawImage(imageBitmap, 0, 0, currentWidth, currentHeight);
          const blob: Blob | null = await new Promise((res) =>
            canvas.toBlob(res, fmt, 0.78)
          );
          if (blob && blob.size <= maxBytes) return blob;
          downscale -= 0.1;
        }
      }

      // If all else fails, return original file as blob
      return file;
    } catch (err) {
      console.error("compressImage error", err);
      return file;
    }
  };

  const makeFileItems = async (fileList: FileList | null) => {
    if (!fileList) return [];
    const arr = Array.from(fileList);
    const results: {
      file: File;
      preview: string;
      note: string;
      progress: number;
      originalSize: number;
      compressedSize: number;
    }[] = [];

    for (const f of arr) {
      // If file is already small enough, keep it
      const maxBytes = 9_500_000; // target under 9.5MB for Cloudinary free limit
      let finalBlob: Blob;
      if (f.size > maxBytes) {
        finalBlob = await compressImage(f, { maxDimension: 2500, maxBytes });
      } else {
        finalBlob = f;
      }

      // If compressImage returned the original File, we may already have a File object; otherwise build a File
      const finalFile =
        finalBlob instanceof File
          ? finalBlob
          : new File([finalBlob], f.name, { type: finalBlob.type || f.type });
      const preview = URL.createObjectURL(finalBlob);
      results.push({
        file: finalFile,
        preview,
        note: "",
        progress: 0,
        originalSize: f.size,
        compressedSize: finalFile.size,
      });
    }

    return results;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes && bytes !== 0) return "-";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newItems = await makeFileItems(e.target.files);
    setFiles((prev) => [...prev, ...newItems]);
    // reset native input so same file can be selected again if needed
    if (e.target) e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newItems = await makeFileItems(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleNoteChange = (index: number, value: string) => {
    setFiles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], note: value };
      return copy;
    });
  };

  // Remove a file from the list (revokes preview URL)
  const removeFile = (index: number) => {
    setFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      showError("No hay imágenes para subir");
      return;
    }
    setIsUploading(true);

    // NOTE / Assumption: backend accepts multiple requests referencing the same rollId
    // We upload files sequentially and track progress per file.
    try {
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const fd = new FormData();
          fd.append("rollId", rollId);
          fd.append("rollName", rollName);
          fd.append("rollDate", rollDate);
          fd.append("filmstock", filmstock);
          fd.append("files", item.file);
          fd.append("notes", item.note || "");

          xhr.open("POST", "/pages/api/admin/upload");

          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const percent = Math.round((ev.loaded / ev.total) * 100);
              setFiles((prev) => {
                const copy = [...prev];
                copy[i] = { ...copy[i], progress: percent };
                return copy;
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles((prev) => {
                const copy = [...prev];
                copy[i] = { ...copy[i], progress: 100 };
                return copy;
              });
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(fd);
        });
      }

      // show success notification (uses sonner/notify used across app)
      showSuccess("✓ roll subido exitosamente");
      // limpiar formulario (regenerar id)
      setRollId(generateId());
      setRollName("");
      setRollDate("");
      setFilmstock("");
      // revoke previews
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      showError("Error al subir el roll");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* notifications use showSuccess / showError (sonner) */}

        {/* Form (not enclosed in a card per request) */}
        <div className="p-0">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2 lowercase text-white">
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
                  readOnly
                  aria-readonly
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

            {/* Dropzone */}
            <div>
              <Label className="text-sm lowercase text-neutral-300">
                imágenes *
              </Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="mt-2 p-6 border border-dashed border-neutral-700 bg-transparent rounded-none cursor-pointer text-neutral-300"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Drop images here or click to select"
              >
                <input
                  ref={fileInputRef}
                  id="files"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-sm lowercase">
                  arrastra las imágenes aquí o haz click para seleccionar
                </p>
                {files.length > 0 && (
                  <p className="text-sm text-neutral-400 lowercase mt-2">
                    {files.length} archivo(s) seleccionado(s)
                  </p>
                )}
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {files.map((item, index) => (
                    <div
                      key={index}
                      className="bg-neutral-950/30 p-2 space-y-2 border border-neutral-800"
                    >
                      <div className="relative w-full h-28 bg-neutral-900/20 flex items-center justify-center overflow-hidden group">
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="object-cover w-full h-full"
                        />

                        {/* overlay: aparece al hover exacto sobre la imagen, doble click para eliminar */}
                        <div
                          className="absolute inset-0 bg-neutral-800/60 flex flex-col items-center justify-center text-xs text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onDoubleClick={() => removeFile(index)}
                          role="button"
                          aria-label={`Eliminar ${item.file.name}`}
                          title="Doble click para eliminar"
                        >
                          <Trash size={18} className="mb-1" />
                          <span className="select-none">
                            doble click para eliminar
                          </span>
                        </div>
                      </div>
                      <p className="text-xs truncate lowercase text-neutral-300">
                        {index + 1}. {item.file.name}
                      </p>
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) =>
                          handleNoteChange(index, e.target.value)
                        }
                        placeholder="click añadir nota..."
                        className="bg-transparent border-b border-neutral-700 text-sm text-neutral-400 lowercase outline-none "
                      />

                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
                        <Zap size={14} className="text-green-400" />
                        <span>
                          {formatBytes(item.compressedSize)} •{" "}
                          {item.originalSize > 0
                            ? `${Math.max(
                                0,
                                Math.round(
                                  (1 -
                                    item.compressedSize / item.originalSize) *
                                    100
                                )
                              )}% comprimido`
                            : "-"}
                        </span>
                      </div>
                      {item.progress > 0 && (
                        <div className="w-full bg-neutral-900 h-2 mt-1">
                          <div
                            className="bg-green-400 h-2"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
