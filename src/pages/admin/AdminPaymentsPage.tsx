import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PaymentConfig {
  id?: string;
  stripe_publishable_key: string;
  methods_enabled: { card: boolean; apple_pay: boolean; google_pay: boolean };
  currency: string;
}

interface Transaction {
  id: string;
  guest_name: string;
  guest_email: string;
  property_id: string;
  total_price: number;
  status: string | null;
  paid_at: string | null;
  stripe_payment_intent: string | null;
  created_at: string | null;
}

const AdminPaymentsPage = () => {
  const [config, setConfig] = useState<PaymentConfig>({ stripe_publishable_key: "", methods_enabled: { card: true, apple_pay: false, google_pay: false }, currency: "EUR" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [psRes, bRes, pRes] = await Promise.all([
        supabase.from("payment_settings").select("*").limit(1).single(),
        supabase.from("bookings").select("id, guest_name, guest_email, property_id, total_price, status, paid_at, stripe_payment_intent, created_at").order("created_at", { ascending: false }),
        supabase.from("properties").select("id, name"),
      ]);
      if (psRes.data) {
        setConfig({
          id: psRes.data.id,
          stripe_publishable_key: psRes.data.stripe_publishable_key || "",
          methods_enabled: (psRes.data.methods_enabled as any) || { card: true, apple_pay: false, google_pay: false },
          currency: psRes.data.currency || "EUR",
        });
      }
      setTransactions(bRes.data || []);
      const pm: Record<string, string> = {};
      (pRes.data || []).forEach((p: any) => { pm[p.id] = p.name; });
      setProperties(pm);
      setLoading(false);
    };
    load();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    if (config.id) {
      const { error } = await supabase.from("payment_settings").update({
        stripe_publishable_key: config.stripe_publishable_key || null,
        methods_enabled: config.methods_enabled as any,
        currency: config.currency,
      }).eq("id", config.id);
      if (error) toast.error(error.message);
      else toast.success("Configuration saved");
    } else {
      const { data, error } = await supabase.from("payment_settings").insert({
        stripe_publishable_key: config.stripe_publishable_key || null,
        methods_enabled: config.methods_enabled as any,
        currency: config.currency,
      }).select().single();
      if (error) toast.error(error.message);
      else { setConfig({ ...config, id: data.id }); toast.success("Configuration saved"); }
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Payments</h1>
      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-display">Payment Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stripe Publishable Key</label>
                <Input value={config.stripe_publishable_key} onChange={(e) => setConfig({ ...config, stripe_publishable_key: e.target.value })} placeholder="pk_live_…" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Payment Methods</label>
                <div className="space-y-2">
                  {(["card", "apple_pay", "google_pay"] as const).map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={config.methods_enabled[m]} onChange={(e) => setConfig({ ...config, methods_enabled: { ...config.methods_enabled, [m]: e.target.checked } })} />
                      {m === "card" ? "Card" : m === "apple_pay" ? "Apple Pay" : "Google Pay"}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
                <select className="px-3 py-2 border border-border bg-background text-sm" value={config.currency} onChange={(e) => setConfig({ ...config, currency: e.target.value })}>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <Button onClick={saveConfig} disabled={saving}>{saving ? "Saving…" : "Save Configuration"}</Button>
              <p className="text-xs text-muted-foreground mt-2">Stripe checkout integration coming soon. Currently bookings are confirmed manually.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions yet</TableCell></TableRow>
              ) : transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm">{t.guest_name}</TableCell>
                  <TableCell className="text-sm">{properties[t.property_id] || "—"}</TableCell>
                  <TableCell className="text-sm">€{t.total_price}</TableCell>
                  <TableCell>
                    <span className={`text-[0.65rem] px-2 py-0.5 uppercase tracking-wider ${t.paid_at ? "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]" : "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]"}`}>
                      {t.paid_at ? "paid" : "pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{t.stripe_payment_intent || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
