import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, Loader2, Download, Pencil, Check, X as XIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ParsedReservation {
  confirmation_code: string;
  status: string;
  guest_name: string;
  guest_email: string;
  guest_city: string;
  guest_country: string;
  guests_count: number;
  check_in: string;
  check_out: string;
  nights: number;
  listing_name: string;
  earnings: number;
  currency: string;
  property_id: string | null;
  property_slug: string | null;
  action: "create" | "skip";
  skip_reason?: string;
  guest_phone?: string;
  num_adults?: number;
  num_children?: number;
  num_infants?: number;
  booked_date?: string;
  airbnb_status?: string;
}

const COLUMN_MAPS: Record<string, string[]> = {
  confirmation_code: ["confirmation code", "code de confirmation", "confirmation"],
  status: ["status", "statut"],
  guest_name: ["guest", "guest name", "voyageur", "nom du voyageur"],
  guests_count: ["# guests", "guests", "# of guests", "voyageurs", "nombre de voyageurs"],
  check_in: ["check-in", "checkin", "check in", "arrivée", "date d'arrivée", "start date", "date de début"],
  check_out: ["check-out", "checkout", "check out", "départ", "date de départ", "end date", "date de fin"],
  nights: ["nights", "nuits", "durée", "# of nights"],
  listing_name: ["listing", "listing name", "annonce", "nom de l'annonce"],
  earnings: ["earnings", "host earnings", "amount", "revenus", "gains"],
  currency: ["currency", "devise"],
  guest_phone: ["contact", "phone", "téléphone"],
  num_adults: ["# of adults", "adults", "adultes"],
  num_children: ["# of children", "children", "enfants"],
  num_infants: ["# of infants", "infants", "bébés"],
  booked_date: ["booked", "date de réservation", "booking date"],
  guest_email: ["email", "e-mail", "guest email", "email du voyageur"],
  guest_city: ["city", "ville", "guest city"],
  guest_country: ["country", "pays", "guest country"],
};

function findColumn(headers: string[], aliases: string[]): number {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseDate(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const slashParts = trimmed.split("/");
  if (slashParts.length === 3) {
    const [a, b, c] = slashParts.map(Number);
    if (a > 12) return `${c}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
    return `${c}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
  }
  return trimmed;
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { current.push(field); field = ""; }
      else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        current.push(field); field = "";
        if (current.some((f) => f.trim())) lines.push(current);
        current = [];
        if (ch === "\r") i++;
      } else { field += ch; }
    }
  }
  if (field || current.length > 0) {
    current.push(field);
    if (current.some((f) => f.trim())) lines.push(current);
  }
  return lines;
}

