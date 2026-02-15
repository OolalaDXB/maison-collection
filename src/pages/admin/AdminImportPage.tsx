import { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ParsedReservation {
  confirmation_code: string;
  status: string;
  guest_name: string;
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
}

const COLUMN_MAPS: Record<string, string[]> = {
  confirmation_code: ["confirmation code", "code de confirmation", "confirmation"],
  status: ["status", "statut"],
  guest_name: ["guest", "guest name", "voyageur", "nom du voyageur"],
  guests_count: ["# guests", "guests", "# of guests", "voyageurs", "nombre de voyageurs"],
  check_in: ["check-in", "checkin", "check in", "arrivée", "date d'arrivée"],
  check_out: ["check-out", "checkout", "check out", "départ", "date de départ"],
  nights: ["nights", "nuits", "durée"],
  listing_name: ["listing", "listing name", "annonce", "nom de l'annonce"],
  earnings: ["earnings", "host earnings", "amount", "revenus", "gains"],
  currency: ["currency", "devise"],
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

const AdminImportPage = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedReservation[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [stats, setStats] = useState({ created: 0, skipped: 0 });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

      const earningsStr = colIdx.earnings !== -1 ? row[colIdx.earnings]?.trim().replace(/[^0-9.,]/g, "").replace(",", ".") : "0";

      reservations.push({
        confirmation_code: code,
        status: colIdx.status !== -1 ? row[colIdx.status]?.trim() || "confirmed" : "confirmed",
        guest_name: colIdx.guest_name !== -1 ? row[colIdx.guest_name]?.trim() || "Airbnb Guest" : "Airbnb Guest",
        guests_count: colIdx.guests_count !== -1 ? parseInt(row[colIdx.guests_count]) || 1 : 1,
        check_in: checkIn,
        check_out: checkOut,
        nights: colIdx.nights !== -1 ? parseInt(row[colIdx.nights]) || 0 : 0,
        listing_name: listingName,
        earnings: parseFloat(earningsStr) || 0,
        currency: colIdx.currency !== -1 ? row[colIdx.currency]?.trim() || "EUR" : "EUR",
        property_id: matchedProp?.id || null,
        property_slug: matchedProp?.slug || null,
        action,
        skip_reason: skipReason,
      });
    }

    setParsed(reservations);
    toast.success(`${reservations.length} reservations found`);
  };

  const handleImport = async () => {
    setImporting(true);
    let created = 0;
    let skipped = 0;
    const toImport = parsed.filter((r) => r.action === "create");

    for (const res of toImport) {
      if (!res.property_id) { skipped++; continue; }

      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert({
          property_id: res.property_id,
          guest_name: res.guest_name,
          guest_email: "airbnb@imported.com",
          guests_count: res.guests_count,
          check_in: res.check_in,
          check_out: res.check_out,
          base_price_per_night: res.nights > 0 ? Math.round(res.earnings / res.nights) : 0,
          total_price: res.earnings,
          status: res.status.toLowerCase().includes("cancel") ? "cancelled" : "confirmed",
          source: "airbnb_csv",
          airbnb_confirmation_code: res.confirmation_code,
          airbnb_payout: res.earnings,
          internal_notes: `Imported from Airbnb CSV — ${res.listing_name}`,
          paid_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (bErr) { console.error("Import error:", bErr); skipped++; continue; }

      // Block availability dates
      const checkIn = new Date(res.check_in + "T00:00:00Z");
      const checkOut = new Date(res.check_out + "T00:00:00Z");
      const current = new Date(checkIn);
      while (current < checkOut) {
        const dateStr = current.toISOString().split("T")[0];
        await supabase.from("availability").upsert(
          { property_id: res.property_id, date: dateStr, available: false, source: "airbnb", booking_id: (booking as any).id },
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
    toast.success(`Import complete: ${created} created, ${skipped} skipped`);
  };

  const toImportCount = parsed.filter((r) => r.action === "create").length;
  const toSkipCount = parsed.filter((r) => r.action === "skip").length;

  // State 3: Complete
  if (imported) {
    return (
      <AdminLayout>
        <h1 className="font-display text-2xl mb-6">Import Airbnb Reservations</h1>
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
      </AdminLayout>
    );
  }

  // State 2: Preview
  if (parsed.length > 0) {
    return (
      <AdminLayout>
        <h1 className="font-display text-2xl mb-6">Import Airbnb Reservations</h1>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center justify-between">
              <span>Preview — {parsed.length} reservations found</span>
              <div className="flex gap-4 text-sm font-normal">
                <span className="text-[hsl(120,40%,50%)]">✓ {toImportCount} to import</span>
                <span className="text-muted-foreground">⏭ {toSkipCount} to skip</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Nights</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((r, i) => (
                    <TableRow key={i} className={r.action === "skip" ? "opacity-50" : ""}>
                      <TableCell className="text-xs font-mono">{r.confirmation_code}</TableCell>
                      <TableCell className="text-sm">{r.guest_name}</TableCell>
                      <TableCell className="text-xs">{r.check_in} → {r.check_out}</TableCell>
                      <TableCell className="text-sm">{r.nights}</TableCell>
                      <TableCell className="text-sm">€{r.earnings.toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{r.property_slug || "—"}</TableCell>
                      <TableCell>
                        {r.action === "create" ? (
                          <span className="text-xs text-[hsl(120,40%,50%)]">Import</span>
                        ) : (
                          <span className="text-xs text-muted-foreground" title={r.skip_reason}>
                            Skip{r.skip_reason ? ` — ${r.skip_reason}` : ""}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setParsed([])}>Cancel</Button>
              <Button onClick={handleImport} disabled={importing || toImportCount === 0}>
                {importing ? <><Loader2 className="animate-spin mr-2" size={16} /> Importing…</> : `Import ${toImportCount} rows`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  // State 1: Upload
  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Import Airbnb Reservations</h1>
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <Upload className="mx-auto text-muted-foreground" size={48} />
            <h2 className="font-display text-lg">Upload Airbnb CSV</h2>
            <p className="text-sm text-muted-foreground">
              Upload your Airbnb reservation CSV export. Past reservations will be imported with guest names and earnings. Duplicates are automatically skipped.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button onClick={() => fileRef.current?.click()}>
              <FileText size={16} className="mr-2" /> Choose CSV file
            </Button>
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
    </AdminLayout>
  );
};

export default AdminImportPage;
