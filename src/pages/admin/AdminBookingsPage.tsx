import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Save, Trash2, CreditCard, CheckCircle, Upload } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFxRates } from "@/hooks/useFxRates";
import AirbnbCsvImportDialog from "@/components/admin/AirbnbCsvImportDialog";

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
  discount_reason: string | null;
  total_price: number;
  status: string | null;
  source: string | null;
  property_id: string;
  special_requests: string | null;
  internal_notes: string | null;
  payment_status: string | null;
  payment_method: string | null;
  paid_at: string | null;
  airbnb_payout: number | null;
  airbnb_service_fee: number | null;
  airbnb_confirmation_code: string | null;
  stripe_payment_intent: string | null;
  stripe_session_id: string | null;
  created_at: string | null;
}

interface PropertyOption { id: string; name: string; cleaning_fee: number | null; tourist_tax_per_person: number | null; price_per_night: number | null; }

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]",
  pending: "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]",
  cancelled: "bg-[hsl(0,50%,92%)] text-[hsl(0,50%,35%)]",
  completed: "bg-muted text-muted-foreground",
  no_show: "bg-muted text-muted-foreground",
};

const CURRENCIES = ["EUR", "USD", "AED", "GEL"] as const;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs text-muted-foreground block mb-1">{label}</label>
    {children}
  </div>
);

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProp, setFilterProp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currency, setCurrency] = useState<string>("EUR");
  const [newDialog, setNewDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const { convertFromEur, formatPrice } = useFxRates();

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
    if (dateFrom && b.check_in < dateFrom) return false;
    if (dateTo && b.check_in > dateTo) return false;
    if (search && !b.guest_name.toLowerCase().includes(search.toLowerCase()) && !b.guest_email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const conv = (eur: number) => currency === "EUR" ? eur : convertFromEur(eur, currency);
  const fmt = (amount: number) => formatPrice(Math.round(amount), currency);

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

  // Edit helpers
  const setField = (field: keyof Booking, value: any) => {
    if (!editBooking) return;
    setEditBooking({ ...editBooking, [field]: value });
  };

  const editNights = editBooking?.check_in && editBooking?.check_out
    ? Math.max(0, Math.ceil((new Date(editBooking.check_out).getTime() - new Date(editBooking.check_in).getTime()) / 86400000))
    : editBooking?.nights || 0;

  const editTotal = editNights * (editBooking?.base_price_per_night || 0)
    + (editBooking?.cleaning_fee || 0)
    + (editBooking?.tourist_tax_total || 0)
    - (editBooking?.discount_amount || 0);

  const saveBooking = async () => {
    if (!editBooking) return;
    setSaving(true);
    const { error } = await supabase.from("bookings").update({
      guest_name: editBooking.guest_name,
      guest_email: editBooking.guest_email,
      guest_phone: editBooking.guest_phone || null,
      guests_count: editBooking.guests_count,
      property_id: editBooking.property_id,
      check_in: editBooking.check_in,
      check_out: editBooking.check_out,
      nights: editNights,
      base_price_per_night: editBooking.base_price_per_night,
      cleaning_fee: editBooking.cleaning_fee,
      tourist_tax_total: editBooking.tourist_tax_total,
      discount_amount: editBooking.discount_amount,
      discount_reason: editBooking.discount_reason || null,
      total_price: editTotal,
      status: editBooking.status,
      source: editBooking.source,
      payment_status: editBooking.payment_status,
      payment_method: editBooking.payment_method,
      airbnb_payout: editBooking.airbnb_payout,
      airbnb_service_fee: editBooking.airbnb_service_fee,
      airbnb_confirmation_code: editBooking.airbnb_confirmation_code || null,
      special_requests: editBooking.special_requests || null,
      internal_notes: editBooking.internal_notes || null,
      paid_at: editBooking.paid_at || null,
    }).eq("id", editBooking.id);
    setSaving(false);

    if (error) { toast.error(error.message); return; }
    toast.success("Booking saved");
    loadData();
  };

  const deleteBooking = async () => {
    if (!editBooking || !confirm("Delete this booking permanently?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", editBooking.id);
    if (error) { toast.error(error.message); return; }
    // Clean up availability
    await supabase.from("availability").delete().eq("booking_id", editBooking.id);
    toast.success("Booking deleted");
    setEditBooking(null);
    loadData();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Bookings</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setImportDialog(true)}><Upload size={14} className="mr-1" /> Import Airbnb CSV</Button>
          <Button size="sm" onClick={openNewBooking}><Plus size={14} className="mr-1" /> New Booking</Button>
        </div>
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
          {["direct", "airbnb", "airbnb_csv", "manual"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input type="date" className="w-36 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
        <Input type="date" className="w-36 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
        <select className="px-3 py-2 border border-border bg-background text-sm" value={currency} onChange={e => setCurrency(e.target.value)}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
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
            <TableRow key={b.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setEditBooking({ ...b })}>
              <TableCell className="text-sm">{b.guest_name}</TableCell>
              <TableCell className="text-sm">{propName(b.property_id)}</TableCell>
              <TableCell className="text-sm">{b.check_in}</TableCell>
              <TableCell className="text-sm">{b.check_out}</TableCell>
              <TableCell className="text-sm">{b.nights}</TableCell>
              <TableCell className="text-sm">{fmt(conv(b.total_price))}</TableCell>
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
            <Field label="Property">
              <select className="w-full px-3 py-2 border border-border bg-background text-sm" value={nb.property_id} onChange={(e) => handlePropChange(e.target.value)}>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Guest name"><Input value={nb.guest_name} onChange={(e) => setNb({ ...nb, guest_name: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={nb.guest_email} onChange={(e) => setNb({ ...nb, guest_email: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><Input value={nb.guest_phone} onChange={(e) => setNb({ ...nb, guest_phone: e.target.value })} /></Field>
              <Field label="Guests"><Input type="number" min={1} value={nb.guests_count} onChange={(e) => setNb({ ...nb, guests_count: parseInt(e.target.value) || 1 })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check-in"><Input type="date" value={nb.check_in} onChange={(e) => setNb({ ...nb, check_in: e.target.value })} /></Field>
              <Field label="Check-out"><Input type="date" value={nb.check_out} onChange={(e) => setNb({ ...nb, check_out: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nightly rate (€)"><Input type="number" value={nb.base_price_per_night} onChange={(e) => setNb({ ...nb, base_price_per_night: parseFloat(e.target.value) || 0 })} /></Field>
              <Field label="Cleaning fee (€)"><Input type="number" value={nb.cleaning_fee} onChange={(e) => setNb({ ...nb, cleaning_fee: parseFloat(e.target.value) || 0 })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tourist tax total (€)"><Input type="number" value={nb.tourist_tax_total} onChange={(e) => setNb({ ...nb, tourist_tax_total: parseFloat(e.target.value) || 0 })} /></Field>
              <Field label="Discount (€)"><Input type="number" value={nb.discount_amount} onChange={(e) => setNb({ ...nb, discount_amount: parseFloat(e.target.value) || 0 })} /></Field>
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
            <Field label="Special requests"><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={2} value={nb.special_requests} onChange={(e) => setNb({ ...nb, special_requests: e.target.value })} /></Field>
            <Button className="w-full" onClick={createBooking}>Create Booking</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Edit Booking Dialog */}
      <Dialog open={!!editBooking} onOpenChange={(o) => { if (!o) setEditBooking(null); }}>
        <DialogContent className="max-w-2xl">
          {editBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center justify-between">
                  <span>Edit Booking</span>
                  <span className="text-xs font-mono text-muted-foreground">{editBooking.id.slice(0, 8)}</span>
                </DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details" className="mt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Détails</TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1"><CreditCard size={14} className="mr-1" /> Paiements</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    {/* Guest Info */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Guest</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Name"><Input value={editBooking.guest_name} onChange={(e) => setField("guest_name", e.target.value)} /></Field>
                      <Field label="Email"><Input type="email" value={editBooking.guest_email} onChange={(e) => setField("guest_email", e.target.value)} /></Field>
                      <Field label="Phone"><Input value={editBooking.guest_phone || ""} onChange={(e) => setField("guest_phone", e.target.value)} /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Guests count"><Input type="number" min={1} value={editBooking.guests_count || 1} onChange={(e) => setField("guests_count", parseInt(e.target.value) || 1)} /></Field>
                      <Field label="Property">
                        <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={editBooking.property_id} onChange={(e) => setField("property_id", e.target.value)}>
                          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Source">
                        <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={editBooking.source || "direct"} onChange={(e) => setField("source", e.target.value)}>
                          {["direct", "airbnb", "airbnb_csv", "manual"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>

                    {/* Dates */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Dates</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Check-in"><Input type="date" value={editBooking.check_in} onChange={(e) => setField("check_in", e.target.value)} /></Field>
                      <Field label="Check-out"><Input type="date" value={editBooking.check_out} onChange={(e) => setField("check_out", e.target.value)} /></Field>
                      <Field label="Nights (auto)">
                        <div className="h-9 flex items-center text-sm font-medium">{editNights}</div>
                      </Field>
                    </div>

                    {/* Pricing */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Pricing</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Price / night (€)"><Input type="number" step="0.01" value={editBooking.base_price_per_night} onChange={(e) => setField("base_price_per_night", parseFloat(e.target.value) || 0)} /></Field>
                      <Field label="Cleaning fee (€)"><Input type="number" step="0.01" value={editBooking.cleaning_fee || 0} onChange={(e) => setField("cleaning_fee", parseFloat(e.target.value) || 0)} /></Field>
                      <Field label="Tourist tax (€)"><Input type="number" step="0.01" value={editBooking.tourist_tax_total || 0} onChange={(e) => setField("tourist_tax_total", parseFloat(e.target.value) || 0)} /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Discount (€)"><Input type="number" step="0.01" value={editBooking.discount_amount || 0} onChange={(e) => setField("discount_amount", parseFloat(e.target.value) || 0)} /></Field>
                      <Field label="Discount reason"><Input value={editBooking.discount_reason || ""} onChange={(e) => setField("discount_reason", e.target.value)} /></Field>
                      <Field label="Total (auto)">
                        <div className="h-9 flex items-center text-sm font-display font-semibold">€{editTotal.toFixed(2)}</div>
                      </Field>
                    </div>

                    {/* Airbnb fields */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Airbnb</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Confirmation code"><Input value={editBooking.airbnb_confirmation_code || ""} onChange={(e) => setField("airbnb_confirmation_code", e.target.value)} /></Field>
                      <Field label="Payout (€)"><Input type="number" step="0.01" value={editBooking.airbnb_payout || ""} onChange={(e) => setField("airbnb_payout", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
                      <Field label="Service fee (€)"><Input type="number" step="0.01" value={editBooking.airbnb_service_fee || ""} onChange={(e) => setField("airbnb_service_fee", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
                    </div>

                    {/* Notes */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Notes</p>
                    <Field label="Special requests"><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={2} value={editBooking.special_requests || ""} onChange={(e) => setField("special_requests", e.target.value)} /></Field>
                    <Field label="Internal notes"><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={3} value={editBooking.internal_notes || ""} onChange={(e) => setField("internal_notes", e.target.value)} /></Field>

                    {editBooking.created_at && (
                      <p className="text-xs text-muted-foreground">Created: {new Date(editBooking.created_at).toLocaleString()}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="payments">
                  <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    {/* Payment Summary */}
                    <div className="border border-border rounded-md p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total réservation</span>
                        <span className="font-display font-semibold">€{editTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Statut paiement</span>
                        <span className={`text-xs px-2 py-0.5 uppercase tracking-wider ${
                          editBooking.payment_status === "paid" ? "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]" :
                          editBooking.payment_status === "partial" ? "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]" :
                          editBooking.payment_status === "refunded" ? "bg-[hsl(200,50%,92%)] text-[hsl(200,50%,30%)]" :
                          editBooking.payment_status === "failed" ? "bg-[hsl(0,50%,92%)] text-[hsl(0,50%,35%)]" :
                          "bg-muted text-muted-foreground"
                        }`}>{editBooking.payment_status || "pending"}</span>
                      </div>
                      {editBooking.paid_at && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Payé le</span>
                          <span className="text-sm">{new Date(editBooking.paid_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      )}
                    </div>

                    {/* Payment method & status controls */}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Méthode de paiement">
                        <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={editBooking.payment_method || "card"} onChange={(e) => setField("payment_method", e.target.value)}>
                          {["card", "bank_transfer", "crypto", "cash", "airbnb"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="Statut paiement">
                        <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={editBooking.payment_status || "pending"} onChange={(e) => {
                          setField("payment_status", e.target.value);
                          if (e.target.value !== "paid") setField("paid_at", null);
                        }}>
                          {["pending", "paid", "partial", "refunded", "failed"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>

                    {/* Mark as paid action */}
                    {editBooking.payment_status !== "paid" ? (
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => {
                          setField("payment_status", "paid");
                          setField("paid_at", new Date().toISOString());
                          setField("status", "confirmed");
                        }}
                      >
                        <CheckCircle size={14} className="mr-2" /> Marquer comme payé (maintenant)
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Field label="Date de paiement">
                          <Input
                            type="datetime-local"
                            value={editBooking.paid_at ? editBooking.paid_at.slice(0, 16) : ""}
                            onChange={(e) => setField("paid_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                          />
                        </Field>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setField("payment_status", "pending");
                            setField("paid_at", null);
                          }}
                        >
                          Annuler le paiement
                        </Button>
                      </div>
                    )}

                    {/* Stripe info */}
                    {(editBooking.stripe_payment_intent || editBooking.stripe_session_id) && (
                      <div className="border border-border rounded-md p-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stripe</p>
                        {editBooking.stripe_payment_intent && <div className="text-xs text-muted-foreground">Payment Intent: <span className="font-mono">{editBooking.stripe_payment_intent}</span></div>}
                        {editBooking.stripe_session_id && <div className="text-xs text-muted-foreground">Session: <span className="font-mono">{editBooking.stripe_session_id}</span></div>}
                      </div>
                    )}

                    {/* Airbnb payout info */}
                    {editBooking.source === "airbnb" && (
                      <div className="border border-border rounded-md p-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Airbnb Payout</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Payout reçu (€)"><Input type="number" step="0.01" value={editBooking.airbnb_payout || ""} onChange={(e) => setField("airbnb_payout", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
                          <Field label="Frais Airbnb (€)"><Input type="number" step="0.01" value={editBooking.airbnb_service_fee || ""} onChange={(e) => setField("airbnb_service_fee", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Actions — always visible */}
                <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                  <Button variant="destructive" size="sm" onClick={deleteBooking}><Trash2 size={14} className="mr-1" /> Delete</Button>
                  <Button size="sm" onClick={saveBooking} disabled={saving}><Save size={14} className="mr-1" /> {saving ? "Saving…" : "Save Changes"}</Button>
                </div>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AirbnbCsvImportDialog
        open={importDialog}
        onOpenChange={setImportDialog}
        properties={properties}
        onImported={loadData}
      />
    </AdminLayout>
  );
};

export default AdminBookingsPage;
