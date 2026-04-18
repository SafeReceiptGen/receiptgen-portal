"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] w-full animate-pulse rounded-lg bg-slate-100 dark:bg-white/5" />
  ),
});

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Geocode failed");
  const data = (await res.json()) as { display_name?: string };
  return (
    data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  );
}

export interface LocationPickerProps {
  address: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  onAddressChange: (value: string) => void;
  onLandmarkChange: (value: string) => void;
  onLocationChange: (lat: number, lng: number) => void;
  onLocationClear?: () => void;
  addressError?: string;
}

/**
 * Bolt/Yango-style pickup location: GPS, map pin, short address + landmark.
 * Map provider can be swapped later (e.g. Google Places) without changing parent form shape.
 */
export function LocationPicker({
  address,
  landmark,
  latitude,
  longitude,
  onAddressChange,
  onLandmarkChange,
  onLocationChange,
  onLocationClear,
  addressError,
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<
    [number, number] | null
  >(
    latitude != null && longitude != null
      ? [latitude, longitude]
      : null,
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setMarkerPosition([latitude, longitude]);
    } else {
      setMarkerPosition(null);
    }
  }, [latitude, longitude]);

  const applyCoords = useCallback(
    async (lat: number, lng: number, fillAddress: boolean) => {
      onLocationChange(lat, lng);
      if (!fillAddress) return;
      setReverseLoading(true);
      try {
        const name = await reverseGeocode(lat, lng);
        onAddressChange(name);
      } catch {
        onAddressChange(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } finally {
        setReverseLoading(false);
      }
    },
    [onAddressChange, onLocationChange],
  );

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    void applyCoords(lat, lng, true);
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    void applyCoords(lat, lng, true);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarkerPosition([lat, lng]);
        await applyCoords(lat, lng, true);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const clearPin = () => {
    setMarkerPosition(null);
    onLocationClear?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={geoLoading}
          onClick={useCurrentLocation}
        >
          {geoLoading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 shrink-0" />
          )}
          Use my current location
        </Button>
        {markerPosition && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600 dark:text-white/55"
            onClick={clearPin}
          >
            Clear pin
          </Button>
        )}
      </div>

      <div className="relative">
        <LocationPickerMap
          markerPosition={markerPosition}
          onMapClick={handleMapClick}
          onMarkerDragEnd={handleMarkerDragEnd}
        />
        {reverseLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/40 dark:bg-black/30">
            <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-white/45">
        Tap the map to drop a pin, or drag the pin to adjust. Optional but helps
        couriers find you faster.
      </p>

      <div>
        <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
          <MapPin size={12} className="mr-1 inline text-primary dark:text-blue-400" />
          Address
        </Label>
        <Input
          placeholder="e.g. Spintex Rd, near Shell station"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className={cn(
            "mt-2 bg-slate-50 text-slate-900 dark:bg-white/5 dark:text-white",
            "border-slate-200 dark:border-white/10",
          )}
        />
        {addressError && (
          <p className="mt-1 text-xs text-red-500">{addressError}</p>
        )}
      </div>

      <div>
        <Label className="text-xs font-medium text-slate-600 dark:text-white/60">
          Landmark / gate / floor{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </Label>
        <Input
          placeholder="e.g. Blue gate, 2nd floor"
          value={landmark}
          onChange={(e) => onLandmarkChange(e.target.value)}
          className="mt-2 bg-slate-50 text-slate-900 dark:bg-white/5 dark:text-white"
        />
      </div>
    </div>
  );
}
