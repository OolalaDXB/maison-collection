import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, TrendingUp, CalendarDays } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, Cell } from "recharts";
import SEO from "@/components/SEO";

interface KpiData {
  revenueMtd: number;
  occupancyRate: number;
  avgNightlyRate: number | null;
  bookingsCount: number;
  revpar: number | null;
}

interface UpcomingBooking {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  property_name: string;
  status: string;
}

interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  created_at: string;
  message: string | null;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  nights: number;
}

interface PropertyRevenue {
  name: string;
  revenue: number;
  nights: number;
  occupancy: number;
  revpar: number;
}

const CHART_COLORS = [
  "hsl(36, 60%, 50%)",
  "hsl(210, 60%, 50%)",
  "hsl(150, 50%, 45%)",
  "hsl(0, 50%, 55%)",
  "hsl(270, 50%, 55%)",
];

const AdminDashboardPage = () => {
  const [kpis, setKpis] = useState<KpiData>({ revenueMtd: 0, occupancyRate: 0, avgNightlyRate: null, bookingsCount: 0, revpar: null });
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [inquiries, setInquiries] = useState<RecentInquiry[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [propertyData, setPropertyData] = useState<PropertyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

      // Last 6 months start
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const sixMonthsStart = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;

      const [bookingsRes, allBookingsRes, upcomingRes, inquiriesRes, propertiesRes] = await Promise.all([
        supabase.from("bookings").select("total_price, nights, base_price_per_night, status").gte("check_in", monthStart).lte("check_in", monthEnd),
        supabase.from("bookings").select("total_price, nights, check_in, status, property_id").gte("check_in", sixMonthsStart).in("status", ["confirmed", "completed"]),
        supabase.from("bookings").select("id, guest_name, check_in, check_out, status, property_id").gte("check_in", now.toISOString().split("T")[0]).order("check_in").limit(5),
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("properties").select("id, name"),
      ]);

      const bookings = bookingsRes.data || [];
      const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
      const revenue = confirmedBookings.reduce((s, b) => s + (Number(b.total_price) || 0), 0);
      const totalNights = confirmedBookings.reduce((s, b) => s + (b.nights || 0), 0);
      const avgRate = totalNights > 0 ? revenue / totalNights : null;
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const propCount = propertiesRes.data?.length || 1;
      const totalAvailableNights = daysInMonth * propCount;
      const occupancy = totalNights > 0 ? Math.round((totalNights / totalAvailableNights) * 100) : 0;
      const revpar = totalAvailableNights > 0 ? revenue / totalAvailableNights : null;

      setKpis({ revenueMtd: revenue, occupancyRate: occupancy, avgNightlyRate: avgRate, bookingsCount: bookings.length, revpar });

      // Monthly revenue trend (last 6 months)
      const allBookings = allBookingsRes.data || [];
      const monthlyMap = new Map<string, { revenue: number; nights: number }>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap.set(key, { revenue: 0, nights: 0 });
      }
      allBookings.forEach((b) => {
        const key = (b.check_in as string).substring(0, 7);
        const existing = monthlyMap.get(key);
        if (existing) {
          existing.revenue += Number(b.total_price) || 0;
          existing.nights += b.nights || 0;
        }
      });
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      setMonthlyData(
        Array.from(monthlyMap.entries()).map(([key, val]) => ({
          month: monthNames[parseInt(key.split("-")[1]) - 1],
          revenue: Math.round(val.revenue),
          nights: val.nights,
        }))
      );

      // Revenue by property
      const propMap = new Map((propertiesRes.data || []).map((p: any) => [p.id, p.name]));
      const propRevMap = new Map<string, { revenue: number; nights: number }>();
      // Use current month bookings for property breakdown
      confirmedBookings.forEach((b: any) => {
        const pid = b.property_id || "unknown";
        const existing = propRevMap.get(pid) || { revenue: 0, nights: 0 };
        existing.revenue += Number(b.total_price) || 0;
        existing.nights += b.nights || 0;
        propRevMap.set(pid, existing);
      });
      // Also add from allBookings for current month if not already covered
      allBookings.forEach((b: any) => {
        const key = (b.check_in as string).substring(0, 7);
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        if (key === currentKey) {
          const pid = b.property_id || "unknown";
          if (!propRevMap.has(pid)) {
            propRevMap.set(pid, { revenue: Number(b.total_price) || 0, nights: b.nights || 0 });
          }
        }
      });
      setPropertyData(
        Array.from(propRevMap.entries()).map(([pid, val]) => ({
          name: (propMap.get(pid) || "Autre").split(" ").slice(0, 2).join(" "),
          revenue: Math.round(val.revenue),
          nights: val.nights,
          occupancy: daysInMonth > 0 ? Math.round((val.nights / daysInMonth) * 100) : 0,
          revpar: daysInMonth > 0 ? Math.round(val.revenue / daysInMonth) : 0,
        }))
      );

      setUpcoming((upcomingRes.data || []).map((b: any) => ({ ...b, property_name: propMap.get(b.property_id) || "—" })));
      setInquiries((inquiriesRes.data as RecentInquiry[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const revenueChartConfig = { revenue: { label: "Revenus", color: "hsl(36, 60%, 50%)" } };
  const propertyChartConfig = { revenue: { label: "Revenus", color: "hsl(36, 60%, 50%)" } };

  return (
    <AdminLayout>
      <SEO title="Admin Dashboard" description="" path="/admin" noindex={true} />
      <div className="mb-8">
        <h1 className="font-display text-2xl">Dashboard</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Vue d'ensemble de vos propriétés</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard icon={DollarSign} label="Revenus MTD" value={`€${kpis.revenueMtd.toLocaleString()}`} loading={loading} />
        <KpiCard icon={Percent} label="Taux d'occupation" value={`${kpis.occupancyRate}%`} loading={loading} />
        <KpiCard icon={TrendingUp} label="Tarif moyen / nuit" value={kpis.avgNightlyRate ? `€${Math.round(kpis.avgNightlyRate)}` : "—"} loading={loading} />
        <KpiCard icon={TrendingUp} label="RevPAR" value={kpis.revpar ? `€${Math.round(kpis.revpar)}` : "—"} loading={loading} />
        <KpiCard icon={CalendarDays} label="Réservations ce mois" value={String(kpis.bookingsCount)} loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card className="border-[hsl(36,15%,90%)]">
          <CardHeader>
            <CardTitle className="text-base font-display">Tendance des revenus (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Chargement…</div>
            ) : (
              <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(36,15%,90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(36,10%,60%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(36,10%,60%)" tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => `€${Number(value).toLocaleString()}`} />} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(36, 60%, 50%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(36, 60%, 50%)" }} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Property */}
        <Card className="border-[hsl(36,15%,90%)]">
          <CardHeader>
            <CardTitle className="text-base font-display">Revenus par propriété (ce mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Chargement…</div>
            ) : propertyData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée ce mois</div>
            ) : (
              <ChartContainer config={propertyChartConfig} className="h-[250px] w-full">
                <BarChart data={propertyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(36,15%,90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(36,10%,60%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(36,10%,60%)" tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => `€${Number(value).toLocaleString()}`} />} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {propertyData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Performance Table */}
      {!loading && propertyData.length > 0 && (
        <Card className="border-[hsl(36,15%,90%)] mb-8">
          <CardHeader>
            <CardTitle className="text-base font-display">Performance par propriété</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(36,15%,90%)]">
                    <th className="text-left py-2 pr-4 font-display text-muted-foreground text-xs uppercase tracking-wider">Propriété</th>
                    <th className="text-right py-2 px-4 font-display text-muted-foreground text-xs uppercase tracking-wider">Revenus</th>
                    <th className="text-right py-2 px-4 font-display text-muted-foreground text-xs uppercase tracking-wider">Nuitées</th>
                    <th className="text-right py-2 px-4 font-display text-muted-foreground text-xs uppercase tracking-wider">Occupation</th>
                    <th className="text-right py-2 pl-4 font-display text-muted-foreground text-xs uppercase tracking-wider">RevPAR</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyData.map((p, i) => (
                    <tr key={i} className="border-b border-[hsl(36,15%,92%)] last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {p.name}
                      </td>
                      <td className="text-right py-2.5 px-4 text-foreground">€{p.revenue.toLocaleString()}</td>
                      <td className="text-right py-2.5 px-4 text-muted-foreground">{p.nights}</td>
                      <td className="text-right py-2.5 px-4 text-muted-foreground">{p.occupancy}%</td>
                      <td className="text-right py-2.5 pl-4 text-foreground font-medium">€{p.revpar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming check-ins */}
        <Card className="border-[hsl(36,15%,90%)]">
          <CardHeader><CardTitle className="text-base font-display">Prochains check-ins</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> :
              upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Aucun check-in à venir</p> : (
                <div className="space-y-2">
                  {upcoming.map((b) => (
                    <Link key={b.id} to={`/admin/bookings`} className="flex items-center justify-between p-3 border border-[hsl(36,15%,90%)] hover:border-primary/40 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.guest_name}</p>
                        <p className="text-xs text-muted-foreground font-display">{b.property_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{b.check_in}</p>
                        <StatusBadge status={b.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Recent inquiries */}
        <Card className="border-[hsl(36,15%,90%)]">
          <CardHeader><CardTitle className="text-base font-display">Dernières demandes</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> :
              inquiries.length === 0 ? <p className="text-sm text-muted-foreground">Aucune demande</p> : (
                <div className="space-y-2">
                  {inquiries.map((inq) => (
                    <Link key={inq.id} to="/admin/inquiries" className="block p-3 border border-[hsl(36,15%,90%)] hover:border-primary/40 transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-foreground">{inq.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.6rem] text-muted-foreground">{timeAgo(inq.created_at)}</span>
                          <span className="text-[0.6rem] px-2 py-0.5 bg-[hsl(36,20%,95%)] text-muted-foreground uppercase tracking-wider">{inq.type}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{inq.message || "—"}</p>
                    </Link>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const KpiCard = ({ icon: Icon, label, value, loading }: { icon: any; label: string; value: string; loading: boolean }) => (
  <Card className="border-[hsl(36,15%,90%)] border-l-2 border-l-primary">
    <CardContent className="pt-6 relative overflow-hidden">
      <Icon size={32} className="absolute top-4 right-4 text-primary opacity-[0.12]" />
      <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground font-body mb-1">{label}</p>
      <p className="text-3xl font-display text-foreground">{loading ? "…" : value}</p>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    confirmed: "bg-[hsl(120,35%,95%)] text-[hsl(120,40%,30%)]",
    pending: "bg-[hsl(45,70%,93%)] text-[hsl(45,60%,30%)]",
    cancelled: "bg-[hsl(0,45%,94%)] text-[hsl(0,50%,35%)]",
    completed: "bg-[hsl(36,20%,95%)] text-muted-foreground",
  };
  return <span className={`text-[0.6rem] px-2 py-0.5 uppercase tracking-wider ${colors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
};

export default AdminDashboardPage;
