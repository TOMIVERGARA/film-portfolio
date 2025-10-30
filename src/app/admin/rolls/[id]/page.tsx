"use client";

import React, { useEffect, useState } from "react";
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
            <h2 className="text-2xl font-['Playfair'] font-bold lowercase text-white">
              {roll.metadata?.name || roll.id}
            </h2>
            <div className="text-sm text-neutral-400 lowercase">
              {roll.metadata?.date || "-"} • {roll.metadata?.filmstock || ""}
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
        {roll.photos.map((p, idx) => (
          <div
            key={idx}
            className="bg-neutral-950/30 p-2 border border-neutral-800"
          >
            <img
              src={p.url}
              alt={`foto-${idx + 1}`}
              className="w-full h-60 object-cover"
              loading="lazy"
            />
            {p.photo_metadata?.notes ? (
              <div className="mt-2 text-xs text-neutral-400 lowercase">
                {p.photo_metadata.notes}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
