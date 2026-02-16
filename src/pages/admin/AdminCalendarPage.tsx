import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface PropertyOption {
  id: string;
  name: string;
  slug: string;
}

interface AvailabilityDay {
  property_id: string;
  date: string;
  available: boolean | null;
  price_override: number | null;
  source: string | null;
  booking_id: string | null;
}

interface BookingBar {
  id: string;
  property_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string | null;
  source: string | null;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Distinct color palette per property (up to 5)
const PROP_COLORS = [
  { bg: "hsl(10,50%,55%)", light: "hsl(10,40%,92%)", border: "hsl(10,40%,75%)" },   // terracotta
  { bg: "hsl(210,55%,50%)", light: "hsl(210,50%,92%)", border: "hsl(210,40%,75%)" }, // blue
  { bg: "hsl(160,40%,45%)", light: "hsl(160,35%,90%)", border: "hsl(160,30%,70%)" }, // teal
  { bg: "hsl(45,70%,50%)", light: "hsl(45,60%,90%)", border: "hsl(45,50%,70%)" },    // gold
  { bg: "hsl(280,40%,55%)", light: "hsl(280,35%,92%)", border: "hsl(280,30%,75%)" }, // purple
];

const AIRBNB_COLOR = { bg: "hsl(210,80%,55%)", light: "hsl(210,70%,92%)", border: "hsl(210,60%,75%)" };

const AdminCalendarPage = () => {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [visibleProps, setVisibleProps] = useState<Set<string>>(new Set());
  const [month, setMonth] = useState(() => new Date());
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [bookings, setBookings] = useState<BookingBar[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [priceOverride, setPriceOverride] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    supabase.from("properties").select("id, name, slug").order("display_order").then(({ data }) => {
      if (data) {
        setProperties(data);
        setVisibleProps(new Set(data.map((p) => p.id)));
      }
    });
  }, []);

  const year = month.getFullYear();
  const mo = month.getMonth();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const firstDow = (new Date(year, mo, 1).getDay() + 6) % 7; // Mon=0
  const monthStr = `${year}-${String(mo + 1).padStart(2, "0")}`;

  const fetchCalendarData = () => {
    const start = `${monthStr}-01`;
    const end = `${monthStr}-${daysInMonth}`;
    Promise.all([
      supabase.from("availability").select("*").gte("date", start).lte("date", end),
      supabase.from("bookings").select("id, property_id, guest_name, check_in, check_out, status, source").or(`check_in.lte.${end},check_out.gte.${start}`),
    ]).then(([avRes, bkRes]) => {
      setAvailability(avRes.data || []);
      setBookings(bkRes.data || []);
    });
  };

  useEffect(() => { fetchCalendarData(); }, [monthStr, daysInMonth]);

