import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Lang = "en" | "fr" | "ru";

interface ContentEntry {
  id?: string;
  page: string;
  section: string;
  content_en: string;
  content_fr: string;
  content_ru: string;
  default_value: string;
  label: string;
  type: "text" | "textarea";
}

const CONTENT_SCHEMA: Omit<ContentEntry, "content_en" | "content_fr" | "content_ru" | "id">[] = [
  // Homepage
  { page: "home", section: "hero_title", default_value: "Houses with a point of view", label: "Hero Title", type: "text" },
  { page: "home", section: "hero_subtitle", default_value: "A collection of distinctive homes across Europe and beyond.", label: "Hero Subtitle", type: "textarea" },
  { page: "home", section: "philosophy_title", default_value: "Not rentals. Residences.", label: "Philosophy Title", type: "text" },
  { page: "home", section: "philosophy_text", default_value: "Every Maison is a place we'd live in ourselves.", label: "Philosophy Text", type: "textarea" },
  { page: "home", section: "services_label", default_value: "Services", label: "Services Section Label", type: "text" },
  { page: "home", section: "s1_title", default_value: "Selection & Positioning", label: "Service 1 Title", type: "text" },
  { page: "home", section: "s1_desc", default_value: "", label: "Service 1 Description", type: "textarea" },
  { page: "home", section: "s2_title", default_value: "Management", label: "Service 2 Title", type: "text" },
  { page: "home", section: "s2_desc", default_value: "", label: "Service 2 Description", type: "textarea" },
  { page: "home", section: "s3_title", default_value: "Revenue", label: "Service 3 Title", type: "text" },
  { page: "home", section: "s3_desc", default_value: "", label: "Service 3 Description", type: "textarea" },
  { page: "home", section: "collection_label", default_value: "The Collection", label: "Collection Section Label", type: "text" },
  { page: "home", section: "collection_title", default_value: "Our Properties", label: "Collection Title", type: "text" },
  { page: "home", section: "cta_discover", default_value: "Discover the Collection", label: "CTA Discover", type: "text" },
  { page: "home", section: "cta_entrust", default_value: "Entrust your property", label: "CTA Entrust", type: "text" },
  // About
  { page: "about", section: "title", default_value: "Darya & Mickaël", label: "Page Title", type: "text" },
  { page: "about", section: "subtitle", default_value: "About", label: "Page Subtitle", type: "text" },
  { page: "about", section: "darya_bio", default_value: "", label: "Darya Bio", type: "textarea" },
  { page: "about", section: "philosophy_text", default_value: "", label: "Philosophy Text", type: "textarea" },
  { page: "about", section: "signature", default_value: "— Darya & Mickaël", label: "Signature", type: "text" },
  // Management
  { page: "management", section: "title", default_value: "Property Management", label: "Page Title", type: "text" },
  { page: "management", section: "subtitle", default_value: "", label: "Page Subtitle", type: "textarea" },
  { page: "management", section: "intro_title", default_value: "", label: "Intro Title", type: "text" },
  { page: "management", section: "intro_text", default_value: "", label: "Intro Text", type: "textarea" },
  // Contact
  { page: "contact", section: "title", default_value: "Get in Touch", label: "Page Title", type: "text" },
  { page: "contact", section: "intro_text", default_value: "", label: "Intro Text", type: "textarea" },
  // Georgia
  { page: "georgia", section: "hero_subtitle", default_value: "Gudauri, Greater Caucasus — 2,200m", label: "Hero Subtitle", type: "text" },
  { page: "georgia", section: "intro_title", default_value: "A Mountain Home", label: "Intro Title", type: "text" },
  { page: "georgia", section: "intro_text", default_value: "", label: "Intro Text", type: "textarea" },
  // Atlantique
  { page: "atlantique", section: "hero_subtitle", default_value: "Quistinic, Brittany", label: "Hero Subtitle", type: "text" },
  { page: "atlantique", section: "intro_title", default_value: "", label: "Intro Title", type: "text" },
  { page: "atlantique", section: "intro_text", default_value: "", label: "Intro Text", type: "textarea" },
  // Arabia
  { page: "arabia", section: "hero_subtitle", default_value: "The Sustainable City, Dubai", label: "Hero Subtitle", type: "text" },
  { page: "arabia", section: "intro_title", default_value: "", label: "Intro Title", type: "text" },
  { page: "arabia", section: "intro_text", default_value: "", label: "Intro Text", type: "textarea" },
];

