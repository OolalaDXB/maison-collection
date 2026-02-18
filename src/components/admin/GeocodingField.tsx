import { useState, useRef, useEffect } from "react";
import { Search, Loader2, MapPin } from "lucide-react";

const mapToken = import.meta.env.VITE_MAP_TOKEN;

interface GeocodingResult {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface GeocodingFieldProps {
  onSelect: (lat: number, lng: number, placeName: string) => void;
  placeholder?: string;
}

/**
 * Address search field using the Mapbox Geocoding API.
 * On selection, calls onSelect(lat, lng, placeName).
 */
const GeocodingField = ({ onSelect, placeholder = "Search address or place…" }: GeocodingFieldProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = async (q: string) => {
    if (!q.trim() || q.length < 3) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapToken}&limit=5&language=en`;
      const res = await fetch(url);
      const json = await res.json();
      const features: GeocodingResult[] = (json.features || []).map((f: any) => ({
        place_name: f.place_name,
        center: f.center,
      }));
      setResults(features);
      setOpen(features.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 350);
  };

  const handleSelect = (r: GeocodingResult) => {
    const [lng, lat] = r.center;
    setQuery(r.place_name);
    setOpen(false);
    setResults([]);
    onSelect(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)), r.place_name);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!mapToken) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs text-muted-foreground mb-1">Search Address (geocoding)</label>
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
        {loading && <Loader2 size={14} className="absolute right-3 text-muted-foreground animate-spin" />}
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-background border border-border shadow-lg max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2.5 text-sm flex items-start gap-2 hover:bg-secondary transition-colors"
              >
                <MapPin size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="leading-snug">{r.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GeocodingField;
