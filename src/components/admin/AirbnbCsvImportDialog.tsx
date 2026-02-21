import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckSquare } from "lucide-react";

interface PropertyOption {
  id: string;
  name: string;
}

interface AirbnbCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: PropertyOption[];
  onImported: () => void;
}

type CsvFormat = "transactions" | "reservations";

interface ParsedRow {
  // Common
  confirmation_code: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  currency: string;
  // Transactions format
  date: string;
  type: string;
  reservation_date: string;
  listing_name: string;
  details: string;
  reference_code: string;
  amount: number;
  service_fee: number;
  cleaning_fee: number;
  gross_earnings: number;
  tourist_tax: number;
  revenue_year: string;
  // Reservations format
  airbnb_status: string;
  guest_phone: string;
  num_adults: number;
  num_children: number;
  num_infants: number;
  booked_date: string;
  earnings: number;
  // UI state
  selected: boolean;
  status: "new" | "exists";
  existing_id?: string;
  format: CsvFormat;
}

// CSV column mappings — Transactions format (French Airbnb export)
const COL_MAP_TX: Record<string, string[]> = {
  date: ["date"],
  type: ["type"],
  confirmation_code: ["code de confirmation", "confirmation code"],
  reservation_date: ["date de réservation", "booking date"],
  check_in: ["date de début", "start date", "check-in"],
  check_out: ["date de fin", "end date", "check-out"],
  nights: ["nuits", "nights", "# of nights"],
  guest_name: ["voyageur", "guest", "guest name"],
  listing_name: ["logement", "listing"],
  details: ["détails", "details"],
  reference_code: ["code de référence", "reference code"],
  currency: ["devise", "currency"],
  amount: ["montant", "amount"],
  service_fee: ["frais de service", "service fee"],
  cleaning_fee: ["frais de ménage", "cleaning fee"],
  gross_earnings: ["revenus bruts", "gross earnings", "total"],
  tourist_tax: ["taxes de séjour", "tourist tax", "occupancy taxes"],
  revenue_year: ["année des revenus", "revenue year"],
};

// CSV column mappings — Reservations format (standard Airbnb export)
const COL_MAP_RES: Record<string, string[]> = {
  confirmation_code: ["confirmation code", "code de confirmation"],
  airbnb_status: ["status", "statut"],
  guest_name: ["guest name", "voyageur", "guest"],
  guest_phone: ["contact", "phone", "téléphone"],
  num_adults: ["# of adults", "adults", "adultes"],
  num_children: ["# of children", "children", "enfants"],
  num_infants: ["# of infants", "infants", "bébés"],
  check_in: ["start date", "date de début", "check-in"],
  check_out: ["end date", "date de fin", "check-out"],
  nights: ["# of nights", "nuits", "nights"],
  booked_date: ["booked", "date de réservation"],
  listing_name: ["listing", "logement"],
  earnings: ["earnings", "revenus", "total"],
};

