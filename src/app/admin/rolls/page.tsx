"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
            lista de rolls cargados desde la API
          </p>
        </div>

        {loading && (
          <div className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 text-neutral-400">
            cargando rolls...
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

        <div className="space-y-3">
          {rolls.map((roll) => (
            <Link
              key={roll.id}
              href={`/admin/rolls/${roll.id}`}
              className="block"
            >
              <div className="bg-neutral-950/30 backdrop-blur-sm p-4 border border-neutral-800 flex items-center justify-between hover:bg-neutral-950/50 transition">
                <div className="flex items-center gap-4">
                  {/* mini stack */}
                  <div className="flex items-center -space-x-3">
                    {roll.photos.slice(0, 3).map((p, i) => (
                      <img
                        key={i}
                        src={p.url}
                        alt={`${roll.metadata?.name || roll.id} - ${i + 1}`}
                        className={`w-12 h-12 object-cover border border-neutral-800 bg-neutral-900 ${
                          i === 0 ? "" : "shadow-lg"
                        }`}
                        style={{ zIndex: 10 + i }}
                        loading="lazy"
                      />
                    ))}
                  </div>

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
          ))}
        </div>
      </motion.div>
    </div>
  );
}
