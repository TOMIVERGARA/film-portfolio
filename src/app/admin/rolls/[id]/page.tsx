"use client";

import React, { useEffect, useRef, useState } from "react";
import { showSuccess, showError } from "@/components/ui/notify";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Zap, Trash, PlusCircleIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";

type Photo = {
  url: string;
  width?: number;
  photo_metadata?: { public_id?: string; notes?: string };
};

type Roll = {
  id: string;
  metadata: {
    name?: string;
    date?: string;
    filmstock?: string;
  };
  photos: Photo[];
};

export default function RollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [roll, setRoll] = useState<Roll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftNote, setDraftNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const lastTapRef = useRef<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState<string>("");
  // --- add-photos sheet state ---
  const [sheetOpen, setSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newFiles, setNewFiles] = useState<
    {
      file: File;
      preview: string;
      note: string;
      progress: number;
      originalSize: number;
      compressedSize: number;
    }[]
  >([]);
  const [isUploadingNew, setIsUploadingNew] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchRoll() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/pages/api/photos");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const found = (data || []).find((r: any) => r.id === id) as
          | Roll
          | undefined;
        if (mounted) setRoll(found || null);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Error cargando el roll");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) fetchRoll();

    return () => {
      mounted = false;
    };
  }, [id]);

  // --- helper functions copied/adapted from add-roll page ---
  const compressImage = async (
    file: File,
    {
      maxDimension = 2500,
      maxBytes = 9_500_000,
    }: { maxDimension?: number; maxBytes?: number } = {}
  ): Promise<Blob> => {
    try {
      const imageBitmap = await createImageBitmap(file);

      let { width, height } = imageBitmap;
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

      const tryFormats = ["image/webp", "image/jpeg"];

      for (const fmt of tryFormats) {
        for (let q = 0.92; q >= 0.5; q -= 0.08) {
          const blob: Blob | null = await new Promise((res) =>
            canvas.toBlob(res, fmt, q)
          );
          if (!blob) continue;
          if (blob.size <= maxBytes) return blob;
        }

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
      const maxBytes = 9_500_000;
      let finalBlob: Blob;
      if (f.size > maxBytes) {
        finalBlob = await compressImage(f, { maxDimension: 2500, maxBytes });
      } else {
        finalBlob = f;
      }

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

  const handleNewFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newItems = await makeFileItems(e.target.files);
    setNewFiles((prev) => [...prev, ...newItems]);
    if (e.target) e.target.value = "";
  };

  const handleNewDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newItems = await makeFileItems(e.dataTransfer.files);
    setNewFiles((prev) => [...prev, ...newItems]);
  };

  const handleNewNoteChange = (index: number, value: string) => {
    setNewFiles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], note: value };
      return copy;
    });
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  };

  const handleUploadNew = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newFiles.length === 0) {
      showError("No hay imágenes para subir");
      return;
    }
    setIsUploadingNew(true);

    try {
      for (let i = 0; i < newFiles.length; i++) {
        const item = newFiles[i];
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const fd = new FormData();
          fd.append("rollId", roll?.id || id);
          fd.append("rollName", roll?.metadata?.name || "");
          fd.append("rollDate", roll?.metadata?.date || "");
          fd.append("filmstock", roll?.metadata?.filmstock || "");
          fd.append("files", item.file);
          fd.append("notes", item.note || "");

          xhr.open("POST", "/pages/api/admin/upload");

          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const percent = Math.round((ev.loaded / ev.total) * 100);
              setNewFiles((prev) => {
                const copy = [...prev];
                copy[i] = { ...copy[i], progress: percent };
                return copy;
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setNewFiles((prev) => {
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

      showSuccess("Imágenes añadidas");
      // cleanup
      newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setNewFiles([]);
      setSheetOpen(false);
    } catch (err) {
      console.error(err);
      showError("Error al subir las imágenes");
    } finally {
      setIsUploadingNew(false);
    }
  };

  if (loading) {
    return (
      <div className="w-10/12 mx-auto p-6">
        <div className="text-neutral-400">Cargando roll...</div>
      </div>
    );
  }

  if (error) {
    return <div className="w-10/12 mx-auto p-6 text-red-400">{error}</div>;
  }

  if (!roll) {
    return (
      <div className="w-10/12 mx-auto p-6">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-neutral-400"
          >
            <ChevronLeft size={16} /> volver
          </button>
        </div>
        <div className="text-neutral-500">Roll no encontrado.</div>
      </div>
    );
  }

  return (
    <div className="w-10/12 mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div>
              {editingField === "name" ? (
                <input
                  autoFocus
                  value={fieldDraft}
                  onChange={(e) => setFieldDraft(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // save
                      try {
                        const res = await fetch(
                          "/pages/api/admin/update-manifest",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              rollId: roll.id,
                              metadata: { ...roll.metadata, name: fieldDraft },
                            }),
                          }
                        );
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || "Error");
                        setRoll(
                          (prev) =>
                            prev && {
                              ...prev,
                              metadata: { ...prev.metadata, name: fieldDraft },
                            }
                        );
                        showSuccess("Nombre actualizado");
                      } catch (err: any) {
                        console.error(err);
                        showError("Error al actualizar nombre");
                      } finally {
                        setEditingField(null);
                      }
                    } else if (e.key === "Escape") {
                      setEditingField(null);
                    }
                  }}
                  onBlur={() => setEditingField(null)}
                  className="bg-transparent border-b border-neutral-700 text-2xl font-['Playfair'] font-bold lowercase text-white outline-none p-1"
                />
              ) : (
                <h2
                  className="text-2xl font-['Playfair'] font-bold lowercase text-white"
                  onDoubleClick={() => {
                    setEditingField("name");
                    setFieldDraft(roll.metadata?.name || "");
                  }}
                >
                  {roll.metadata?.name || roll.id}
                </h2>
              )}

              <div className="text-sm text-neutral-400 lowercase">
                {editingField === "date" ? (
                  <input
                    autoFocus
                    value={fieldDraft}
                    onChange={(e) => setFieldDraft(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        try {
                          const res = await fetch(
                            "/pages/api/admin/update-manifest",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                rollId: roll.id,
                                metadata: {
                                  ...roll.metadata,
                                  date: fieldDraft,
                                },
                              }),
                            }
                          );
                          const data = await res.json();
                          if (!res.ok) throw new Error(data?.error || "Error");
                          setRoll(
                            (prev) =>
                              prev && {
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  date: fieldDraft,
                                },
                              }
                          );
                          showSuccess("Fecha actualizada");
                        } catch (err: any) {
                          console.error(err);
                          showError("Error al actualizar fecha");
                        } finally {
                          setEditingField(null);
                        }
                      } else if (e.key === "Escape") {
                        setEditingField(null);
                      }
                    }}
                    onBlur={() => setEditingField(null)}
                    className="bg-transparent border-b border-neutral-700 text-sm text-neutral-400 lowercase outline-none p-1"
                  />
                ) : editingField === "filmstock" ? (
                  <input
                    autoFocus
                    value={fieldDraft}
                    onChange={(e) => setFieldDraft(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        try {
                          const res = await fetch(
                            "/pages/api/admin/update-manifest",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                rollId: roll.id,
                                metadata: {
                                  ...roll.metadata,
                                  filmstock: fieldDraft,
                                },
                              }),
                            }
                          );
                          const data = await res.json();
                          if (!res.ok) throw new Error(data?.error || "Error");
                          setRoll(
                            (prev) =>
                              prev && {
                                ...prev,
                                metadata: {
                                  ...prev.metadata,
                                  filmstock: fieldDraft,
                                },
                              }
                          );
                          showSuccess("Descripción actualizada");
                        } catch (err: any) {
                          console.error(err);
                          showError("Error al actualizar descripción");
                        } finally {
                          setEditingField(null);
                        }
                      } else if (e.key === "Escape") {
                        setEditingField(null);
                      }
                    }}
                    onBlur={() => setEditingField(null)}
                    className="bg-transparent border-b border-neutral-700 text-sm text-neutral-400 lowercase outline-none p-1"
                  />
                ) : (
                  <>
                    <span
                      onDoubleClick={() => {
                        setEditingField("date");
                        setFieldDraft(roll.metadata?.date || "");
                      }}
                    >
                      {roll.metadata?.date || "-"}
                    </span>
                    <span> • </span>
                    <span
                      onDoubleClick={() => {
                        setEditingField("filmstock");
                        setFieldDraft(roll.metadata?.filmstock || "");
                      }}
                    >
                      {roll.metadata?.filmstock || ""}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-none">
                  <Upload /> add photos
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="border-l border-white/10">
                <SheetHeader>
                  <SheetTitle>añadir imágenes al roll</SheetTitle>
                </SheetHeader>

                <div className="p-4 overflow-y-auto flex-1">
                  <div
                    onDrop={handleNewDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="p-4 border border-dashed border-neutral-700 bg-transparent rounded-none cursor-pointer text-neutral-300"
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    aria-label="Drop images here or click to select"
                  >
                    <input
                      ref={fileInputRef}
                      id="new-files"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleNewFileChange}
                      className="hidden"
                    />
                    <p className="text-sm lowercase">
                      arrastra las imágenes aquí o haz click para seleccionar
                    </p>
                    {newFiles.length > 0 && (
                      <p className="text-sm text-neutral-400 lowercase mt-2">
                        {newFiles.length} archivo(s) seleccionado(s)
                      </p>
                    )}
                  </div>

                  {newFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {newFiles.map((item, index) => (
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

                            <div
                              className="absolute inset-0 bg-neutral-800/60 flex flex-col items-center justify-center text-xs text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onDoubleClick={() => removeNewFile(index)}
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
                              handleNewNoteChange(index, e.target.value)
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
                                        item.compressedSize /
                                          item.originalSize) *
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

                <SheetFooter>
                  <div className="w-full">
                    <Button
                      onClick={handleUploadNew}
                      className="w-full bg-transparent hover:bg-neutral-600/20 rounded-none lowercase border border-neutral-700 text-white"
                      disabled={isUploadingNew}
                      aria-busy={isUploadingNew}
                    >
                      {isUploadingNew ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white/90"
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
                          subiendo...
                        </>
                      ) : (
                        "subir imágenes"
                      )}
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {roll.photos.map((p, idx) => {
          const startEditing = () => {
            setEditingIndex(idx);
            setDraftNote(p.photo_metadata?.notes || "");
          };

          const handleTap = () => {
            const now = Date.now();
            if (lastTapRef.current && now - lastTapRef.current < 300) {
              // double tap detected
              startEditing();
            }
            lastTapRef.current = now;
          };

          const saveNote = async () => {
            if (!p.photo_metadata?.public_id) {
              console.warn("No public_id for this photo, cannot save note");
              setEditingIndex(null);
              return;
            }

            setSaving(true);
            try {
              const res = await fetch("/pages/api/admin/update-metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  public_id: p.photo_metadata.public_id,
                  notes: draftNote,
                }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || "Error updating");

              // update local state
              setRoll((prev) => {
                if (!prev) return prev;
                const copy = { ...prev } as Roll;
                copy.photos = copy.photos.map((ph, i) =>
                  i === idx
                    ? {
                        ...ph,
                        photo_metadata: {
                          ...ph.photo_metadata,
                          notes: draftNote,
                        },
                      }
                    : ph
                );
                return copy;
              });
              showSuccess("Nota guardada");
            } catch (err) {
              console.error("Error saving note", err);
              showError("Error al guardar la nota");
            } finally {
              setSaving(false);
              setEditingIndex(null);
            }
          };

          return (
            <div
              key={idx}
              className="bg-neutral-950/30 p-2 border border-neutral-800"
            >
              <div
                className="w-full flex items-center justify-center bg-neutral-900"
                onDoubleClick={startEditing}
                onTouchStart={handleTap}
              >
                <img
                  src={p.url}
                  alt={`foto-${idx + 1}`}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>

              {/* input minimalista dentro del contenedor */}
              {editingIndex === idx ? (
                <div className="mt-2">
                  <input
                    autoFocus
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveNote();
                      } else if (e.key === "Escape") {
                        setEditingIndex(null);
                      }
                    }}
                    onBlur={() => {
                      // small debounce: save on blur too
                      if (!saving) saveNote();
                    }}
                    placeholder="Añadir nota..."
                    className="w-full bg-transparent border-b border-neutral-700 text-xs text-neutral-400 placeholder-neutral-500 outline-none p-1"
                    disabled={saving}
                  />
                </div>
              ) : p.photo_metadata?.notes ? (
                <div className="mt-2 text-xs text-neutral-400 lowercase">
                  {p.photo_metadata.notes}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
