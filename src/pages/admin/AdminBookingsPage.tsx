import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Save, Trash2, CreditCard, CheckCircle, Upload, Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFxRates } from "@/hooks/useFxRates";
import { useAuth } from "@/hooks/useAuth";
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
  num_adults: number | null;
  num_children: number | null;
  num_infants: number | null;
  booked_date: string | null;
  airbnb_status: string | null;
  guest_address: string | null;
  guest_city: string | null;
  guest_country: string | null;
}

interface PropertyOption { id: string; name: string; cleaning_fee: number | null; tourist_tax_per_person: number | null; price_per_night: number | null; currency: string; }

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
  const [contractData, setContractData] = useState<{ contract_html: string; signature_url: string | null; accepted_at: string | null } | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const { convertFromEur, convertToEur, formatPrice } = useFxRates();
  const { isAdmin } = useAuth();
  // New booking form
  const [nb, setNb] = useState({ property_id: "", guest_name: "", guest_email: "", guest_phone: "", guests_count: 1, check_in: "", check_out: "", base_price_per_night: 0, cleaning_fee: 0, tourist_tax_total: 0, discount_amount: 0, special_requests: "" });

  const loadData = async () => {
    const [bRes, pRes] = await Promise.all([
      supabase.from("bookings").select("*").order("check_in", { ascending: false }),
      supabase.from("properties").select("id, name, cleaning_fee, tourist_tax_per_person, price_per_night, currency").order("display_order"),
    ]);
    setBookings(bRes.data || []);
    setProperties(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Load contract when editing a booking
  useEffect(() => {
    if (!editBooking) { setContractData(null); return; }
    supabase
      .from("booking_contracts")
      .select("contract_html, signature_url, accepted_at")
      .eq("booking_id", editBooking.id)
      .maybeSingle()
      .then(({ data }) => setContractData(data as any));
  }, [editBooking?.id]);

  const downloadContractPdf = async () => {
    if (!contractData || !editBooking) return;
    setGeneratingPdf(true);
    try {
      const refCode = `BOOK-${editBooking.id.slice(0, 8).toUpperCase()}`;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Contrat de Location Saisonnière", margin, y);
      y += 10;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Réf: ${refCode}`, margin, y);
      y += 4;
      if (contractData.accepted_at) {
        pdf.text(`Signé le: ${new Date(contractData.accepted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin, y);
      }
      y += 10;

      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(10);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = contractData.contract_html;
      const textContent = tempDiv.innerText || tempDiv.textContent || "";
      const lines = pdf.splitTextToSize(textContent, contentWidth);
      const lineHeight = 4.5;
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) { pdf.addPage(); y = margin; }
        pdf.text(line, margin, y);
        y += lineHeight;
      }

      y += 10;
      if (y + 60 > pageHeight - margin) { pdf.addPage(); y = margin; }
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Signature du locataire", margin, y);
      y += 6;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(editBooking.guest_name, margin, y);
      y += 8;

      if (contractData.signature_url) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = contractData.signature_url!; });
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const sigWidth = Math.min(80, contentWidth);
            const sigHeight = (img.height / img.width) * sigWidth;
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, y, sigWidth, sigHeight);
          }
        } catch {}
      }

      pdf.save(`contrat-${refCode}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setGeneratingPdf(false);
    }
  };

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
      num_adults: editBooking.num_adults || 0,
      num_children: editBooking.num_children || 0,
      num_infants: editBooking.num_infants || 0,
      guest_address: editBooking.guest_address || null,
      guest_city: editBooking.guest_city || null,
      guest_country: editBooking.guest_country || null,
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
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setImportDialog(true)}><Upload size={14} className="mr-1" /> Import Airbnb CSV</Button>
            <Button size="sm" onClick={openNewBooking}><Plus size={14} className="mr-1" /> New Booking</Button>
          </div>
        )}
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
            {isAdmin && <TableHead>Total</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
          ) : filtered.map((b) => (
            <TableRow key={b.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setEditBooking({ ...b })}>
              <TableCell className="text-sm">{b.guest_name}</TableCell>
              <TableCell className="text-sm">{propName(b.property_id)}</TableCell>
              <TableCell className="text-sm">{b.check_in}</TableCell>
              <TableCell className="text-sm">{b.check_out}</TableCell>
              <TableCell className="text-sm">{b.nights}</TableCell>
              {isAdmin && (
                <TableCell className="text-sm">
                  <span>{fmt(conv(b.total_price))}</span>
                  {(() => {
                    const propCurrency = properties.find(p => p.id === b.property_id)?.currency || "EUR";
                    return propCurrency !== "EUR" && currency === "EUR" ? (
                      <span className="text-xs text-muted-foreground ml-1">≈ {formatPrice(Math.round(convertFromEur(b.total_price, propCurrency)), propCurrency)}</span>
                    ) : null;
                  })()}
                </TableCell>
              )}
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
                  <span>Booking Detail</span>
                  <div className="flex items-center gap-2">
                    {editBooking.source?.startsWith("airbnb") && (
                      <span className="text-[0.6rem] px-2 py-0.5 bg-[hsl(210,80%,55%)] text-[hsl(0,0%,100%)] uppercase tracking-wider">Airbnb</span>
                    )}
                    <span className="text-xs font-mono text-muted-foreground">{editBooking.id.slice(0, 8)}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Card 1: General Info — visible to all (admin + concierge) */}
                <div className="border border-border rounded-md p-4 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informations générales</p>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Voyageur"><Input value={editBooking.guest_name} onChange={(e) => setField("guest_name", e.target.value)} readOnly={!isAdmin} /></Field>
                    <Field label="Email"><Input type="email" value={editBooking.guest_email} onChange={(e) => setField("guest_email", e.target.value)} readOnly={!isAdmin} /></Field>
                    <Field label="Téléphone"><Input value={editBooking.guest_phone || ""} onChange={(e) => setField("guest_phone", e.target.value)} readOnly={!isAdmin} /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Guests"><Input type="number" min={1} value={editBooking.guests_count || 1} onChange={(e) => setField("guests_count", parseInt(e.target.value) || 1)} readOnly={!isAdmin} /></Field>
                    <Field label="Adults"><Input type="number" min={0} value={editBooking.num_adults || 0} onChange={(e) => setField("num_adults", parseInt(e.target.value) || 0)} readOnly={!isAdmin} /></Field>
                    <Field label="Enfants"><Input type="number" min={0} value={editBooking.num_children || 0} onChange={(e) => setField("num_children", parseInt(e.target.value) || 0)} readOnly={!isAdmin} /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Bébés"><Input type="number" min={0} value={editBooking.num_infants || 0} onChange={(e) => setField("num_infants", parseInt(e.target.value) || 0)} readOnly={!isAdmin} /></Field>
                    <Field label="Adresse"><Input value={editBooking.guest_address || ""} onChange={(e) => setField("guest_address", e.target.value)} placeholder="Non renseignée" /></Field>
                    <Field label="Ville"><Input value={editBooking.guest_city || ""} onChange={(e) => setField("guest_city", e.target.value)} placeholder="Non renseignée" /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Pays"><Input value={editBooking.guest_country || ""} onChange={(e) => setField("guest_country", e.target.value)} placeholder="Non renseigné" /></Field>
                    <Field label="Propriété">
                      <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={editBooking.property_id} onChange={(e) => setField("property_id", e.target.value)} disabled={!isAdmin}>
                        {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Statut">
                      <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={editBooking.status || "pending"} onChange={(e) => setField("status", e.target.value)} disabled={!isAdmin}>
                        {["pending", "confirmed", "cancelled", "completed", "no_show"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Check-in"><Input type="date" value={editBooking.check_in} onChange={(e) => setField("check_in", e.target.value)} readOnly={!isAdmin} /></Field>
                    <Field label="Check-out"><Input type="date" value={editBooking.check_out} onChange={(e) => setField("check_out", e.target.value)} readOnly={!isAdmin} /></Field>
                    <Field label="Nuits">
                      <div className="h-9 flex items-center text-sm font-medium">{editNights}</div>
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Source">
                      <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={editBooking.source || "direct"} onChange={(e) => setField("source", e.target.value)} disabled={!isAdmin}>
                        {["direct", "airbnb", "airbnb_csv", "manual"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    {editBooking.airbnb_confirmation_code && (
                      <Field label="Code Airbnb">
                        <div className="h-9 flex items-center text-sm font-mono">{editBooking.airbnb_confirmation_code}</div>
                      </Field>
                    )}
                    {editBooking.booked_date && (
                      <Field label="Réservé le">
                        <div className="h-9 flex items-center text-sm">{editBooking.booked_date}</div>
                      </Field>
                    )}
                  </div>
                  {editBooking.airbnb_status && (
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Statut Airbnb">
                        <div className="h-9 flex items-center text-sm">{editBooking.airbnb_status}</div>
                      </Field>
                    </div>
                  )}
                  {editBooking.guest_phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <a href={`tel:${editBooking.guest_phone}`} className="text-primary hover:underline">📞 {editBooking.guest_phone}</a>
                      <a href={`https://wa.me/${editBooking.guest_phone.replace(/[^0-9+]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-[hsl(120,50%,40%)] hover:underline">💬 WhatsApp</a>
                    </div>
                  )}

                  <Field label="Demandes spéciales"><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={2} value={editBooking.special_requests || ""} onChange={(e) => setField("special_requests", e.target.value)} readOnly={!isAdmin} /></Field>
                  <Field label="Notes internes"><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={2} value={editBooking.internal_notes || ""} onChange={(e) => setField("internal_notes", e.target.value)} readOnly={!isAdmin} /></Field>

                  {editBooking.created_at && (
                    <p className="text-xs text-muted-foreground">Créé le : {new Date(editBooking.created_at).toLocaleString()}</p>
                  )}
                </div>

                {/* Card 2: Financial Info — admin only */}
                {isAdmin && (
                  <div className="border border-border rounded-md p-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informations financières</p>

                    {/* Show property currency if not EUR */}
                    {(() => {
                      const propCurrency = properties.find(p => p.id === editBooking.property_id)?.currency || "EUR";
                      const showConversion = propCurrency !== "EUR" && currency === "EUR";
                      return showConversion ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(36,20%,95%)] text-xs text-muted-foreground rounded">
                          <span>Devise propriété : <strong>{propCurrency}</strong></span>
                          <span>·</span>
                          <span>Total ≈ {formatPrice(Math.round(convertFromEur(editTotal, propCurrency)), propCurrency)}</span>
                        </div>
                      ) : null;
                    })()}

                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Prix / nuit (€)"><Input type="number" step="0.01" value={editBooking.base_price_per_night} onChange={(e) => setField("base_price_per_night", parseFloat(e.target.value) || 0)} /></Field>
                      <Field label="Ménage (€)"><Input type="number" step="0.01" value={editBooking.cleaning_fee || 0} onChange={(e) => setField("cleaning_fee", parseFloat(e.target.value) || 0)} /></Field>
                      <Field label="Taxe séjour (€)"><Input type="number" step="0.01" value={editBooking.tourist_tax_total || 0} onChange={(e) => setField("tourist_tax_total", parseFloat(e.target.value) || 0)} /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Remise (€)"><Input type="number" step="0.01" value={editBooking.discount_amount || 0} onChange={(e) => setField("discount_amount", parseFloat(e.target.value) || 0)} /></Field>
                      <Field label="Raison remise"><Input value={editBooking.discount_reason || ""} onChange={(e) => setField("discount_reason", e.target.value)} /></Field>
                      <Field label="Total (auto)">
                        <div className="h-9 flex items-center text-sm font-display font-semibold">€{editTotal.toFixed(2)}</div>
                      </Field>
                    </div>

                    {/* Payment section */}
                    <div className="border-t border-border pt-3 space-y-3">
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

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Méthode">
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

                      {editBooking.payment_status !== "paid" ? (
                        <Button className="w-full" variant="default" onClick={() => {
                          setField("payment_status", "paid");
                          setField("paid_at", new Date().toISOString());
                          setField("status", "confirmed");
                        }}>
                          <CheckCircle size={14} className="mr-2" /> Marquer comme payé
                        </Button>
                      ) : editBooking.paid_at && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Payé le</span>
                          <span>{new Date(editBooking.paid_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                      )}
                    </div>

                    {/* Airbnb payout */}
                    {editBooking.source?.startsWith("airbnb") && (
                      <div className="border-t border-border pt-3 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Airbnb Payout</p>
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Confirmation code"><Input value={editBooking.airbnb_confirmation_code || ""} onChange={(e) => setField("airbnb_confirmation_code", e.target.value)} /></Field>
                          <Field label="Payout (€)"><Input type="number" step="0.01" value={editBooking.airbnb_payout || ""} onChange={(e) => setField("airbnb_payout", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
                          <Field label="Frais service (€)"><Input type="number" step="0.01" value={editBooking.airbnb_service_fee || ""} onChange={(e) => setField("airbnb_service_fee", e.target.value ? parseFloat(e.target.value) : null)} /></Field>
                        </div>
                      </div>
                    )}

                    {/* Stripe info */}
                    {(editBooking.stripe_payment_intent || editBooking.stripe_session_id) && (
                      <div className="border-t border-border pt-3 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stripe</p>
                        {editBooking.stripe_payment_intent && <div className="text-xs text-muted-foreground">Payment Intent: <span className="font-mono">{editBooking.stripe_payment_intent}</span></div>}
                        {editBooking.stripe_session_id && <div className="text-xs text-muted-foreground">Session: <span className="font-mono">{editBooking.stripe_session_id}</span></div>}
                      </div>
                    )}
                  </div>
                )}

                {/* Contract section */}
                {isAdmin && contractData && (
                  <div className="border border-border rounded-md p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <FileText size={14} /> Contrat signé
                    </p>
                    <div className="text-sm space-y-1">
                      {contractData.accepted_at && (
                        <p className="text-muted-foreground">
                          Signé le {new Date(contractData.accepted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {contractData.signature_url && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Signature :</p>
                          <img src={contractData.signature_url} alt="Signature" className="h-16 border border-border bg-background p-1" />
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadContractPdf} disabled={generatingPdf}>
                      {generatingPdf ? (
                        <><Loader2 size={14} className="animate-spin mr-1" /> Génération…</>
                      ) : (
                        <><Download size={14} className="mr-1" /> Télécharger le contrat PDF</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  {isAdmin && <Button variant="destructive" size="sm" onClick={deleteBooking}><Trash2 size={14} className="mr-1" /> Supprimer</Button>}
                  {isAdmin && <Button size="sm" onClick={saveBooking} disabled={saving}><Save size={14} className="mr-1" /> {saving ? "Saving…" : "Enregistrer"}</Button>}
                </div>
              </div>
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
