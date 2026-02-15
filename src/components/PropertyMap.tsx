import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const mapToken = import.meta.env.VITE_MAP_TOKEN;
if (mapToken) mapboxgl.accessToken = mapToken;

interface POI {
  label: string;
  coords: [number, number];
  emoji?: string;
}

interface PropertyMapProps {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  propertyName: string;
  pois?: POI[];
}

const haversineDistance = (
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

const PropertyMap = ({ center, zoom = 14, propertyName, pois = [] }: PropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapToken || !mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Property marker
    const el = document.createElement("div");
    el.className = "property-marker";
    el.innerHTML = `<div style="
      width: 32px; height: 32px; 
      background: hsl(11, 47%, 55%); 
      border: 3px solid white; 
      border-radius: 50%; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 14px;
    ">◇</div>`;

    new mapboxgl.Marker(el)
      .setLngLat(center)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${propertyName}</strong>`))
      .addTo(map.current);

    // POI markers
    pois.forEach((poi) => {
      const dist = haversineDistance(center, poi.coords);
      const poiEl = document.createElement("div");
      poiEl.innerHTML = `<div style="
        background: white; border: 1px solid #ddd; border-radius: 6px;
        padding: 4px 8px; font-size: 11px; white-space: nowrap;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15); cursor: pointer;
        font-family: 'DM Sans', sans-serif;
      ">${poi.emoji || "📍"} ${poi.label} · ${formatDistance(dist)}</div>`;

      new mapboxgl.Marker({ element: poiEl, anchor: "bottom" })
        .setLngLat(poi.coords)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom, propertyName, pois]);

  if (!mapToken) return null;

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] md:h-[500px] border border-border"
    />
  );
};

export default PropertyMap;
