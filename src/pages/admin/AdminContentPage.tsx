import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContentEntry {
  id?: string;
  page: string;
  section: string;
  content_fr: string;
  default_value: string;
  label: string;
  type: "text" | "textarea";
}

const CONTENT_SCHEMA: ContentEntry[] = [
  // Homepage
  { page: "home", section: "hero_title", content_fr: "", default_value: "Houses with a point of view", label: "Hero Title", type: "text" },
  { page: "home", section: "hero_subtitle", content_fr: "", default_value: "A collection of distinctive homes across Europe and beyond — chosen for design, location, and soul.", label: "Hero Subtitle", type: "textarea" },
  { page: "home", section: "philosophy_title", content_fr: "", default_value: "Not rentals. Residences.", label: "Philosophy Title", type: "text" },
  { page: "home", section: "philosophy_text", content_fr: "", default_value: "Every Maison is a place we'd live in ourselves — chosen for its architecture, its light, its location, and the feeling it gives you when you walk through the door.", label: "Philosophy Text", type: "textarea" },
  // About
  { page: "about", section: "darya_bio", content_fr: "", default_value: "", label: "Darya Bio", type: "textarea" },
  { page: "about", section: "philosophy_text", content_fr: "", default_value: "", label: "Philosophy Text", type: "textarea" },
  { page: "about", section: "signature", content_fr: "", default_value: "— Darya & Mickaël", label: "Signature", type: "text" },
  // Management
  { page: "management", section: "intro_title", content_fr: "", default_value: "", label: "Intro Title", type: "text" },
  { page: "management", section: "intro_text", content_fr: "", default_value: "", label: "Intro Text", type: "textarea" },
  // Contact
  { page: "contact", section: "intro_text", content_fr: "", default_value: "", label: "Intro Text", type: "textarea" },
];

const PAGES = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About" },
  { key: "management", label: "Management" },
  { key: "contact", label: "Contact" },
];

const AdminContentPage = () => {
  const [content, setContent] = useState<ContentEntry[]>(CONTENT_SCHEMA.map((s) => ({ ...s })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_content").select("*");
      if (data) {
        setContent((prev) => prev.map((entry) => {
          const db = data.find((d: any) => d.page === entry.page && d.section === entry.section);
          return db ? { ...entry, id: db.id, content_fr: db.content_fr || "" } : entry;
        }));
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateField = (page: string, section: string, value: string) => {
    setContent((prev) => prev.map((e) => e.page === page && e.section === section ? { ...e, content_fr: value } : e));
  };

  const saveTab = async (page: string) => {
    setSaving(page);
    const entries = content.filter((e) => e.page === page);
    for (const entry of entries) {
      if (entry.id) {
        await supabase.from("site_content").update({ content_fr: entry.content_fr || null }).eq("id", entry.id);
      } else if (entry.content_fr) {
        const { data } = await supabase.from("site_content").insert({ page: entry.page, section: entry.section, content_fr: entry.content_fr }).select().single();
        if (data) {
          setContent((prev) => prev.map((e) => e.page === entry.page && e.section === entry.section ? { ...e, id: data.id } : e));
        }
      }
    }
    toast.success("Content saved");
    setSaving(null);
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Content</h1>
      <Tabs defaultValue="home">
        <TabsList>
          {PAGES.map((p) => <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>)}
        </TabsList>

        {PAGES.map((page) => (
          <TabsContent key={page.key} value={page.key} className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base font-display">{page.label}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
                  <>
                    {content.filter((e) => e.page === page.key).map((entry) => (
                      <div key={entry.section}>
                        <label className="text-xs text-muted-foreground mb-1 block">{entry.label}</label>
                        {entry.type === "textarea" ? (
                          <textarea
                            className="w-full px-3 py-2 border border-border bg-background text-sm resize-y min-h-[80px]"
                            value={entry.content_fr}
                            placeholder={entry.default_value || "Enter content…"}
                            onChange={(e) => updateField(entry.page, entry.section, e.target.value)}
                          />
                        ) : (
                          <Input
                            value={entry.content_fr}
                            placeholder={entry.default_value || "Enter content…"}
                            onChange={(e) => updateField(entry.page, entry.section, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                    <Button onClick={() => saveTab(page.key)} disabled={saving === page.key}>
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
