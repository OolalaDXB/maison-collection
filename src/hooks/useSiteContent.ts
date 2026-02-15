import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

function usePageContent(page: string) {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.slice(0, 2) || "en") as "en" | "fr" | "ru";
  const column = `content_${lang}` as "content_en" | "content_fr" | "content_ru";

  return useQuery({
    queryKey: ["site-content", page, lang],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("section, content_en, content_fr, content_ru")
        .eq("page", page);
      if (!data) return {};
      const map: Record<string, string> = {};
      for (const row of data) {
        map[row.section] = (row as any)[column] || row.content_en || "";
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteContent(page: string, section: string, defaultValue: string = "") {
  const { data } = usePageContent(page);
  return data?.[section] || defaultValue;
}

export { usePageContent };
