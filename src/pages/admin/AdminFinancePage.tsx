import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useFxRates } from "@/hooks/useFxRates";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import SEO from "@/components/SEO";

interface Booking {
  id: string;
  check_in: string;
  total_price: number;
  cleaning_fee: number | null;
  tourist_tax_total: number | null;
  status: string | null;
  source: string | null;
  property_id: string;
  airbnb_payout: number | null;
  airbnb_service_fee: number | null;
  payment_status: string | null;
}

interface Property {
  id: string;
  name: string;
}

const CURRENCIES = ["EUR", "USD", "AED", "GEL"] as const;

const AdminFinancePage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-12-31`;
  });
  const [currency, setCurrency] = useState<string>("EUR");
  const { convertFromEur, formatPrice } = useFxRates();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [bRes, pRes] = await Promise.all([
        supabase.from("bookings").select("id, check_in, total_price, cleaning_fee, tourist_tax_total, status, source, property_id, airbnb_payout, airbnb_service_fee, payment_status")
          .gte("check_in", dateFrom).lte("check_in", dateTo).order("check_in"),
        supabase.from("properties").select("id, name").order("display_order"),
      ]);
      setBookings(bRes.data || []);
      setProperties(pRes.data || []);
      setLoading(false);
    };
    load();
  }, [dateFrom, dateTo]);

  const confirmed = useMemo(() => bookings.filter(b => b.status === "confirmed" || b.status === "completed"), [bookings]);
  const propMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

  const conv = (eur: number) => currency === "EUR" ? eur : convertFromEur(eur, currency);
  const fmt = (amount: number) => formatPrice(Math.round(amount), currency);

  // Monthly revenue chart data
  const monthlyData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    confirmed.forEach(b => {
      const month = b.check_in.slice(0, 7); // YYYY-MM
      if (!map.has(month)) map.set(month, {});
      const entry = map.get(month)!;
      const propName = propMap.get(b.property_id) || "Other";
      entry[propName] = (entry[propName] || 0) + Number(b.total_price || 0);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => {
        const converted: Record<string, string | number> = { month };
        Object.entries(data).forEach(([key, val]) => {
          converted[key] = Math.round(conv(val));
        });
        return converted;
      });
  }, [confirmed, propMap, currency, convertFromEur]);

  // Property summary
  const propSummary = useMemo(() => {
    const map = new Map<string, { revenue: number; bookings: number; paid: number; airbnbFees: number }>();
    confirmed.forEach(b => {
      const pid = b.property_id;
      if (!map.has(pid)) map.set(pid, { revenue: 0, bookings: 0, paid: 0, airbnbFees: 0 });
      const entry = map.get(pid)!;
      entry.revenue += Number(b.total_price || 0);
      entry.bookings += 1;
      if (b.payment_status === "paid") entry.paid += Number(b.total_price || 0);
      entry.airbnbFees += Number(b.airbnb_service_fee || 0);
    });
    return Array.from(map.entries()).map(([pid, data]) => ({
      id: pid,
      name: propMap.get(pid) || "—",
      ...data,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [confirmed, propMap]);

  const totalRevenue = confirmed.reduce((s, b) => s + Number(b.total_price || 0), 0);
  const totalPaid = confirmed.filter(b => b.payment_status === "paid").reduce((s, b) => s + Number(b.total_price || 0), 0);
  const totalAirbnbFees = confirmed.reduce((s, b) => s + Number(b.airbnb_service_fee || 0), 0);

  const propNames = [...new Set(confirmed.map(b => propMap.get(b.property_id) || "Other"))];
  const COLORS = ["hsl(10,40%,55%)", "hsl(200,50%,50%)", "hsl(45,70%,50%)", "hsl(120,35%,45%)", "hsl(280,40%,55%)"];

  return (
    <AdminLayout>
      <SEO title="Finance — Admin" description="" path="/admin/finance" noindex />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl">Finance</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input type="date" className="w-36 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span className="text-muted-foreground text-sm">→</span>
            <Input type="date" className="w-36 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-border bg-background text-sm h-9" value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10"><DollarSign size={18} className="text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-xl font-display">{loading ? "…" : fmt(conv(totalRevenue))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10"><TrendingUp size={18} className="text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Encaissé</p>
                <p className="text-xl font-display">{loading ? "…" : fmt(conv(totalPaid))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10"><Calendar size={18} className="text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Réservations confirmées</p>
                <p className="text-xl font-display">{loading ? "…" : confirmed.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart — Revenue by month & property */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-base font-display">Revenus par mois</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : monthlyData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée pour cette période</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                {propNames.map((name, i) => (
                  <Bar key={name} dataKey={name} stackId="a" fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Table — Revenue by property */}
      <Card>
        <CardHeader><CardTitle className="text-base font-display">Détail par propriété</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriété</TableHead>
                <TableHead className="text-right">Réservations</TableHead>
                <TableHead className="text-right">CA total</TableHead>
                <TableHead className="text-right">Encaissé</TableHead>
                <TableHead className="text-right">Frais Airbnb</TableHead>
                <TableHead className="text-right">Net estimé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chargement…</TableCell></TableRow>
              ) : propSummary.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune donnée</TableCell></TableRow>
              ) : (
                <>
                  {propSummary.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm text-right">{p.bookings}</TableCell>
                      <TableCell className="text-sm text-right">{fmt(conv(p.revenue))}</TableCell>
                      <TableCell className="text-sm text-right">{fmt(conv(p.paid))}</TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground">{fmt(conv(p.airbnbFees))}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{fmt(conv(p.revenue - p.airbnbFees))}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-border font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{confirmed.length}</TableCell>
                    <TableCell className="text-right">{fmt(conv(totalRevenue))}</TableCell>
                    <TableCell className="text-right">{fmt(conv(totalPaid))}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmt(conv(totalAirbnbFees))}</TableCell>
                    <TableCell className="text-right">{fmt(conv(totalRevenue - totalAirbnbFees))}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminFinancePage;
