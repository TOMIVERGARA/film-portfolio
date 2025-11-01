"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function RollsPage() {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function fetchRolls() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/pages/api/photos");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setRolls(data || []);
      } catch (err: any) {
        console.error(err);
        if (mounted) setError("Error cargando rolls");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchRolls();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Lógica del PhotoStack integrada ---
  // Definimos los estilos base (el stack) y los estilos al hacer hover (el abanico)
  const stackStyles = [
    {
      // Foto 1 (Inferior)
      base: "rotate-[-8deg] z-0 translate-x-[-6px] translate-y-[-2px]",
      hover:
        "group-hover:rotate-[-12deg] group-hover:translate-x-[-12px] group-hover:translate-y-[2px]",
    },
    {
      // Foto 2 (Media)
      base: "rotate-[2deg] z-10 translate-y-[-4px]",
      hover:
        "group-hover:rotate-[0deg] group-hover:translate-y-[-10px] group-hover:z-10",
    },
    {
      // Foto 3 (Superior)
      base: "rotate-[8deg] z-20 translate-x-[6px] translate-y-[-2px]",
      hover:
        "group-hover:rotate-[12deg] group-hover:translate-x-[12px] group-hover:translate-y-[2px] group-hover:z-20",
    },
  ];
  // --- Fin de la lógica del PhotoStack ---

  return (
    <div className="w-6/12 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="mb-4">
          <h1 className="text-3xl font-['Playfair'] font-bold lowercase text-white">
            rolls
          </h1>
          <p className="text-sm text-neutral-400 lowercase">
            rolls disponibles en el portfolio.
          </p>
        </div>

        <div className="mb-5">
          <label className="sr-only">Buscar rolls</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar por nombre, filmstock o fecha..."
            className="w-full bg-neutral-900/30 border border-neutral-800 text-sm text-neutral-200 placeholder:text-neutral-500 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        {loading && (
          <div className="space-y-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full bg-neutral-950/30 backdrop-blur-sm p-4 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-none" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-2 rounded-none" />
                      <Skeleton className="h-3 w-24 rounded-none" />
                    </div>
                  </div>

                  <Skeleton className="h-4 w-16 rounded-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 backdrop-blur-sm p-4 border border-red-400/20 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && rolls.length === 0 && (
          <div className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 text-neutral-500">
            no hay rolls disponibles
          </div>
        )}

        {/* Contenedor scrollable para la lista de rolls (scroll funcional, scrollbar oculta) */}
        <div className="space-y-3 no-scrollbar overflow-y-auto max-h-[65vh] w-full">
          {(() => {
            const q = query.trim().toLowerCase();
            const filtered = q
              ? rolls.filter((r) => {
                  const name = (r.metadata?.name || "").toLowerCase();
                  const film = (r.metadata?.filmstock || "").toLowerCase();
                  const date = (r.metadata?.date || "").toLowerCase();
                  return (
                    name.includes(q) || film.includes(q) || date.includes(q)
                  );
                })
              : rolls;

            if (!loading && filtered.length === 0) {
              return (
                <div className="bg-neutral-950/40 backdrop-blur-lg p-4 border border-neutral-800 text-neutral-500">
                  {q
                    ? `No se encontraron rolls para "${query}"`
                    : "no hay rolls disponibles"}
                </div>
              );
            }

            return filtered.map((roll) => (
              <Link
                key={roll.id}
                href={`/admin/rolls/${roll.id}`}
                // Añadimos "group" aquí para que el hover funcione en todo el <Link>
                className="block group w-full"
              >
                <div className="w-full bg-neutral-950/30 backdrop-blur-sm p-4 border border-neutral-800 flex items-center justify-between hover:bg-neutral-950/50 transition">
                  <div className="flex items-center gap-4">
                    {/* --- INICIO: Mini stack integrado --- */}
                    <div className="relative flex items-center justify-center w-24 h-24">
                      {/* Este div relativo contiene el stack. */}
                      <div className="relative w-16 h-16">
                        {roll.photos.slice(0, 3).map((p, i) => (
                          <img
                            key={p.url || i} // Usar p.url si está disponible
                            src={p.url}
                            alt={`${roll.metadata?.name || roll.id} - ${i + 1}`}
                            className={`
                            w-16 h-16 absolute top-0 left-0 
                            object-cover
                            bg-neutral-200 dark:bg-neutral-900 
                            shadow-lg
                            transition-all duration-300 ease-in-out
                            ${stackStyles[i]?.base || ""}
                            ${stackStyles[i]?.hover || ""}
                          `}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                    {/* --- FIN: Mini stack integrado --- */}

                    <div>
                      <div className="text-sm font-medium lowercase text-white">
                        {roll.metadata?.name || roll.id}
                      </div>
                      <div className="text-xs text-neutral-400 lowercase">
                        {roll.photos.length} foto(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs text-neutral-400 lowercase">
                      {roll.metadata?.date || "-"}
                    </div>
                    <ChevronRight className="text-neutral-400" size={18} />
                  </div>
                </div>
              </Link>
            ));
          })()}
        </div>
      </motion.div>
    </div>
  );
}
