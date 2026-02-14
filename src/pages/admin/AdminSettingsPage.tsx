import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface PropertyIntegration {
  id: string;
  name: string;
  slug: string;
  airbnb_ical_url: string | null;
  ical_export_token: string | null;
}

const AdminSettingsPage = () => {
  const [properties, setProperties] = useState<PropertyIntegration[]>([]);
  const [icalUrls, setIcalUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [contactEmail, setContactEmail] = useState("chez@maisons.co");
  const [defaultLang, setDefaultLang] = useState("FR");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("properties").select("id, name, slug, airbnb_ical_url, ical_export_token").order("display_order");
      if (data) {
        setProperties(data);
        const urls: Record<string, string> = {};
        data.forEach((p: any) => { urls[p.id] = p.airbnb_ical_url || ""; });
        setIcalUrls(urls);
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveIcalUrl = async (propId: string) => {
    const { error } = await supabase.from("properties").update({ airbnb_ical_url: icalUrls[propId] || null }).eq("id", propId);
    if (error) toast.error(error.message);
    else toast.success("iCal URL saved");
  };

  const testIcalUrl = async (url: string) => {
    if (!url) { toast.error("No URL to test"); return; }
    try {
      const res = await fetch(url);
      if (res.ok) toast.success("iCal URL is reachable");
      else toast.error(`HTTP ${res.status}`);
    } catch {
      toast.error("Could not reach URL (CORS may block this test)");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Settings</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Site Name</label>
                <Input value="Maisons" disabled />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Contact Email</label>
                <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Default Language</label>
                <select className="px-3 py-2 border border-border bg-background text-sm" value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)}>
                  <option value="FR">Français</option>
                  <option value="EN">English</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          {properties.map((p) => {
            const exportUrl = `https://maisons.co/ical/${p.slug}/${p.ical_export_token}`;
            return (
              <Card key={p.id}>
                <CardHeader><CardTitle className="text-base font-display">{p.name}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Airbnb iCal URL</label>
                    <div className="flex gap-2">
                      <Input
                        value={icalUrls[p.id] || ""}
                        onChange={(e) => setIcalUrls({ ...icalUrls, [p.id]: e.target.value })}
                        placeholder="https://www.airbnb.com/calendar/ical/…"
                        className="flex-1"
                      />
                      <Button size="sm" variant="outline" onClick={() => testIcalUrl(icalUrls[p.id] || "")}>Test</Button>
                      <Button size="sm" onClick={() => saveIcalUrl(p.id)}>Save</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">iCal Export URL</label>
                    <div className="flex gap-2">
                      <Input value={exportUrl} readOnly className="flex-1 text-xs" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(exportUrl)}><Copy size={14} /></Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Last synced: never · Automatic iCal sync requires a Supabase Edge Function (coming soon).</p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="admins" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Admin Users</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Admin users are managed through the Supabase dashboard. Add users in Auth → Users, then assign the admin role in the user_roles table.</p>
              <a
                href="https://supabase.com/dashboard/project/gugduludshezdsplkkxu/auth/users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline underline-offset-4"
              >
                Open Supabase Auth Dashboard ↗
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
