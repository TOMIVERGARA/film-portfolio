"use client";

import React, { useEffect, useRef, useState } from "react";
import { showSuccess, showError } from "@/components/ui/notify";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
            <Link
              href="/admin/rolls"
              className="text-sm text-neutral-400 lowercase"
            >
              Volver a rolls
            </Link>
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
                    className="w-full bg-transparent border-b border-neutral-700 text-sm text-white placeholder-neutral-500 outline-none p-1"
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
