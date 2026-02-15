import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RegionContent {
  id: string;
  property_id: string;
  subtitle: string | null;
  title: string;
  tagline: string | null;
  intro_text: string | null;
}

export interface RegionCard {
  id: string;
  property_id: string;
  icon: string;
  title: string;
  text: string;
  display_order: number;
}

export interface RegionLink {
  id: string;
  property_id: string;
  label: string;
  url: string;
  display_order: number;
}

export function usePropertyRegion(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-region", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;

      const [contentRes, cardsRes, linksRes] = await Promise.all([
        supabase.from("property_region_content" as any).select("*").eq("property_id", propertyId).maybeSingle(),
        supabase.from("property_region_cards" as any).select("*").eq("property_id", propertyId).order("display_order"),
        supabase.from("property_region_links" as any).select("*").eq("property_id", propertyId).order("display_order"),
      ]);

      return {
        content: contentRes.data as unknown as RegionContent | null,
        cards: (cardsRes.data || []) as unknown as RegionCard[],
        links: (linksRes.data || []) as unknown as RegionLink[],
      };
    },
    enabled: !!propertyId,
  });
}
