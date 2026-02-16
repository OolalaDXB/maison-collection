import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyData {
  id: string;
  slug: string;
  name: string;
  location: string;
  region: string;
  country: string;
  description: string;
  long_description: string | null;
  price_per_night: number | null;
  capacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  airbnb_link: string | null;
  airbnb_rating: number | null;
  airbnb_reviews_count: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  parking_info: string | null;
  hero_image: string | null;
  tags: string[];
  status: string;
  currency: string;
  min_nights: number | null;
  cleaning_fee: number | null;
  tourist_tax_per_person: number | null;
  weekend_price: number | null;
}

export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (error) throw error;
      return data as PropertyData;
    },
    staleTime: 5 * 60 * 1000,
  });
}