const PAGES = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About" },
  { key: "management", label: "Management" },
  { key: "contact", label: "Contact" },
  { key: "georgia", label: "Maison Georgia" },
  { key: "atlantique", label: "Maison Atlantique" },
  { key: "arabia", label: "Maison Arabia" },
];

const LANGS: { key: Lang; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "fr", label: "FR" },
  { key: "ru", label: "RU" },
];

const LangDots = ({ entry }: { entry: ContentEntry }) => (
  <span className="ml-2 inline-flex gap-0.5">
    {LANGS.map((l) => (
      <span key={l.key} title={l.label} className="text-[0.5rem]">
        {entry[`content_${l.key}`] ? "🟢" : "⚪"}
      </span>
    ))}
  </span>
);

const AdminContentPage = () => {
  const [content, setContent] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<Lang>("en");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_content").select("*");
      const entries: ContentEntry[] = CONTENT_SCHEMA.map((schema) => {
        const db = data?.find((d: any) => d.page === schema.page && d.section === schema.section);
        return {
          ...schema,
          id: db?.id,
          content_en: db?.content_en || "",
          content_fr: db?.content_fr || "",
          content_ru: (db as any)?.content_ru || "",
        };
      });
      setContent(entries);
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (page: string, section: string, value: string) => {
    const col = `content_${activeLang}` as keyof ContentEntry;
    setContent((prev) =>
      prev.map((e) =>
        e.page === page && e.section === section ? { ...e, [col]: value } : e
      )
    );
  };

  const saveTab = async (page: string) => {
    setSaving(page);
    const col = `content_${activeLang}`;
    const entries = content.filter((e) => e.page === page);

    for (const entry of entries) {
      const val = entry[`content_${activeLang}`] || null;
      if (entry.id) {
        await supabase.from("site_content").update({ [col]: val } as any).eq("id", entry.id);
      } else if (val) {
        const { data } = await supabase
          .from("site_content")
          .insert({ page: entry.page, section: entry.section, [col]: val } as any)
          .select()
          .single();
        if (data) {
          setContent((prev) =>
            prev.map((e) =>
              e.page === entry.page && e.section === entry.section ? { ...e, id: data.id } : e
            )
          );
        }
      }
    }

    // Check for missing translations and suggest
    const otherLangs = LANGS.filter((l) => l.key !== activeLang);
    const missing = otherLangs.filter((l) =>
      entries.some((e) => !e[`content_${l.key}`] && e[`content_${activeLang}`])
    );

    if (missing.length > 0) {
      toast.success(`Saved! Missing translations: ${missing.map((l) => l.label).join(", ")}`, {
        action: {
          label: `Edit ${missing[0].label}`,
          onClick: () => setActiveLang(missing[0].key),
        },
        duration: 6000,
      });
    } else {
      toast.success("Content saved");
    }
    setSaving(null);
  };

  const activeValue = (entry: ContentEntry) => entry[`content_${activeLang}`];
  const placeholder = (entry: ContentEntry) => entry.content_en || entry.default_value || "Enter content…";

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-4">Content</h1>

      {/* Language switcher */}
      <div className="flex gap-1 mb-6">
        {LANGS.map((l) => (
          <button
            key={l.key}
            onClick={() => setActiveLang(l.key)}
            className={`px-4 py-1.5 text-xs font-body uppercase tracking-wider transition-colors ${
              activeLang === l.key
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <Tabs defaultValue="home">
        <TabsList>
          {PAGES.map((p) => (
            <TabsTrigger key={p.key} value={p.key}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PAGES.map((page) => (
          <TabsContent key={page.key} value={page.key} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">
                  {page.label} — {activeLang.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <>
                    {content
                      .filter((e) => e.page === page.key)
                      .map((entry) => (
                        <div key={entry.section}>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {entry.label}
                            <LangDots entry={entry} />
                          </label>
                          {entry.type === "textarea" ? (
                            <textarea
                              className="w-full px-3 py-2 border border-border bg-background text-sm resize-y min-h-[80px]"
                              value={activeValue(entry)}
                              placeholder={activeLang !== "en" ? placeholder(entry) : entry.default_value || "Enter content…"}
                              onChange={(e) => updateField(entry.page, entry.section, e.target.value)}
                            />
                          ) : (
                            <Input
                              value={activeValue(entry)}
                              placeholder={activeLang !== "en" ? placeholder(entry) : entry.default_value || "Enter content…"}
                              onChange={(e) => updateField(entry.page, entry.section, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    <Button
                      onClick={() => saveTab(page.key)}
                      disabled={saving === page.key}
                    >
                      {saving === page.key ? "Saving…" : "Save"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </AdminLayout>
  );
};

export default AdminContentPage;