function findCol(headers: string[], aliases: string[]): number {
  const norm = headers.map((h) => h.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = norm.indexOf(alias.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

function detectFormat(headers: string[]): CsvFormat {
  const norm = headers.map((h) => h.toLowerCase().trim());
  // Reservations format has "# of adults" or "status" columns
  if (norm.some((h) => h.includes("# of adults") || h === "status" || h === "statut" || h.includes("earnings"))) {
    return "reservations";
  }
  return "transactions";
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

function parseDateStr(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split("/");
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (a <= 12) return `${c}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
    return `${c}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
  }
  return trimmed;
}

function parseNum(str: string): number {
  if (!str) return 0;
  return parseFloat(str.trim().replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
}

function parseEarnings(str: string): { amount: number; currency: string } {
  if (!str) return { amount: 0, currency: "EUR" };
  const trimmed = str.trim();
  const currency = trimmed.includes("€") ? "EUR" : trimmed.includes("$") ? "USD" : trimmed.includes("AED") ? "AED" : trimmed.includes("₾") ? "GEL" : "EUR";
  const amount = parseFloat(trimmed.replace(/[$€,\s₾]/g, "").replace("AED", "")) || 0;
  return { amount, currency };
}

function mapAirbnbStatus(airbnbStatus: string): string {
  const s = airbnbStatus.toLowerCase();
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("past guest")) return "completed";
  if (s.includes("checking out")) return "completed";
  if (s.includes("awaiting")) return "confirmed";
  if (s.includes("confirmed") || s.includes("currently hosting")) return "confirmed";
  return "confirmed";
}

const AirbnbCsvImportDialog = ({ open, onOpenChange, properties, onImported }: AirbnbCsvImportDialogProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "importing">("upload");
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || "");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<CsvFormat>("transactions");

  const resetState = () => {
    setStep("upload");
    setRows([]);
    setSelectedPropertyId(properties[0]?.id || "");
    setDetectedFormat("transactions");
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) resetState();
    onOpenChange(o);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { toast.error("Fichier CSV uniquement"); return; }
    await processFile(file);
    e.target.value = "";
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    const csvRows = parseCSV(text);
    if (csvRows.length < 2) { toast.error("CSV vide ou invalide"); return; }

    const headers = csvRows[0];
    const format = detectFormat(headers);
    setDetectedFormat(format);

    // Fetch existing confirmation codes for duplicate detection
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("id, airbnb_confirmation_code")
      .not("airbnb_confirmation_code", "is", null);
    const existingMap = new Map(
      (existingBookings || []).map((b: any) => [b.airbnb_confirmation_code, b.id])
    );

    let parsed: ParsedRow[] = [];

    if (format === "reservations") {
      parsed = parseReservationsFormat(csvRows, headers, existingMap);
    } else {
      parsed = parseTransactionsFormat(csvRows, headers, existingMap);
    }

    if (parsed.length === 0) { toast.error("Aucune réservation trouvée dans le CSV"); return; }
    setRows(parsed);
    setStep("preview");
    toast.success(`${parsed.length} réservations trouvées (format: ${format})`);
  };

  const parseReservationsFormat = (csvRows: string[][], headers: string[], existingMap: Map<string, string>): ParsedRow[] => {
    const colIdx: Record<string, number> = {};
    for (const key of Object.keys(COL_MAP_RES)) {
      colIdx[key] = findCol(headers, COL_MAP_RES[key]);
    }

    if (colIdx.confirmation_code === -1) {
      toast.error("Colonne 'Confirmation code' introuvable");
      return [];
    }

    const parsed: ParsedRow[] = [];
    for (let i = 1; i < csvRows.length; i++) {
      const row = csvRows[i];
      const code = row[colIdx.confirmation_code]?.trim() || "";
      if (!code) continue;

      const checkIn = parseDateStr(colIdx.check_in !== -1 ? row[colIdx.check_in] || "" : "");
      const checkOut = parseDateStr(colIdx.check_out !== -1 ? row[colIdx.check_out] || "" : "");
      if (!checkIn && !checkOut) continue;

      const earningsStr = colIdx.earnings !== -1 ? row[colIdx.earnings]?.trim() || "" : "";
      const { amount: earningsAmount, currency: earningsCurrency } = parseEarnings(earningsStr);

      const airbnbStatus = colIdx.airbnb_status !== -1 ? row[colIdx.airbnb_status]?.trim() || "" : "";
      const isExisting = existingMap.has(code);

      parsed.push({
        confirmation_code: code,
        guest_name: colIdx.guest_name !== -1 ? row[colIdx.guest_name]?.trim() || "Airbnb Guest" : "Airbnb Guest",
        check_in: checkIn,
        check_out: checkOut,
        nights: colIdx.nights !== -1 ? parseInt(row[colIdx.nights]) || 0 : 0,
        currency: earningsCurrency,
        airbnb_status: airbnbStatus,
        guest_phone: colIdx.guest_phone !== -1 ? row[colIdx.guest_phone]?.trim() || "" : "",
        num_adults: colIdx.num_adults !== -1 ? parseInt(row[colIdx.num_adults]) || 0 : 0,
        num_children: colIdx.num_children !== -1 ? parseInt(row[colIdx.num_children]) || 0 : 0,
        num_infants: colIdx.num_infants !== -1 ? parseInt(row[colIdx.num_infants]) || 0 : 0,
        booked_date: parseDateStr(colIdx.booked_date !== -1 ? row[colIdx.booked_date] || "" : ""),
        listing_name: colIdx.listing_name !== -1 ? row[colIdx.listing_name]?.trim() || "" : "",
        earnings: earningsAmount,
        // Transaction-only fields (empty for reservations)
        date: "", type: "", reservation_date: "", details: "", reference_code: "",
        amount: earningsAmount, service_fee: 0, cleaning_fee: 0, gross_earnings: earningsAmount, tourist_tax: 0, revenue_year: "",
        // UI state
        selected: !isExisting,
        status: isExisting ? "exists" : "new",
        existing_id: isExisting ? existingMap.get(code) : undefined,
        format: "reservations",
      });
    }
    return parsed;
  };

  const parseTransactionsFormat = (csvRows: string[][], headers: string[], existingMap: Map<string, string>): ParsedRow[] => {
    const colIdx: Record<string, number> = {};
    for (const key of Object.keys(COL_MAP_TX)) {
      colIdx[key] = findCol(headers, COL_MAP_TX[key]);
    }

    if (colIdx.confirmation_code === -1) {
      toast.error("Colonne 'Code de confirmation' introuvable");
      return [];
    }

    const parsed: ParsedRow[] = [];
    for (let i = 1; i < csvRows.length; i++) {
      const row = csvRows[i];
      const code = row[colIdx.confirmation_code]?.trim() || "";
      if (!code) continue;

      const checkIn = parseDateStr(colIdx.check_in !== -1 ? row[colIdx.check_in] || "" : "");
      const checkOut = parseDateStr(colIdx.check_out !== -1 ? row[colIdx.check_out] || "" : "");
      if (!checkIn && !checkOut) continue;

      const isExisting = existingMap.has(code);

      parsed.push({
        confirmation_code: code,
        guest_name: colIdx.guest_name !== -1 ? row[colIdx.guest_name]?.trim() || "Airbnb Guest" : "Airbnb Guest",
        check_in: checkIn,
        check_out: checkOut,
        nights: colIdx.nights !== -1 ? parseInt(row[colIdx.nights]) || 0 : 0,
        currency: colIdx.currency !== -1 ? row[colIdx.currency]?.trim() || "EUR" : "EUR",
        date: colIdx.date !== -1 ? row[colIdx.date]?.trim() || "" : "",
        type: colIdx.type !== -1 ? row[colIdx.type]?.trim() || "" : "",
        reservation_date: parseDateStr(colIdx.reservation_date !== -1 ? row[colIdx.reservation_date] || "" : ""),
        listing_name: colIdx.listing_name !== -1 ? row[colIdx.listing_name]?.trim() || "" : "",
        details: colIdx.details !== -1 ? row[colIdx.details]?.trim() || "" : "",
        reference_code: colIdx.reference_code !== -1 ? row[colIdx.reference_code]?.trim() || "" : "",
        amount: parseNum(colIdx.amount !== -1 ? row[colIdx.amount] || "" : ""),
        service_fee: parseNum(colIdx.service_fee !== -1 ? row[colIdx.service_fee] || "" : ""),
        cleaning_fee: parseNum(colIdx.cleaning_fee !== -1 ? row[colIdx.cleaning_fee] || "" : ""),
        gross_earnings: parseNum(colIdx.gross_earnings !== -1 ? row[colIdx.gross_earnings] || "" : ""),
        tourist_tax: parseNum(colIdx.tourist_tax !== -1 ? row[colIdx.tourist_tax] || "" : ""),
        revenue_year: colIdx.revenue_year !== -1 ? row[colIdx.revenue_year]?.trim() || "" : "",
        // Reservations-only fields (empty for transactions)
        airbnb_status: "", guest_phone: "", num_adults: 0, num_children: 0, num_infants: 0,
        booked_date: "", earnings: 0,
        // UI state
        selected: !isExisting,
        status: isExisting ? "exists" : "new",
        existing_id: isExisting ? existingMap.get(code) : undefined,
        format: "transactions",
      });
    }
    return parsed;
  };

  const toggleRow = (i: number) => {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, selected: !r.selected } : r));
  };

  const selectAllNew = () => {
    setRows((prev) => prev.map((r) => ({ ...r, selected: r.status === "new" })));
  };

  const selectedCount = rows.filter((r) => r.selected).length;
  const newCount = rows.filter((r) => r.status === "new").length;
  const existsCount = rows.filter((r) => r.status === "exists").length;

  const handleImport = async () => {
    if (!selectedPropertyId) { toast.error("Sélectionnez une propriété"); return; }
    setImporting(true);
    setStep("importing");

    let created = 0;
    let updated = 0;
    let errors = 0;

    const toImport = rows.filter((r) => r.selected);

    for (const row of toImport) {
      try {
        if (row.status === "exists" && row.existing_id) {
          if (row.format === "reservations") {
            // UPDATE with reservations data
            const { error } = await supabase
              .from("bookings")
              .update({
                guest_phone: row.guest_phone || undefined,
                num_adults: row.num_adults,
                num_children: row.num_children,
                num_infants: row.num_infants,
                total_price: row.earnings || undefined,
                status: mapAirbnbStatus(row.airbnb_status),
                airbnb_status: row.airbnb_status || undefined,
              } as any)
              .eq("id", row.existing_id);
            if (error) { errors++; continue; }
          } else {
            // UPDATE with transactions data
            const { error } = await supabase
              .from("bookings")
              .update({
                total_price: row.gross_earnings || undefined,
                cleaning_fee: row.cleaning_fee || undefined,
                airbnb_service_fee: row.service_fee || undefined,
                tourist_tax_total: row.tourist_tax || undefined,
                airbnb_payout: row.gross_earnings || undefined,
                airbnb_reference_code: row.reference_code || undefined,
              } as any)
              .eq("id", row.existing_id);
            if (error) { errors++; continue; }
          }
          updated++;
        } else {
          // INSERT new booking
          const nights = row.nights || (row.check_in && row.check_out
            ? Math.max(0, Math.ceil((new Date(row.check_out).getTime() - new Date(row.check_in).getTime()) / 86400000))
            : 0);

          const totalPrice = row.format === "reservations" ? row.earnings : row.gross_earnings;
          const basePricePerNight = nights > 0 ? Math.round(totalPrice / nights) : 0;

          const insertData: any = {
            property_id: selectedPropertyId,
            guest_name: row.guest_name,
            guest_email: "airbnb@imported.com",
            check_in: row.check_in,
            check_out: row.check_out,
            nights,
            base_price_per_night: basePricePerNight,
            total_price: totalPrice,
            status: row.format === "reservations" ? mapAirbnbStatus(row.airbnb_status) : "confirmed",
            source: "airbnb_csv",
            payment_status: "paid",
            payment_method: "airbnb",
            airbnb_confirmation_code: row.confirmation_code,
            internal_notes: `Imported from Airbnb CSV — ${row.listing_name}`,
          };

          if (row.format === "reservations") {
            insertData.guest_phone = row.guest_phone || null;
            insertData.num_adults = row.num_adults;
            insertData.num_children = row.num_children;
            insertData.num_infants = row.num_infants;
            insertData.booked_date = row.booked_date || null;
            insertData.airbnb_status = row.airbnb_status || null;
            insertData.airbnb_payout = row.earnings;
            insertData.paid_at = row.booked_date ? new Date(row.booked_date).toISOString() : new Date().toISOString();
          } else {
            insertData.cleaning_fee = row.cleaning_fee;
            insertData.tourist_tax_total = row.tourist_tax;
            insertData.airbnb_reference_code = row.reference_code || null;
            insertData.airbnb_payout = row.gross_earnings;
            insertData.airbnb_service_fee = row.service_fee;
            insertData.paid_at = row.reservation_date ? new Date(row.reservation_date).toISOString() : new Date().toISOString();
          }

          const { data: booking, error: bErr } = await supabase
            .from("bookings")
            .insert(insertData)
            .select("id")
            .single();

          if (bErr || !booking) { errors++; continue; }

          // Block dates in availability
          const bookingId = (booking as any).id;
          if (row.check_in && row.check_out) {
            const start = new Date(row.check_in + "T00:00:00Z");
            const end = new Date(row.check_out + "T00:00:00Z");
            const current = new Date(start);
            while (current < end) {
              const dateStr = current.toISOString().split("T")[0];
              await supabase.from("availability").upsert(
                { property_id: selectedPropertyId, date: dateStr, available: false, source: "airbnb", booking_id: bookingId },
                { onConflict: "property_id,date" }
              );
              current.setUTCDate(current.getUTCDate() + 1);
            }
          }
          created++;
        }
      } catch (err) {
        errors++;
      }
    }

    setImporting(false);
    const parts: string[] = [];
    if (created > 0) parts.push(`${created} importée${created > 1 ? "s" : ""}`);
    if (updated > 0) parts.push(`${updated} mise${updated > 1 ? "s" : ""} à jour`);
    if (errors > 0) parts.push(`${errors} erreur${errors > 1 ? "s" : ""}`);
    toast.success(`✓ ${parts.join(", ")}`);
    onImported();
    handleOpenChange(false);
  };

  const STATUS_BADGE: Record<string, string> = {
    "Confirmed": "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]",
    "Currently hosting": "bg-[hsl(210,60%,92%)] text-[hsl(210,60%,30%)]",
    "Checking out": "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]",
    "Past guest": "bg-muted text-muted-foreground",
    "Canceled by guest": "bg-[hsl(0,50%,92%)] text-[hsl(0,50%,35%)]",
    "Canceled by host": "bg-[hsl(0,50%,92%)] text-[hsl(0,50%,35%)]",
    "Awaiting review": "bg-[hsl(280,40%,92%)] text-[hsl(280,40%,35%)]",
  };

  const getStatusBadge = (status: string) => {
    const match = Object.entries(STATUS_BADGE).find(([key]) => status.toLowerCase().includes(key.toLowerCase()));
    return match ? match[1] : "bg-muted text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={step === "preview" ? "max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" : "max-w-lg"}>
        <DialogHeader>
          <DialogTitle className="font-display">Import Airbnb CSV</DialogTitle>
          {step === "upload" && (
            <DialogDescription>
              Importez un fichier CSV Airbnb (réservations ou transactions). Le format est détecté automatiquement.
            </DialogDescription>
          )}
          {step === "preview" && (
            <DialogDescription>
              <span className="text-xs px-2 py-0.5 bg-[hsl(210,60%,92%)] text-[hsl(210,60%,30%)] uppercase tracking-wider mr-2">
                {detectedFormat === "reservations" ? "Réservations" : "Transactions"}
              </span>
              <span className="text-[hsl(120,40%,50%)]">✓ {newCount} nouvelle{newCount > 1 ? "s" : ""}</span>
              {" · "}
              <span className="text-[hsl(30,80%,50%)]">⟲ {existsCount} existante{existsCount > 1 ? "s" : ""}</span>
              {" · "}
              <span className="font-medium">{selectedCount} sélectionnée{selectedCount > 1 ? "s" : ""}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Propriété</label>
              <select
                className="w-full px-3 py-2 border border-border bg-background text-sm"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="border-2 border-dashed border-border rounded-md p-8 text-center space-y-3">
              <Upload className="mx-auto text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground">Glissez un fichier CSV ou cliquez ci-dessous</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <FileText size={16} className="mr-2" /> Choisir un fichier CSV
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium">Formats supportés :</p>
              <div className="space-y-1">
                <p><strong>Réservations :</strong> Confirmation code, Status, Guest name, Contact, # of adults/children/infants, Start date, End date, # of nights, Booked, Listing, Earnings</p>
                <p><strong>Transactions :</strong> Date, Type, Code de confirmation, Date de début, Date de fin, Nuits, Voyageur, Devise, Montant, Frais de service, Revenus bruts…</p>
              </div>
            </div>
          </div>
        )}

        {step === "preview" && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={selectAllNew}>
                <CheckSquare size={14} className="mr-1" /> Sélectionner nouvelles
              </Button>
              <span className="text-xs text-muted-foreground ml-auto">
                Propriété : {properties.find((p) => p.id === selectedPropertyId)?.name}
              </span>
            </div>
            <div className="overflow-auto flex-1 border border-border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">✓</TableHead>
                    {detectedFormat === "reservations" && <TableHead className="w-[100px]">Status</TableHead>}
                    <TableHead>Voyageur</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="w-[60px]">Nuits</TableHead>
                    {detectedFormat === "reservations" && <TableHead className="w-[90px]">Voyageurs</TableHead>}
                    <TableHead className="w-[100px]">{detectedFormat === "reservations" ? "Earnings" : "Revenus"}</TableHead>
                    <TableHead className="w-[80px]">Import</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i} className={!r.selected ? "opacity-50" : ""}>
                      <TableCell>
                        <input type="checkbox" checked={r.selected} onChange={() => toggleRow(i)} className="accent-primary" />
                      </TableCell>
                      {detectedFormat === "reservations" && (
                        <TableCell>
                          <span className={`text-[0.6rem] px-1.5 py-0.5 uppercase tracking-wider whitespace-nowrap ${getStatusBadge(r.airbnb_status)}`}>
                            {r.airbnb_status.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-sm">
                        <div>{r.guest_name}</div>
                        {r.guest_phone && <div className="text-[0.65rem] text-muted-foreground">{r.guest_phone}</div>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {r.check_in} → {r.check_out}
                      </TableCell>
                      <TableCell className="text-sm">{r.nights}</TableCell>
                      {detectedFormat === "reservations" && (
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {r.num_adults}a{r.num_children > 0 ? ` ${r.num_children}c` : ""}{r.num_infants > 0 ? ` ${r.num_infants}i` : ""}
                        </TableCell>
                      )}
                      <TableCell className="text-sm font-medium">
                        {(detectedFormat === "reservations" ? r.earnings : r.gross_earnings).toFixed(2)} {r.currency}
                      </TableCell>
                      <TableCell>
                        {r.status === "new" ? (
                          <span className="text-[0.65rem] px-2 py-0.5 bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)] uppercase tracking-wider">New</span>
                        ) : (
                          <span className="text-[0.65rem] px-2 py-0.5 bg-[hsl(30,70%,92%)] text-[hsl(30,60%,30%)] uppercase tracking-wider">Exists</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <Button variant="outline" onClick={() => setStep("upload")}>← Retour</Button>
              <Button onClick={handleImport} disabled={selectedCount === 0}>
                Importer {selectedCount} réservation{selectedCount > 1 ? "s" : ""}
              </Button>
            </div>
          </>
        )}

        {step === "importing" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="mx-auto animate-spin text-primary" size={40} />
            <p className="text-muted-foreground">Import en cours…</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AirbnbCsvImportDialog;
