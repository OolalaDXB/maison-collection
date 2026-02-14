import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteContent = (page: string, section: string, defaultValue: string = "") => {
  const query = useQuery({
    queryKey: ["site-content", page, section],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content_fr")
        .eq("page", page)
        .eq("section", section)
        .single();
      return data?.content_fr || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query.data || defaultValue;
};