const AdminImportTab = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedReservation[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [stats, setStats] = useState({ created: 0, skipped: 0 });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const downloadTemplate = () => {
    const headers = "Confirmation code,Status,Guest name,Email,City,Country,Contact,# of adults,# of children,# of infants,Start date,End date,# of nights,Booked,Listing,Earnings";
    const example = "HM1234ABC,Confirmed,Jean Dupont,jean@example.com,Paris,France,+33 6 12 34 56 78,4,0,0,03/15/2026,03/22/2026,7,02/01/2026,Maison Georgia,$1250.00";
    const blob = new Blob([headers + "\n" + example + "\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "airbnb-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) { toast.error("Please upload a CSV file"); return; }

    const { data: props } = await supabase.from("properties").select("id, slug, name, airbnb_link");
    setProperties(props || []);

    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("airbnb_confirmation_code")
      .not("airbnb_confirmation_code", "is", null);
    const existingCodes = new Set((existingBookings || []).map((b: any) => b.airbnb_confirmation_code));

    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) { toast.error("Empty or invalid CSV"); return; }

    const headers = rows[0];
    const colIdx: Record<string, number> = {};
    for (const key of Object.keys(COLUMN_MAPS)) {
      colIdx[key] = findColumn(headers, COLUMN_MAPS[key]);
    }

    if (colIdx.confirmation_code === -1 || colIdx.check_in === -1 || colIdx.check_out === -1) {
      toast.error("Missing required columns: Confirmation Code, Check-In, Check-Out");
      return;
    }

    const reservations: ParsedReservation[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const code = row[colIdx.confirmation_code]?.trim() || "";
      if (!code) continue;

      const listingName = colIdx.listing_name !== -1 ? row[colIdx.listing_name]?.trim() || "" : "";
      const matchedProp = (props || []).find(
        (p: any) =>
          listingName.toLowerCase().includes(p.name.toLowerCase()) ||
          listingName.toLowerCase().includes(p.slug.toLowerCase())
      );

      const checkIn = parseDate(row[colIdx.check_in] || "");
      const checkOut = parseDate(row[colIdx.check_out] || "");

      let action: "create" | "skip" = "create";
      let skipReason: string | undefined;

      if (existingCodes.has(code)) { action = "skip"; skipReason = "Already imported"; }
      else if (!matchedProp) { action = "skip"; skipReason = `Property not found for "${listingName}"`; }
      else if (!checkIn || !checkOut) { action = "skip"; skipReason = "Invalid dates"; }

      const rawEarnings = colIdx.earnings !== -1 ? row[colIdx.earnings]?.trim() || "" : "";
      const earningsCurrency = rawEarnings.includes("€") ? "EUR" : rawEarnings.includes("$") ? "USD" : rawEarnings.includes("AED") ? "AED" : (colIdx.currency !== -1 ? row[colIdx.currency]?.trim() || "EUR" : "EUR");
      const earningsStr = rawEarnings.replace(/[^0-9.,]/g, "").replace(",", ".");

      const airbnbStatus = colIdx.status !== -1 ? row[colIdx.status]?.trim() || "" : "";

      reservations.push({
        confirmation_code: code,
        status: airbnbStatus || "confirmed",
        guest_name: colIdx.guest_name !== -1 ? row[colIdx.guest_name]?.trim() || "Airbnb Guest" : "Airbnb Guest",
        guest_email: colIdx.guest_email !== -1 ? row[colIdx.guest_email]?.trim() || "" : "",
        guest_city: colIdx.guest_city !== -1 ? row[colIdx.guest_city]?.trim() || "" : "",
        guest_country: colIdx.guest_country !== -1 ? row[colIdx.guest_country]?.trim() || "" : "",
        guests_count: colIdx.guests_count !== -1 ? parseInt(row[colIdx.guests_count]) || 1 : (colIdx.num_adults !== -1 ? parseInt(row[colIdx.num_adults]) || 1 : 1),
        check_in: checkIn,
        check_out: checkOut,
        nights: colIdx.nights !== -1 ? parseInt(row[colIdx.nights]) || 0 : 0,
        listing_name: listingName,
        earnings: parseFloat(earningsStr) || 0,
        currency: earningsCurrency,
        property_id: matchedProp?.id || null,
        property_slug: matchedProp?.slug || null,
        action,
        skip_reason: skipReason,
        guest_phone: colIdx.guest_phone !== -1 ? row[colIdx.guest_phone]?.trim() || undefined : undefined,
        num_adults: colIdx.num_adults !== -1 ? parseInt(row[colIdx.num_adults]) || 0 : undefined,
        num_children: colIdx.num_children !== -1 ? parseInt(row[colIdx.num_children]) || 0 : undefined,
        num_infants: colIdx.num_infants !== -1 ? parseInt(row[colIdx.num_infants]) || 0 : undefined,
        booked_date: colIdx.booked_date !== -1 ? parseDate(row[colIdx.booked_date] || "") || undefined : undefined,
        airbnb_status: airbnbStatus || undefined,
      });
    }

    setParsed(reservations);
    setPreviewOpen(true);
    toast.success(`${reservations.length} reservations found`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };

  const handleImport = async () => {
    setImporting(true);
    let created = 0;
    let skipped = 0;
    const toImport = parsed.filter((r) => r.action === "create");

    for (const res of toImport) {
      if (!res.property_id) { skipped++; continue; }

      const mappedStatus = res.airbnb_status
        ? (res.airbnb_status.toLowerCase().includes("cancel") ? "cancelled"
          : res.airbnb_status.toLowerCase().includes("past guest") ? "completed"
          : "confirmed")
        : (res.status.toLowerCase().includes("cancel") ? "cancelled" : "confirmed");

      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert({
          property_id: res.property_id,
          guest_name: res.guest_name,
          guest_email: res.guest_email || "airbnb@imported.com",
          guest_city: res.guest_city || null,
          guest_country: res.guest_country || null,
          guests_count: res.guests_count,
          check_in: res.check_in,
          check_out: res.check_out,
          base_price_per_night: res.nights > 0 ? Math.round(res.earnings / res.nights) : 0,
          total_price: res.earnings,
          status: mappedStatus,
          source: "airbnb_csv",
          airbnb_confirmation_code: res.confirmation_code,
          airbnb_payout: res.earnings,
          internal_notes: `Imported from Airbnb CSV — ${res.listing_name}`,
          paid_at: res.booked_date ? new Date(res.booked_date).toISOString() : new Date().toISOString(),
          guest_phone: res.guest_phone || null,
          num_adults: res.num_adults ?? 0,
          num_children: res.num_children ?? 0,
          num_infants: res.num_infants ?? 0,
          booked_date: res.booked_date || null,
          airbnb_status: res.airbnb_status || null,
          payment_status: "paid",
          payment_method: "airbnb",
        } as any)
        .select()
        .single();

      if (bErr) { console.error("Import error:", bErr); skipped++; continue; }

      const bookingId = (booking as any).id;

      // Create ledger entries for this booking
      const ledgerEntries: any[] = [];
      
      // Income: platform payout
      if (res.earnings > 0) {
        ledgerEntries.push({
          property_id: res.property_id,
          booking_id: bookingId,
          entry_type: "income",
          category: "platform_payout",
          amount: res.earnings,
          currency: "EUR",
          amount_eur: res.earnings,
          description: `Airbnb payout — ${res.guest_name} (${res.confirmation_code})`,
          reference: res.confirmation_code,
          counterparty: "Airbnb",
          entry_date: res.check_out || res.check_in,
          source: "airbnb_csv",
        });
      }

      // Expense: platform commission (total_price - payout)
      const totalPrice = res.earnings; // earnings = payout in Airbnb CSV
      const basePricePerNight = res.nights > 0 ? Math.round(res.earnings / res.nights) : 0;
      const estimatedGrossPrice = basePricePerNight * (res.nights || 1) * 1.15; // rough estimate
      const commission = Math.max(0, estimatedGrossPrice - res.earnings);
      if (commission > 0) {
        ledgerEntries.push({
          property_id: res.property_id,
          booking_id: bookingId,
          entry_type: "expense",
          category: "platform_commission",
          amount: Math.round(commission * 100) / 100,
          currency: "EUR",
          amount_eur: Math.round(commission * 100) / 100,
          description: `Airbnb commission — ${res.confirmation_code}`,
          reference: res.confirmation_code,
          counterparty: "Airbnb",
          entry_date: res.check_out || res.check_in,
          source: "airbnb_csv",
        });
      }

      // Insert ledger entries (non-blocking)
      if (ledgerEntries.length > 0) {
        await supabase.from("ledger_entries" as any).insert(ledgerEntries);
      }

      const checkIn = new Date(res.check_in + "T00:00:00Z");
      const checkOut = new Date(res.check_out + "T00:00:00Z");
      const current = new Date(checkIn);
      while (current < checkOut) {
        const dateStr = current.toISOString().split("T")[0];
        await supabase.from("availability").upsert(
          { property_id: res.property_id, date: dateStr, available: false, source: "airbnb", booking_id: bookingId },
          { onConflict: "property_id,date" }
        );
        current.setUTCDate(current.getUTCDate() + 1);
      }
      created++;
    }

    skipped += parsed.filter((r) => r.action === "skip").length;
    setStats({ created, skipped });
    setImported(true);
    setImporting(false);
    setPreviewOpen(false);
    toast.success(`Import complete: ${created} created, ${skipped} skipped`);
  };

  const toImportCount = parsed.filter((r) => r.action === "create").length;
  const toSkipCount = parsed.filter((r) => r.action === "skip").length;

  const updateRow = useCallback((index: number, updates: Partial<ParsedReservation>) => {
    setParsed((prev) => prev.map((r, i) => {
      if (i !== index) return r;
      const updated = { ...r, ...updates };
      // Re-evaluate action if property was assigned
      if (updates.property_id && updated.action === "skip" && updated.skip_reason?.includes("Property not found")) {
        const prop = properties.find((p: any) => p.id === updates.property_id);
        updated.action = "create";
        updated.property_slug = prop?.slug || null;
        updated.skip_reason = undefined;
      }
      return updated;
    }));
  }, [properties]);

  const toggleAction = useCallback((index: number) => {
    setParsed((prev) => prev.map((r, i) => {
      if (i !== index) return r;
      if (r.action === "create") return { ...r, action: "skip" as const, skip_reason: "Manually skipped" };
      // Can only re-enable if has property
      if (!r.property_id) { toast.error("Assign a property first"); return r; }
      return { ...r, action: "create" as const, skip_reason: undefined };
    }));
  }, []);

  if (imported) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle className="mx-auto text-[hsl(120,40%,50%)]" size={48} />
          <h2 className="font-display text-xl">Import Complete</h2>
          <p className="text-muted-foreground">
            {stats.created} reservations imported · {stats.skipped} skipped
          </p>
          <p className="text-xs text-muted-foreground">Dates have been blocked in the calendar.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" asChild>
              <Link to="/admin/bookings">View Bookings</Link>
            </Button>
            <Button onClick={() => { setImported(false); setParsed([]); setStats({ created: 0, skipped: 0 }); }}>
              Import Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`transition-colors ${dragging ? "border-primary border-2 bg-primary/5" : ""}`}
      >
        <CardContent className="py-12">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <Upload className={`mx-auto transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} size={48} />
            <h2 className="font-display text-lg">Upload Airbnb CSV</h2>
            <p className="text-sm text-muted-foreground">
              {dragging ? "Drop your CSV file here" : "Upload your Airbnb reservation CSV export. Drag & drop or click below. Duplicates are automatically skipped."}
            </p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
            <div className="flex gap-3 justify-center">
              <Button onClick={() => fileRef.current?.click()}>
                <FileText size={16} className="mr-2" /> Choose CSV file
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download size={16} className="mr-2" /> Download template
              </Button>
            </div>
            <div className="text-left mt-8 border-t border-border pt-6">
              <p className="text-xs font-medium text-foreground mb-2">How to export from Airbnb:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to airbnb.com/hosting/reservations</li>
                <li>Filter by listing if needed</li>
                <li>Click "Export" → CSV</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">
              Preview — {parsed.length} reservations
            </DialogTitle>
            <DialogDescription>
              <span className="text-[hsl(120,40%,50%)]">✓ {toImportCount} to import</span>
              {" · "}
              <span className="text-muted-foreground">⏭ {toSkipCount} to skip</span>
              {" · "}
              <span className="text-xs text-muted-foreground">Click rows to edit property or toggle action</span>
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Code</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead className="w-[150px]">Email</TableHead>
                  <TableHead className="w-[100px]">Phone</TableHead>
                  <TableHead className="w-[90px]">City</TableHead>
                  <TableHead className="w-[70px]">Country</TableHead>
                  <TableHead className="w-[90px]">Dates</TableHead>
                  <TableHead className="w-[40px]">Nts</TableHead>
                  <TableHead className="w-[40px]">👤</TableHead>
                  <TableHead className="w-[40px]">👶</TableHead>
                  <TableHead className="w-[70px]">Amt</TableHead>
                  <TableHead className="w-[70px]">Status</TableHead>
                  <TableHead className="w-[140px]">Property</TableHead>
                  <TableHead className="w-[60px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((r, i) => (
                  <TableRow key={i} className={r.action === "skip" ? "opacity-60" : ""}>
                    <TableCell className="text-xs font-mono">{r.confirmation_code}</TableCell>
                    <TableCell>
                      <Input
                        value={r.guest_name}
                        onChange={(e) => updateRow(i, { guest_name: e.target.value })}
                        className="h-7 text-sm border-transparent hover:border-input focus:border-input bg-transparent px-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={r.guest_email || ""}
                        onChange={(e) => updateRow(i, { guest_email: e.target.value })}
                        placeholder="email"
                        className="h-7 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={r.guest_phone || ""}
                        onChange={(e) => updateRow(i, { guest_phone: e.target.value })}
                        placeholder="—"
                        className="h-7 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={r.guest_city || ""}
                        onChange={(e) => updateRow(i, { guest_city: e.target.value })}
                        placeholder="—"
                        className="h-7 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={r.guest_country || ""}
                        onChange={(e) => updateRow(i, { guest_country: e.target.value })}
                        placeholder="—"
                        className="h-7 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-1"
                      />
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{r.check_in}<br/>{r.check_out}</TableCell>
                    <TableCell className="text-sm text-center">{r.nights}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={r.num_adults ?? 0}
                        onChange={(e) => updateRow(i, { num_adults: parseInt(e.target.value) || 0 })}
                        className="h-7 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-1 w-12"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={(r.num_children ?? 0) + (r.num_infants ?? 0)}
                        onChange={(e) => updateRow(i, { num_children: parseInt(e.target.value) || 0, num_infants: 0 })}
                        className="h-7 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-1 w-12"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={r.earnings}
                        onChange={(e) => updateRow(i, { earnings: parseFloat(e.target.value) || 0 })}
                        className="h-7 text-xs border-transparent hover:border-input focus:border-input bg-transparent px-1 w-16"
                      />
                    </TableCell>
                    <TableCell className="text-xs">{r.airbnb_status || r.status}</TableCell>
                    <TableCell>
                      <Select
                        value={r.property_id || "__none"}
                        onValueChange={(val) => {
                          if (val === "__none") {
                            updateRow(i, { property_id: null, property_slug: null });
                          } else {
                            const prop = properties.find((p: any) => p.id === val);
                            updateRow(i, { property_id: val, property_slug: prop?.slug || null });
                          }
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs border-transparent hover:border-input bg-transparent">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">— None —</SelectItem>
                          {properties.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleAction(i)}
                        className={`text-xs px-2 py-1 rounded-sm transition-colors ${
                          r.action === "create"
                            ? "bg-[hsl(120,40%,95%)] text-[hsl(120,40%,35%)] hover:bg-[hsl(120,40%,90%)]"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                        title={r.skip_reason || "Click to toggle"}
                      >
                        {r.action === "create" ? "Import" : "Skip"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={importing || toImportCount === 0}>
              {importing ? <><Loader2 className="animate-spin mr-2" size={16} /> Importing…</> : `Import ${toImportCount} rows`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminImportTab;
