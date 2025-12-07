"use client";

import { Globe } from "lucide-react";

interface GeoMapProps {
  countries: Array<{
    country: string;
    country_code: string;
    count: number;
  }>;
}

export function GeoMap({ countries }: GeoMapProps) {
  if (countries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] w-full">
        <Globe className="w-16 h-16 text-neutral-700 mb-4" />
        <p className="text-neutral-500 lowercase">
          sin datos de geolocalización
        </p>
      </div>
    );
  }

  // Calculate max for scaling
  const maxCount = Math.max(...countries.map((c) => c.count));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-neutral-400" />
        <h3 className="text-lg font-semibold lowercase text-white">
          Distribución Geográfica
        </h3>
      </div>

      {/* Country List with Visual Bars */}
      <div className="space-y-3">
        {countries.map((country, idx) => {
          const percentage = (country.count / maxCount) * 100;

          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 font-mono text-xs w-8">
                    {country.country_code}
                  </span>
                  <span className="text-white">{country.country}</span>
                </div>
                <span className="text-white font-bold">{country.count}</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* World Regions Summary (if we have data) */}
      {countries.length > 3 && (
        <div className="mt-6 pt-6 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 lowercase">
            Visitantes de {countries.length}{" "}
            {countries.length === 1 ? "país" : "países"} diferentes
          </p>
        </div>
      )}
    </div>
  );
}
