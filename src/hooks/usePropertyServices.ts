import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyService {
  id: string;
  property_id: string;
  category: "included" | "a_la_carte";
  label: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  active: boolean;
}

export function usePropertyServices(propertyId: string | undefined) {
  return useQuery({
    queryKey: ["property-services", propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const { data, error } = await supabase
        .from("property_services" as any)
        .select("*")
        .eq("property_id", propertyId)
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as PropertyService[];
    },
    enabled: !!propertyId,
  });
}
