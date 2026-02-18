import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const mapToken = import.meta.env.VITE_MAP_TOKEN;
if (mapToken) mapboxgl.accessToken = mapToken;

interface PoiRow {
  id: string;
  label: string;
  emoji: string;
  latitude: number;
  longitude: number;
}

interface AdminPoiMapProps {
  center: [number, number]; // [lng, lat]
  pois: PoiRow[];
  editingPoi?: PoiRow | null;
  onPoiCoordChange?: (lat: number, lng: number) => void;
}

/**
 * Interactive map for the admin POI editor.
 * - Shows all saved POIs as labeled markers.
 * - The currently-edited POI shows a draggable marker; dragging updates coordinates.
 * - Clicking the map sets the edited POI coordinates.
 */
const AdminPoiMap = ({ center, pois, editingPoi, onPoiCoordChange }: AdminPoiMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const editMarker = useRef<mapboxgl.Marker | null>(null);
  const poiMarkers = useRef<mapboxgl.Marker[]>([]);

  // Init map once
  useEffect(() => {
    if (!mapToken || !mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Click on map → update editing POI coords
    map.current.on("click", (e) => {
      if (onPoiCoordChange) {
        onPoiCoordChange(
          parseFloat(e.lngLat.lat.toFixed(6)),
          parseFloat(e.lngLat.lng.toFixed(6))
        );
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update static POI markers whenever list changes
  useEffect(() => {
    if (!map.current) return;
    // Remove old markers
    poiMarkers.current.forEach((m) => m.remove());
    poiMarkers.current = [];

    pois.forEach((poi) => {
      if (!poi.latitude || !poi.longitude) return;
      // Skip the one being edited (shown as draggable instead)
      if (editingPoi && poi.id === editingPoi.id) return;

      const el = document.createElement("div");
      el.innerHTML = `<div style="
        background: white; border: 1px solid #ddd; border-radius: 6px;
        padding: 3px 8px; font-size: 11px; white-space: nowrap;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        font-family: 'DM Sans', sans-serif; cursor: default;
      ">${poi.emoji || "📍"} ${poi.label}</div>`;

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(map.current!);

      poiMarkers.current.push(marker);
    });
  }, [pois, editingPoi]);

  // Update draggable editing marker
  useEffect(() => {
    if (!map.current) return;

    // Remove previous edit marker
    if (editMarker.current) {
      editMarker.current.remove();
      editMarker.current = null;
    }

    if (!editingPoi || !editingPoi.latitude || !editingPoi.longitude) return;

    const el = document.createElement("div");
    el.innerHTML = `<div style="
      width: 36px; height: 36px;
      background: hsl(11, 47%, 55%);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; cursor: grab;
    ">${editingPoi.emoji || "📍"}</div>`;

    const marker = new mapboxgl.Marker({ element: el, draggable: true, anchor: "center" })
      .setLngLat([editingPoi.longitude, editingPoi.latitude])
      .addTo(map.current!);

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      if (onPoiCoordChange) {
        onPoiCoordChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
      }
    });

    editMarker.current = marker;

    // Pan map to editing POI
    map.current.panTo([editingPoi.longitude, editingPoi.latitude], { duration: 400 });
  }, [editingPoi?.id, editingPoi?.latitude, editingPoi?.longitude, editingPoi?.emoji]);

  if (!mapToken) return null;

  return (
    <div className="mt-4 space-y-1">
      <p className="text-xs text-muted-foreground">
        {editingPoi
          ? "Drag the marker or click the map to set coordinates."
          : "Click a POI to edit it. Enable editing to drag markers."}
      </p>
      <div ref={mapContainer} className="w-full h-[320px] border border-border" />
    </div>
  );
};

export default AdminPoiMap;
