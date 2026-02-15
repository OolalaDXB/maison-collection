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
  // Homepage — Hero
  { page: "home", section: "hero_title", default_value: "Houses with a point of view", label: "Hero Title", type: "text" },
  { page: "home", section: "hero_subtitle", default_value: "A collection of distinctive homes across Europe and beyond.", label: "Hero Subtitle", type: "textarea" },
  // Homepage — Collection
  { page: "home", section: "collection_label", default_value: "The Collection", label: "Collection Section Label", type: "text" },
  { page: "home", section: "collection_title", default_value: "Each maison is selected for its character, its relationship to place.", label: "Collection Title", type: "text" },
  // Homepage — Social Proof
  { page: "home", section: "social_proof", default_value: "across all properties · Superhost · Guest Favourite · 30+ five-star reviews", label: "Social Proof Text", type: "text" },
  // Homepage — Philosophy
  { page: "home", section: "philosophy_label", default_value: "Philosophy", label: "Philosophy Label", type: "text" },
  { page: "home", section: "philosophy_title", default_value: "Not rentals. Residences.", label: "Philosophy Title", type: "text" },
  { page: "home", section: "philosophy_text", default_value: "We don't believe in vacation rentals. We believe in places that change how you see the world — houses that become part of your story, not just your itinerary.", label: "Philosophy Text", type: "textarea" },
  { page: "home", section: "philosophy_quote", default_value: "Where houses become places.", label: "Philosophy Quote", type: "text" },
  // Homepage — Services
  { page: "home", section: "services_label", default_value: "Services", label: "Services Section Label", type: "text" },
  { page: "home", section: "services_title", default_value: "Beyond hospitality", label: "Services Title", type: "text" },
  { page: "home", section: "services_desc", default_value: "We also partner with select property owners to bring their vision to life.", label: "Services Description", type: "textarea" },
  { page: "home", section: "s1_title", default_value: "Selection & Positioning", label: "Service 1 Title", type: "text" },
  { page: "home", section: "s1_desc", default_value: "We identify properties with character and potential, transforming them into memorable destinations with narrative positioning and editorial storytelling.", label: "Service 1 Description", type: "textarea" },
  { page: "home", section: "s2_title", default_value: "Management", label: "Service 2 Title", type: "text" },
  { page: "home", section: "s2_desc", default_value: "Complete operational management: welcome, maintenance, guest screening, multilingual support in French, English, and Russian. Same-day response.", label: "Service 2 Description", type: "textarea" },
  { page: "home", section: "s3_title", default_value: "Revenue", label: "Service 3 Title", type: "text" },
  { page: "home", section: "s3_desc", default_value: "Intelligent pricing strategy, occupancy optimization focused on quality over volume. We position your property above the ordinary.", label: "Service 3 Description", type: "textarea" },
  { page: "home", section: "services_link", default_value: "Learn about our management services →", label: "Services Link Text", type: "text" },
  // Homepage — About Preview
  { page: "home", section: "about_desc", default_value: "Expatriate proprietors who returned to their roots to restore properties in places they know intimately. Not an agency. Not endless scaling. Just houses cared for properly.", label: "About Preview Text", type: "textarea" },
  { page: "home", section: "about_link", default_value: "Read our story →", label: "About Link Text", type: "text" },
  // Homepage — CTA
  { page: "home", section: "cta_discover", default_value: "Discover the Collection", label: "Hero CTA Discover", type: "text" },
  { page: "home", section: "cta_entrust", default_value: "Entrust your property", label: "Hero CTA Entrust", type: "text" },
  { page: "home", section: "travelers_label", default_value: "For Travelers", label: "Travelers Label", type: "text" },
  { page: "home", section: "travelers_title", default_value: "Stay in homes with a point of view.", label: "Travelers Title", type: "text" },
  { page: "home", section: "travelers_desc", default_value: "Few properties, high standards, real people behind every stay.", label: "Travelers Description", type: "textarea" },
  { page: "home", section: "travelers_cta", default_value: "Browse the collection", label: "Travelers CTA", type: "text" },
  { page: "home", section: "owners_label", default_value: "For Owners", label: "Owners Label", type: "text" },
  { page: "home", section: "owners_title", default_value: "We don't manage every property.", label: "Owners Title", type: "text" },
  { page: "home", section: "owners_desc", default_value: "Just the ones worth it. And if yours isn't ready yet — we'll get it there.", label: "Owners Description", type: "textarea" },
  { page: "home", section: "owners_cta", default_value: "Talk to us", label: "Owners CTA", type: "text" },

  // About
  { page: "about", section: "title", default_value: "Darya & Mickaël", label: "Page Title", type: "text" },
  { page: "about", section: "subtitle", default_value: "About", label: "Page Subtitle", type: "text" },
  { page: "about", section: "darya_p1", default_value: "Darya is Franco-Russian, with deep local knowledge of both Brittany and the Caucasus. She brings trilingual fluency in French, English, and Russian — and with it, natural access to three distinct markets.", label: "Darya Bio Paragraph 1", type: "textarea" },
  { page: "about", section: "darya_p2", default_value: "She handles the daily operations: welcome, maintenance, listening. Same-day response, always before 10am. Guests don't interact with a platform. They interact with a person.", label: "Darya Bio Paragraph 2", type: "textarea" },
  { page: "about", section: "philosophy_title", default_value: "Philosophy", label: "Philosophy Title", type: "text" },
  { page: "about", section: "philosophy_p1", default_value: "Not an agency. Not endless scaling. Just houses cared for properly.", label: "Philosophy Paragraph 1", type: "textarea" },
  { page: "about", section: "philosophy_p2", default_value: "We are expatriate proprietors who returned to our roots to restore properties in places we know intimately. Every maison in our collection reflects a place we've lived, a landscape we've walked, a community we belong to.", label: "Philosophy Paragraph 2", type: "textarea" },
  { page: "about", section: "locations_label", default_value: "Where we are", label: "Locations Label", type: "text" },
  { page: "about", section: "signature", default_value: "— Darya & Mickaël", label: "Signature", type: "text" },

  // Management
  { page: "management", section: "hero_title", default_value: "We started with our own homes.", label: "Hero Title", type: "text" },
  { page: "management", section: "hero_p1", default_value: "A mountain duplex in the Caucasus. A stone house reimagined by architects in Brittany. A family townhouse in Dubai's only net-zero community.", label: "Hero Paragraph 1", type: "textarea" },
  { page: "management", section: "hero_p2", default_value: "We didn't start as managers — we started as owners. We learned what it takes to earn five stars every time: the right photos, the right words, the right pricing, the right welcome. Now we bring that to a handful of other properties. Not an agency. Not a platform. Just us, doing for your home what we do for ours.", label: "Hero Paragraph 2", type: "textarea" },
  { page: "management", section: "whatwedo_title", default_value: "What we do.", label: "What We Do Title", type: "text" },
  { page: "management", section: "step_1", default_value: "We visit your property. We assess it honestly. Not every home makes it into the collection. We look for character, location, and something worth building on. If it's not ready, we'll tell you what it needs.", label: "Step 1", type: "textarea" },
  { page: "management", section: "step_2", default_value: "We get it to the level. Styling, photography direction, the listing narrative, amenity upgrades if needed. We work with architects, designers, and photographers we trust. We don't just put your property online — we make it the version of itself that guests remember.", label: "Step 2", type: "textarea" },
  { page: "management", section: "step_3", default_value: "We handle everything. Pricing that adapts to demand, guest vetting, multilingual communication in French, English and Russian, check-in coordination, cleaning, maintenance, quality checks. You get a monthly report and peace of mind. Same-day response before 10am.", label: "Step 3", type: "textarea" },
  { page: "management", section: "proof_title", default_value: "Our own track record.", label: "Track Record Title", type: "text" },
  { page: "management", section: "notready_title", default_value: "Your property isn't there yet?", label: "Not Ready Title", type: "text" },
  { page: "management", section: "notready_subtitle", default_value: "That's why we're here.", label: "Not Ready Subtitle", type: "text" },
  { page: "management", section: "notready_p1", default_value: "Not every home is ready on day one. Some need styling. Some need better photography. Some need a complete rethink of how guests experience the space.", label: "Not Ready Paragraph 1", type: "textarea" },
  { page: "management", section: "notready_p2", default_value: "We work with architects, interior designers, and photographers to bring properties up to the standard. From a weekend of staging to a full renovation — we scope it, manage it, and deliver it.", label: "Not Ready Paragraph 2", type: "textarea" },
  { page: "management", section: "contact_title", default_value: "Let's talk about your property.", label: "Contact Title", type: "text" },
  { page: "management", section: "contact_desc", default_value: "Tell us where it is and what you're thinking. We'll get back to you within 24 hours.", label: "Contact Description", type: "textarea" },
  { page: "management", section: "contact_thanks", default_value: "Thank you — we'll be in touch within 24 hours.", label: "Contact Thank You", type: "text" },
  { page: "management", section: "faq_title", default_value: "Questions.", label: "FAQ Title", type: "text" },

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
        <TabsList className="flex-wrap">
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