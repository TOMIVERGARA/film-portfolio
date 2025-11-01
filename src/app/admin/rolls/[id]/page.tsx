"use client";

import React, { useEffect, useRef, useState } from "react";
import { showSuccess, showError } from "@/components/ui/notify";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Zap,
  Trash,
  PlusCircleIcon,
  Upload,
  Trash2,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // --- delete-photos state ---
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // --- delete-roll state ---
  const [deleteRollDialogOpen, setDeleteRollDialogOpen] = useState(false);
  const [confirmRollId, setConfirmRollId] = useState("");
  const [isDeletingRoll, setIsDeletingRoll] = useState(false);

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

  // --- delete functions ---
  const togglePhotoSelection = (index: number) => {
    setSelectedPhotos((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDeleteClick = () => {
    if (deleteMode) {
      if (selectedPhotos.length === 0) {
        showError("No hay fotos seleccionadas");
        return;
      }
      setDeleteDialogOpen(true);
    } else {
      setDeleteMode(true);
      setSelectedPhotos([]);
    }
  };

  const handleCancelDelete = () => {
    setDeleteMode(false);
    setSelectedPhotos([]);
  };

  const handleConfirmDelete = async () => {
    if (confirmText.toLowerCase() !== "eliminar") {
      showError("Debes escribir 'eliminar' para confirmar");
      return;
    }

    if (selectedPhotos.length === 0) {
      showError("No hay fotos seleccionadas");
      return;
    }

    setIsDeleting(true);

    try {
      const photosToDelete = selectedPhotos.map((idx) => roll!.photos[idx]);
      const public_ids = photosToDelete
        .map((p) => p.photo_metadata?.public_id)
        .filter(Boolean);

      if (public_ids.length === 0) {
        showError("No se pudieron obtener los IDs de las fotos");
        return;
      }

      const res = await fetch("/pages/api/admin/delete-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_ids }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al eliminar");

      // Update local state
      setRoll((prev) => {
        if (!prev) return prev;
        const copy = { ...prev } as Roll;
        copy.photos = copy.photos.filter(
          (_, idx) => !selectedPhotos.includes(idx)
        );
        return copy;
      });

      showSuccess(`${data.deleted} foto(s) eliminada(s)`);
      setDeleteDialogOpen(false);
      setDeleteMode(false);
      setSelectedPhotos([]);
      setConfirmText("");
    } catch (err) {
      console.error("Error deleting photos", err);
      showError("Error al eliminar las fotos");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- delete roll functions ---
  const handleDeleteRollClick = () => {
    setDeleteRollDialogOpen(true);
  };

  const handleConfirmDeleteRoll = async () => {
    if (confirmRollId !== roll?.id) {
      showError(`Debes escribir exactamente '${roll?.id}' para confirmar`);
      return;
    }

    setIsDeletingRoll(true);

    try {
      const res = await fetch("/pages/api/admin/delete-roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollId: roll?.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al eliminar el roll");

      showSuccess("Roll eliminado completamente");
      setDeleteRollDialogOpen(false);
      setConfirmRollId("");

      // Redirect to rolls page after successful deletion
      setTimeout(() => {
        router.push("/admin/rolls");
      }, 1000);
    } catch (err) {
      console.error("Error deleting roll", err);
      showError("Error al eliminar el roll");
    } finally {
      setIsDeletingRoll(false);
    }
  };

  if (loading) {
    return (
      <div className="w-10/12 mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-2/5 mb-3 rounded-none" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-1/4 rounded-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="">
              <Skeleton className="w-full h-56 rounded-none" />
              <Skeleton className="mt-2 h-3 w-3/4 rounded-none" />
            </div>
          ))}
        </div>
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
          <div className="flex gap-2">
            {deleteMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none border border-neutral-700"
                  onClick={handleCancelDelete}
                >
                  cancelar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none border border-red-900 text-red-400 hover:bg-red-950/30"
                  onClick={handleDeleteClick}
                  disabled={selectedPhotos.length === 0}
                >
                  <Trash2 size={16} />
                  eliminar ({selectedPhotos.length})
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none  text-red-400 hover:bg-red-950/30"
                  onClick={handleDeleteRollClick}
                >
                  <Trash size={16} />
                  delete roll
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none  text-red-400 hover:bg-red-950/30"
                  onClick={handleDeleteClick}
                >
                  <Image size={16} />
                  delete photos
                </Button>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-none">
                      <Upload /> add photos
                    </Button>
                  </SheetTrigger>

                  <SheetContent
                    side="right"
                    className="border-l border-white/10"
                  >
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
                          arrastra las imágenes aquí o haz click para
                          seleccionar
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-neutral-950 border border-red-900/50 rounded-none">
          <DialogHeader>
            <DialogTitle className="text-red-400 lowercase">
              confirmar eliminación
            </DialogTitle>
            <DialogDescription className="text-neutral-400 lowercase">
              estás a punto de eliminar {selectedPhotos.length} foto(s). esta
              acción no se puede deshacer.
              <br />
              <br />
              escribe <span className="text-red-400 font-bold">
                eliminar
              </span>{" "}
              para confirmar:
            </DialogDescription>
          </DialogHeader>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="escribe 'eliminar'"
            className="bg-transparent border-neutral-700 text-white lowercase rounded-none"
            autoFocus
          />

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmText("");
              }}
              className="rounded-none border border-neutral-700"
              disabled={isDeleting}
            >
              cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="rounded-none bg-red-900 hover:bg-red-800 text-white"
              disabled={isDeleting || confirmText.toLowerCase() !== "eliminar"}
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
                "eliminar fotos"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Roll Confirmation Dialog */}
      <Dialog
        open={deleteRollDialogOpen}
        onOpenChange={setDeleteRollDialogOpen}
      >
        <DialogContent className="bg-neutral-950 border border-red-900 rounded-none">
          <DialogHeader>
            <DialogTitle className="text-red-400 lowercase">
              eliminar roll completo
            </DialogTitle>
            <DialogDescription className="text-neutral-400 lowercase">
              <span className=" font-bold">atención:</span> estás a punto de
              eliminar el roll completo "{roll?.metadata?.name || roll?.id}" con
              todas sus {roll?.photos.length} foto(s).
              <br />
              <br />
              esta acción es{" "}
              <span className="text-red-400 font-bold">irreversible</span> y
              eliminará permanentemente:
              <ul className="mt-2 space-y-1">
                <li>- todas las fotos del roll.</li>
                <li>- todos los metadatos.</li>
                <li>- el roll completo de cloudinary.</li>
              </ul>
              <br />
              escribe el ID del roll{" "}
              <span className="text-red-400 font-bold">{roll?.id}</span> para
              confirmar:
            </DialogDescription>
          </DialogHeader>

          <Input
            value={confirmRollId}
            onChange={(e) => setConfirmRollId(e.target.value)}
            placeholder={`escribe '${roll?.id}'`}
            className="bg-transparent border-red-900 text-white lowercase rounded-none font-mono"
            autoFocus
          />

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteRollDialogOpen(false);
                setConfirmRollId("");
              }}
              className="rounded-none border border-neutral-700"
              disabled={isDeletingRoll}
            >
              cancelar
            </Button>
            <Button
              onClick={handleConfirmDeleteRoll}
              className="rounded-none bg-red-900 hover:bg-red-800 text-white"
              disabled={isDeletingRoll || confirmRollId !== roll?.id}
            >
              {isDeletingRoll ? (
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
                  eliminando roll...
                </>
              ) : (
                "eliminar roll permanentemente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {roll.photos.map((p, idx) => {
          const isSelected = selectedPhotos.includes(idx);

          const startEditing = () => {
            if (deleteMode) return; // Don't edit in delete mode
            setEditingIndex(idx);
            setDraftNote(p.photo_metadata?.notes || "");
          };

          const handleTap = () => {
            if (deleteMode) {
              togglePhotoSelection(idx);
              return;
            }
            const now = Date.now();
            if (lastTapRef.current && now - lastTapRef.current < 300) {
              // double tap detected
              startEditing();
            }
            lastTapRef.current = now;
          };

          const handlePhotoClick = (e: React.MouseEvent) => {
            if (deleteMode) {
              e.preventDefault();
              e.stopPropagation();
              togglePhotoSelection(idx);
            }
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
              className={`bg-neutral-950/30 p-2 border transition-all ${
                isSelected
                  ? "border-red-500 ring-2 ring-red-500/50"
                  : "border-neutral-800"
              } ${deleteMode ? "cursor-pointer" : ""}`}
              onClick={deleteMode ? handlePhotoClick : undefined}
            >
              <div
                className="w-full flex items-center justify-center bg-neutral-900 relative"
                onDoubleClick={!deleteMode ? startEditing : undefined}
                onTouchStart={handleTap}
              >
                <img
                  src={p.url}
                  alt={`foto-${idx + 1}`}
                  className={`w-full h-auto object-contain ${
                    deleteMode ? "pointer-events-none" : ""
                  }`}
                  loading="lazy"
                />
                {deleteMode && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                      isSelected
                        ? "bg-red-900/40"
                        : "bg-black/20 hover:bg-black/40"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* input minimalista dentro del contenedor */}
              {!deleteMode && editingIndex === idx ? (
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
              ) : !deleteMode && p.photo_metadata?.notes ? (
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
