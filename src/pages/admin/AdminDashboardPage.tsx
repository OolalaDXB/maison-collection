import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, TrendingUp, CalendarDays } from "lucide-react";

interface KpiData {
  revenueMtd: number;
  occupancyRate: number;
  avgNightlyRate: number | null;
  bookingsCount: number;
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

const AdminDashboardPage = () => {
  const [kpis, setKpis] = useState<KpiData>({ revenueMtd: 0, occupancyRate: 0, avgNightlyRate: null, bookingsCount: 0 });
  const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
  const [inquiries, setInquiries] = useState<RecentInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

      const [bookingsRes, upcomingRes, inquiriesRes, propertiesRes] = await Promise.all([
        supabase.from("bookings").select("total_price, nights, base_price_per_night, status").gte("check_in", monthStart).lte("check_in", monthEnd),
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
      const occupancy = totalNights > 0 ? Math.round((totalNights / (daysInMonth * propCount)) * 100) : 0;

      setKpis({ revenueMtd: revenue, occupancyRate: occupancy, avgNightlyRate: avgRate, bookingsCount: bookings.length });

      const propMap = new Map((propertiesRes.data || []).map((p: any) => [p.id, p.name]));
      setUpcoming((upcomingRes.data || []).map((b: any) => ({ ...b, property_name: propMap.get(b.property_id) || "—" })));
      setInquiries((inquiriesRes.data as RecentInquiry[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={DollarSign} label="Revenue MTD" value={`€${kpis.revenueMtd.toLocaleString()}`} loading={loading} />
        <KpiCard icon={Percent} label="Occupancy Rate" value={`${kpis.occupancyRate}%`} loading={loading} />
        <KpiCard icon={TrendingUp} label="Avg Nightly Rate" value={kpis.avgNightlyRate ? `€${Math.round(kpis.avgNightlyRate)}` : "—"} loading={loading} />
        <KpiCard icon={CalendarDays} label="Bookings This Month" value={String(kpis.bookingsCount)} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming check-ins */}
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Upcoming Check-ins</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
              upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming check-ins</p> : (
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <Link key={b.id} to={`/admin/bookings`} className="flex items-center justify-between p-3 border border-border hover:border-primary transition-colors">
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.guest_name}</p>
                        <p className="text-xs text-muted-foreground">{b.property_name}</p>
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
        <Card>
          <CardHeader><CardTitle className="text-base font-display">Recent Inquiries</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
              inquiries.length === 0 ? <p className="text-sm text-muted-foreground">No inquiries yet</p> : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <Link key={inq.id} to="/admin/inquiries" className="block p-3 border border-border hover:border-primary transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-foreground">{inq.name}</p>
                        <span className="text-[0.65rem] px-2 py-0.5 bg-muted text-muted-foreground uppercase tracking-wider">{inq.type}</span>
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
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-display text-foreground">{loading ? "…" : value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    confirmed: "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]",
    pending: "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]",
    cancelled: "bg-[hsl(0,50%,92%)] text-[hsl(0,50%,35%)]",
    completed: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[0.6rem] px-2 py-0.5 uppercase tracking-wider ${colors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
};

export default AdminDashboardPage;
