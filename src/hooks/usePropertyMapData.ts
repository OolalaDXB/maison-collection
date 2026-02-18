import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface POI {
  label: string;
  coords: [number, number]; // [lng, lat]
  emoji?: string;
}

interface PropertyMapData {
  center: [number, number] | null;
  pois: POI[];
}

export function usePropertyMapData(propertyId: string, fallbackCenter: [number, number]): PropertyMapData {
  const { data: property } = useQuery({
    queryKey: ["property-map-coords", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("latitude, longitude")
        .eq("id", propertyId)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: poisData } = useQuery({
    queryKey: ["property-pois", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_pois")
        .select("*")
        .eq("property_id", propertyId)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const center: [number, number] =
    property?.longitude != null && property?.latitude != null
      ? [property.longitude, property.latitude]
      : fallbackCenter;

  const pois: POI[] = (poisData || []).map((p) => ({
    label: p.label,
    coords: [p.longitude, p.latitude] as [number, number],
    emoji: p.emoji ?? "📍",
  }));

  return { center, pois };
}
