import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  guests_count: number | null;
  check_in: string;
  check_out: string;
  nights: number | null;
  base_price_per_night: number;
  cleaning_fee: number | null;
  tourist_tax_total: number | null;
  discount_amount: number | null;
  total_price: number;
  status: string | null;
  source: string | null;
  property_id: string;
  special_requests: string | null;
  internal_notes: string | null;
}

interface PropertyOption { id: string; name: string; cleaning_fee: number | null; tourist_tax_per_person: number | null; price_per_night: number | null; }

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]",
  pending: "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]",
  cancelled: "bg-[hsl(0,50%,92%)] text-[hsl(0,50%,35%)]",
  completed: "bg-muted text-muted-foreground",
  no_show: "bg-muted text-muted-foreground",
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProp, setFilterProp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [search, setSearch] = useState("");
  const [newDialog, setNewDialog] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const navigate = useNavigate();

  // New booking form
  const [nb, setNb] = useState({ property_id: "", guest_name: "", guest_email: "", guest_phone: "", guests_count: 1, check_in: "", check_out: "", base_price_per_night: 0, cleaning_fee: 0, tourist_tax_total: 0, discount_amount: 0, special_requests: "" });

  const loadData = async () => {
    const [bRes, pRes] = await Promise.all([
      supabase.from("bookings").select("*").order("check_in", { ascending: false }),
      supabase.from("properties").select("id, name, cleaning_fee, tourist_tax_per_person, price_per_night").order("display_order"),
    ]);
    setBookings(bRes.data || []);
    setProperties(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = bookings.filter((b) => {
    if (filterProp && b.property_id !== filterProp) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    if (filterSource && b.source !== filterSource) return false;
    if (search && !b.guest_name.toLowerCase().includes(search.toLowerCase()) && !b.guest_email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const propName = (id: string) => properties.find((p) => p.id === id)?.name || "—";

  const nbNights = nb.check_in && nb.check_out ? Math.max(0, Math.ceil((new Date(nb.check_out).getTime() - new Date(nb.check_in).getTime()) / 86400000)) : 0;
  const nbTotal = nbNights * nb.base_price_per_night + nb.cleaning_fee + nb.tourist_tax_total - nb.discount_amount;

  const openNewBooking = () => {
    const first = properties[0];
    setNb({
      property_id: first?.id || "", guest_name: "", guest_email: "", guest_phone: "",
      guests_count: 1, check_in: "", check_out: "",
      base_price_per_night: first?.price_per_night || 0,
      cleaning_fee: first?.cleaning_fee || 0, tourist_tax_total: 0, discount_amount: 0, special_requests: "",
    });
    setNewDialog(true);
  };

  const handlePropChange = (propId: string) => {
    const p = properties.find((pp) => pp.id === propId);
    setNb((prev) => ({
      ...prev,
      property_id: propId,
      base_price_per_night: p?.price_per_night || prev.base_price_per_night,
      cleaning_fee: p?.cleaning_fee || 0,
    }));
  };

  const createBooking = async () => {
    if (!nb.property_id || !nb.guest_name || !nb.guest_email || !nb.check_in || !nb.check_out || nbNights < 1) {
      toast.error("Fill all required fields"); return;
    }
    const { error } = await supabase.from("bookings").insert({
      property_id: nb.property_id, guest_name: nb.guest_name, guest_email: nb.guest_email,
      guest_phone: nb.guest_phone || null, guests_count: nb.guests_count,
      check_in: nb.check_in, check_out: nb.check_out,
      base_price_per_night: nb.base_price_per_night, cleaning_fee: nb.cleaning_fee,
      tourist_tax_total: nb.tourist_tax_total, discount_amount: nb.discount_amount,
      total_price: nbTotal, status: "confirmed", source: "manual",
      special_requests: nb.special_requests || null,
    } as any);
    if (error) { toast.error(error.message); return; }

    // Block dates in availability
    for (let i = 0; i < nbNights; i++) {
      const d = new Date(nb.check_in);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      await supabase.from("availability").upsert(
        { property_id: nb.property_id, date: dateStr, available: false, source: "booking" },
        { onConflict: "property_id,date" }
      );
    }

    toast.success("Booking created");
    setNewDialog(false);
    loadData();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }

    // If cancelled, unblock dates
    if (status === "cancelled") {
      const booking = bookings.find((b) => b.id === id);
      if (booking) {
        await supabase.from("availability").delete().eq("booking_id", id);
      }
    }

    toast.success(`Status → ${status}`);
    loadData();
    if (detailBooking?.id === id) setDetailBooking((prev) => prev ? { ...prev, status } : null);
  };

  const saveNotes = async () => {
    if (!detailBooking) return;
    const { error } = await supabase.from("bookings").update({ internal_notes: detailBooking.internal_notes }).eq("id", detailBooking.id);
    if (error) toast.error(error.message);
    else toast.success("Notes saved");
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Bookings</h1>
        <Button size="sm" onClick={openNewBooking}><Plus size={14} className="mr-1" /> New Booking</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select className="px-3 py-2 border border-border bg-background text-sm" value={filterProp} onChange={(e) => setFilterProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="px-3 py-2 border border-border bg-background text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {["pending", "confirmed", "cancelled", "completed", "no_show"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="px-3 py-2 border border-border bg-background text-sm" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
          <option value="">All Sources</option>
          {["direct", "airbnb", "manual"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="pl-8 pr-3 py-2 border border-border bg-background text-sm w-48" placeholder="Search guest…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Nights</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
          ) : filtered.map((b) => (
            <TableRow key={b.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailBooking(b)}>
              <TableCell className="text-sm">{b.guest_name}</TableCell>
              <TableCell className="text-sm">{propName(b.property_id)}</TableCell>
              <TableCell className="text-sm">{b.check_in}</TableCell>
              <TableCell className="text-sm">{b.check_out}</TableCell>
              <TableCell className="text-sm">{b.nights}</TableCell>
              <TableCell className="text-sm">€{b.total_price}</TableCell>
              <TableCell><span className={`text-[0.65rem] px-2 py-0.5 uppercase tracking-wider ${STATUS_COLORS[b.status || ""] || "bg-muted text-muted-foreground"}`}>{b.status}</span></TableCell>
              <TableCell className="text-sm text-muted-foreground">{b.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* New Booking Dialog */}
      <Dialog open={newDialog} onOpenChange={setNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">New Manual Booking</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-xs text-muted-foreground">Property</label>
              <select className="w-full px-3 py-2 border border-border bg-background text-sm" value={nb.property_id} onChange={(e) => handlePropChange(e.target.value)}>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Guest name</label><Input value={nb.guest_name} onChange={(e) => setNb({ ...nb, guest_name: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Email</label><Input type="email" value={nb.guest_email} onChange={(e) => setNb({ ...nb, guest_email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Phone</label><Input value={nb.guest_phone} onChange={(e) => setNb({ ...nb, guest_phone: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Guests</label><Input type="number" min={1} value={nb.guests_count} onChange={(e) => setNb({ ...nb, guests_count: parseInt(e.target.value) || 1 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Check-in</label><Input type="date" value={nb.check_in} onChange={(e) => setNb({ ...nb, check_in: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Check-out</label><Input type="date" value={nb.check_out} onChange={(e) => setNb({ ...nb, check_out: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Nightly rate (€)</label><Input type="number" value={nb.base_price_per_night} onChange={(e) => setNb({ ...nb, base_price_per_night: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="text-xs text-muted-foreground">Cleaning fee (€)</label><Input type="number" value={nb.cleaning_fee} onChange={(e) => setNb({ ...nb, cleaning_fee: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Tourist tax total (€)</label><Input type="number" value={nb.tourist_tax_total} onChange={(e) => setNb({ ...nb, tourist_tax_total: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="text-xs text-muted-foreground">Discount (€)</label><Input type="number" value={nb.discount_amount} onChange={(e) => setNb({ ...nb, discount_amount: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            {nbNights > 0 && (
              <div className="border border-border p-3 bg-muted/30 text-sm space-y-1">
                <div className="flex justify-between"><span>{nbNights} nights × €{nb.base_price_per_night}</span><span>€{nbNights * nb.base_price_per_night}</span></div>
                {nb.cleaning_fee > 0 && <div className="flex justify-between"><span>Cleaning</span><span>€{nb.cleaning_fee}</span></div>}
                {nb.tourist_tax_total > 0 && <div className="flex justify-between"><span>Tourist tax</span><span>€{nb.tourist_tax_total}</span></div>}
                {nb.discount_amount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span>-€{nb.discount_amount}</span></div>}
                <div className="flex justify-between font-display text-base border-t border-border pt-2 mt-2"><span>Total</span><span>€{nbTotal}</span></div>
              </div>
            )}
            <div><label className="text-xs text-muted-foreground">Special requests</label><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={2} value={nb.special_requests} onChange={(e) => setNb({ ...nb, special_requests: e.target.value })} /></div>
            <Button className="w-full" onClick={createBooking}>Create Booking</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Dialog */}
      <Dialog open={!!detailBooking} onOpenChange={(o) => { if (!o) setDetailBooking(null); }}>
        <DialogContent className="max-w-lg">
          {detailBooking && (
            <>
              <DialogHeader><DialogTitle className="font-display">Booking — {detailBooking.guest_name}</DialogTitle></DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Property:</span> {propName(detailBooking.property_id)}</div>
                  <div><span className="text-muted-foreground">Email:</span> {detailBooking.guest_email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {detailBooking.guest_phone || "—"}</div>
                  <div><span className="text-muted-foreground">Guests:</span> {detailBooking.guests_count}</div>
                  <div><span className="text-muted-foreground">Check-in:</span> {detailBooking.check_in}</div>
                  <div><span className="text-muted-foreground">Check-out:</span> {detailBooking.check_out}</div>
                  <div><span className="text-muted-foreground">Nights:</span> {detailBooking.nights}</div>
                  <div><span className="text-muted-foreground">Source:</span> {detailBooking.source}</div>
                </div>

                <div className="border border-border p-3 bg-muted/30 text-sm space-y-1">
                  <div className="flex justify-between"><span>{detailBooking.nights} nights × €{detailBooking.base_price_per_night}</span><span>€{(detailBooking.nights || 0) * detailBooking.base_price_per_night}</span></div>
                  {(detailBooking.cleaning_fee || 0) > 0 && <div className="flex justify-between"><span>Cleaning</span><span>€{detailBooking.cleaning_fee}</span></div>}
                  {(detailBooking.tourist_tax_total || 0) > 0 && <div className="flex justify-between"><span>Tourist tax</span><span>€{detailBooking.tourist_tax_total}</span></div>}
                  {(detailBooking.discount_amount || 0) > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span>-€{detailBooking.discount_amount}</span></div>}
                  <div className="flex justify-between font-display text-base border-t border-border pt-2 mt-2"><span>Total</span><span>€{detailBooking.total_price}</span></div>
                </div>

                {detailBooking.special_requests && (
                  <div><p className="text-xs text-muted-foreground mb-1">Special requests</p><p className="text-sm">{detailBooking.special_requests}</p></div>
                )}

                <div className="flex flex-wrap gap-2">
                  {detailBooking.status === "pending" && <Button size="sm" onClick={() => updateStatus(detailBooking.id, "confirmed")}>Confirm</Button>}
                  {(detailBooking.status === "pending" || detailBooking.status === "confirmed") && <Button size="sm" variant="destructive" onClick={() => updateStatus(detailBooking.id, "cancelled")}>Cancel</Button>}
                  {detailBooking.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => updateStatus(detailBooking.id, "completed")}>Mark Completed</Button>}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Internal Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-border bg-background text-sm resize-y"
                    rows={3}
                    value={detailBooking.internal_notes || ""}
                    onChange={(e) => setDetailBooking({ ...detailBooking, internal_notes: e.target.value })}
                  />
                  <Button size="sm" variant="outline" className="mt-2" onClick={saveNotes}>Save Notes</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBookingsPage;