  const { data: lastSync, refetch: refetchSync } = useQuery({
    queryKey: ["ical-last-sync"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ical_sync_log")
        .select("*")
        .order("synced_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-ical");
      if (error) throw error;
      const summary = data?.results?.map((r: any) => `${r.property}: ${r.events_found} events, ${r.events_created} new`).join("; ");
      toast.success(`Sync done — ${summary || "No properties configured"}`);
      fetchCalendarData();
      refetchSync();
    } catch (err: any) {
      toast.error(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const getBookingsForDay = (day: number) => {
    const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
    return bookings.filter((b) => b.check_in <= dateStr && b.check_out > dateStr && visibleProps.has(b.property_id));
  };

  const getAvailForDay = (day: number) => {
    const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
    return availability.filter((a) => a.date === dateStr && visibleProps.has(a.property_id));
  };

  const propColorMap = useMemo(() => {
    const map = new Map<string, typeof PROP_COLORS[0]>();
    properties.forEach((p, i) => map.set(p.id, PROP_COLORS[i % PROP_COLORS.length]));
    return map;
  }, [properties]);

  const propShortName = useMemo(() => {
    const map = new Map<string, string>();
    properties.forEach((p) => {
      // Extract short name: "Maison Georgia" → "Georgia"
      const parts = p.name.split(" ");
      map.set(p.id, parts.length > 1 ? parts.slice(1).join(" ") : p.name);
    });
    return map;
  }, [properties]);

  const handleDayClick = (day: number) => {
    const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedPropId(properties[0]?.id || null);
    const avail = availability.find((a) => a.date === dateStr && a.property_id === properties[0]?.id);
    setPriceOverride(avail?.price_override?.toString() || "");
  };

  const currentAvail = useMemo(() => {
    if (!selectedDate || !selectedPropId) return null;
    return availability.find((a) => a.date === selectedDate && a.property_id === selectedPropId) || null;
  }, [selectedDate, selectedPropId, availability]);

  const isBlocked = currentAvail?.available === false;

  const toggleBlock = async () => {
    if (!selectedDate || !selectedPropId) return;
    setDialogLoading(true);
    const newAvailable = isBlocked ? true : false;
    const { error } = await supabase.from("availability").upsert(
      { property_id: selectedPropId, date: selectedDate, available: newAvailable, source: "manual" },
      { onConflict: "property_id,date" }
    );
    setDialogLoading(false);
    if (error) { toast.error(error.message); return; }
    setAvailability((prev) => {
      const filtered = prev.filter((a) => !(a.date === selectedDate && a.property_id === selectedPropId));
      return [...filtered, { property_id: selectedPropId, date: selectedDate, available: newAvailable, price_override: currentAvail?.price_override ?? null, source: "manual", booking_id: null, min_nights_override: null, airbnb_uid: null } as any];
    });
    toast.success(newAvailable ? "Date unblocked" : "Date blocked");
  };

  const savePriceOverride = async () => {
    if (!selectedDate || !selectedPropId) return;
    setDialogLoading(true);
    const val = priceOverride ? parseFloat(priceOverride) : null;
    const { error } = await supabase.from("availability").upsert(
      { property_id: selectedPropId, date: selectedDate, price_override: val, source: "manual", available: currentAvail?.available ?? true },
      { onConflict: "property_id,date" }
    );
    setDialogLoading(false);
    if (error) { toast.error(error.message); return; }
    setAvailability((prev) => {
      const filtered = prev.filter((a) => !(a.date === selectedDate && a.property_id === selectedPropId));
      return [...filtered, { property_id: selectedPropId, date: selectedDate, available: currentAvail?.available ?? true, price_override: val, source: "manual", booking_id: null } as any];
    });
    toast.success(val ? `Price set to €${val}` : "Price reset to default");
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Calendar</h1>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-xs text-muted-foreground hidden md:inline">
              Last sync: {new Date(lastSync.synced_at).toLocaleString()} —
              {lastSync.status === "success"
                ? ` ${lastSync.events_found} events, ${lastSync.events_created} new`
                : ` Error: ${lastSync.error_message}`}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleSyncNow} disabled={syncing}>
            {syncing ? <Loader2 className="animate-spin mr-2" size={14} /> : <RefreshCw size={14} className="mr-2" />}
            Sync Airbnb
          </Button>
        </div>
      </div>

      {/* Property toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {properties.map((p) => {
          const color = propColorMap.get(p.id);
          return (
            <button
              key={p.id}
              onClick={() => setVisibleProps((prev) => {
                const next = new Set(prev);
                next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                return next;
              })}
              className="px-3 py-1 text-xs border transition-colors"
              style={visibleProps.has(p.id) ? { backgroundColor: color?.bg, color: "#fff", borderColor: color?.bg } : {}}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => setMonth(new Date(year, mo - 1))}>
          <ChevronLeft size={16} />
        </Button>
        <span className="font-display text-lg min-w-[160px] text-center">
          {month.toLocaleString("en", { month: "long", year: "numeric" })}
        </span>
        <Button variant="outline" size="icon" onClick={() => setMonth(new Date(year, mo + 1))}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[600px]">
            {WEEKDAYS.map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground border-b border-border">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={i} className="border-b border-r border-border p-2 min-h-[80px] bg-muted/20" />;
              const dayBookings = getBookingsForDay(day);
              const dayAvail = getAvailForDay(day);
              // Property IDs that already have a booking bar shown — skip their availability blocks
              const bookedPropIds = new Set(dayBookings.map((b) => b.property_id));
              // Separate airbnb blocks from manual blocks — never show both for the same entry
              const airbnbBlocked = dayAvail.filter((a) => a.source?.startsWith("airbnb") && a.available === false && !bookedPropIds.has(a.property_id));
              const airbnbBlockedPropIds = new Set(airbnbBlocked.map((a) => a.property_id));
              const manualBlocked = dayAvail.filter((a) => a.available === false && !a.booking_id && !bookedPropIds.has(a.property_id) && !a.source?.startsWith("airbnb"));

              return (
                <div
                  key={i}
                  className="border-b border-r border-border p-1.5 min-h-[80px] cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handleDayClick(day)}
                >
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className="space-y-0.5 mt-1">
                    {dayBookings.map((b) => {
                      const isAirbnb = b.source?.startsWith("airbnb");
                      const c = isAirbnb ? AIRBNB_COLOR : propColorMap.get(b.property_id);
                      return (
                        <div key={b.id} className="text-[0.55rem] text-[hsl(0,0%,100%)] px-1 py-0.5 truncate" style={{ backgroundColor: c?.bg }} title={`${isAirbnb ? "Airbnb · " : ""}${propShortName.get(b.property_id)} — ${b.guest_name}`}>
                          {b.guest_name}
                        </div>
                      );
                    })}
                    {manualBlocked.map((a) => {
                      const c = propColorMap.get(a.property_id);
                      return (
                        <div key={`mb-${a.property_id}`} className="text-[0.55rem] px-1 py-0.5 opacity-70" style={{ backgroundColor: c?.light, color: c?.bg, borderLeft: `3px solid ${c?.bg}`, backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 3px, ${c?.border} 3px, ${c?.border} 4.5px)` }}>
                          {propShortName.get(a.property_id)} · Blocked
                        </div>
                      );
                    })}
                    {airbnbBlocked.map((a) => {
                      const c = propColorMap.get(a.property_id);
                      return (
                        <div key={`ab-${a.property_id}`} className="text-[0.55rem] px-1 py-0.5 opacity-70" style={{ backgroundColor: c?.light, color: c?.bg, borderLeft: `3px solid ${c?.bg}`, backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 3px, ${c?.border} 3px, ${c?.border} 4.5px)` }}>
                          {propShortName.get(a.property_id)} · Airbnb
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Date detail dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(o) => { if (!o) setSelectedDate(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{selectedDate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Property</label>
              <select
                className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm"
                value={selectedPropId || ""}
                onChange={(e) => {
                  setSelectedPropId(e.target.value);
                  const avail = availability.find((a) => a.date === selectedDate && a.property_id === e.target.value);
                  setPriceOverride(avail?.price_override?.toString() || "");
                }}
              >
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">{isBlocked ? "Blocked" : "Available"}</span>
              <Button size="sm" variant={isBlocked ? "default" : "outline"} onClick={toggleBlock} disabled={dialogLoading}>
                {isBlocked ? "Unblock" : "Block"}
              </Button>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Price override (€)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  placeholder="Default"
                  className="flex-1"
                />
                <Button size="sm" onClick={savePriceOverride} disabled={dialogLoading}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => { setPriceOverride(""); savePriceOverride(); }} disabled={dialogLoading}>Reset</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCalendarPage;
