"use client";

import { Globe } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useState } from "react";

interface GeoMapProps {
  countries: Array<{
    country: string;
    country_code: string;
    count: number;
  }>;
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function GeoMap({ countries }: GeoMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");

  if (countries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full">
        <Globe className="w-16 h-16 text-neutral-700 mb-4" />
        <p className="text-neutral-500 lowercase">
          sin datos de geolocalización
        </p>
      </div>
    );
  }

  // Create a map for quick lookup by country name
  const countryDataMap = new Map<string, (typeof countries)[0]>();

  countries.forEach((c) => {
    // Normalize country name for matching
    const normalizedName = c.country.toLowerCase().trim();
    countryDataMap.set(normalizedName, c);

    // Add variations for common mismatches
    if (c.country === "United States") {
      countryDataMap.set("united states of america", c);
    }
  });

  // Calculate max for color scaling (convert string counts to numbers)
  const maxCount = Math.max(...countries.map((c) => Number(c.count) || 0));

  // Get color based on visitor count - using only green shades
  const getCountryColor = (count: number | string) => {
    const numCount = Number(count) || 0;
    const intensity = numCount / maxCount;
    if (intensity > 0.7) return "#10b981"; // green-500 - bright green
    if (intensity > 0.5) return "#22c55e"; // green-400
    if (intensity > 0.3) return "#4ade80"; // green-300
    if (intensity > 0.1) return "#86efac"; // green-200
    return "#bbf7d0"; // green-100 - light green
  };

  return (
    <div className="space-y-6">
      {/* World Map */}
      <div className="relative bg-neutral-900 rounded-none overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
          }}
          className="w-full h-[400px]"
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // Match by country name
                  const geoName = geo.properties.name?.toLowerCase().trim();
                  const countryData = geoName
                    ? countryDataMap.get(geoName)
                    : undefined;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        countryData
                          ? getCountryColor(countryData.count)
                          : "#262626"
                      }
                      stroke="#171717"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: countryData ? "#fbbf24" : "#404040",
                          outline: "none",
                          cursor: countryData ? "pointer" : "default",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                      onMouseEnter={() => {
                        if (countryData) {
                          setTooltipContent(
                            `${countryData.country}: ${countryData.count} visitantes`
                          );
                        }
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltipContent && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-none border border-neutral-700 pointer-events-none z-10">
            <p className="text-white text-sm lowercase">{tooltipContent}</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-neutral-800">
        <p className="text-xs text-neutral-500 lowercase text-center">
          Visitantes de {countries.length}{" "}
          {countries.length === 1 ? "país" : "países"} diferentes
        </p>
      </div>
    </div>
  );
}
