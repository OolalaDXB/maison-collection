import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Loader2, FileSpreadsheet, CalendarDays, Home, Star, Users, CreditCard, TrendingUp } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  fetch: () => Promise<any[]>;
  columns: { key: string; label: string }[];
  /** If true, generates a multi-sheet financial report instead of a simple table */
  isFinancialReport?: boolean;
}

// ── Financial report builder ───────────────────────────────────────────
async function fetchFinancialData() {
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, properties(name, slug, currency)")
    .in("status", ["confirmed", "completed"])
    .order("check_in", { ascending: true });

  const rows = (bookings || []).map((b: any) => ({
    ...b,
    property_name: b.properties?.name || "Unknown",
    property_slug: b.properties?.slug || "",
    currency: b.properties?.currency || "EUR",
  }));

  return rows;
}

function buildFinancialWorkbook(bookings: any[]) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Monthly revenue by property ──
  const monthlyMap: Record<string, Record<string, {
    revenue: number; nights: number; bookings: number;
    cleaning: number; tax: number; airbnb_payout: number; discount: number;
  }>> = {};
  const propertyNames = new Set<string>();

  for (const b of bookings) {
    const month = b.check_in?.slice(0, 7) || "Unknown"; // YYYY-MM
    const prop = b.property_name;
    propertyNames.add(prop);
    if (!monthlyMap[month]) monthlyMap[month] = {};
    if (!monthlyMap[month][prop]) monthlyMap[month][prop] = { revenue: 0, nights: 0, bookings: 0, cleaning: 0, tax: 0, airbnb_payout: 0, discount: 0 };
    const m = monthlyMap[month][prop];
    m.revenue += Number(b.total_price) || 0;
    m.nights += Number(b.nights) || 0;
    m.bookings += 1;
    m.cleaning += Number(b.cleaning_fee) || 0;
    m.tax += Number(b.tourist_tax_total) || 0;
    m.airbnb_payout += Number(b.airbnb_payout) || 0;
    m.discount += Number(b.discount_amount) || 0;
  }

  const months = Object.keys(monthlyMap).sort();
  const props = Array.from(propertyNames).sort();

  // Revenue by property by month
  const revenueRows: any[] = [];
  for (const month of months) {
    const row: Record<string, any> = { Month: month };
    let total = 0;
    for (const prop of props) {
      const val = monthlyMap[month]?.[prop]?.revenue || 0;
      row[prop] = val;
      total += val;
    }
    row["TOTAL"] = total;
    revenueRows.push(row);
  }
  // Grand total row
  if (revenueRows.length > 0) {
    const totRow: Record<string, any> = { Month: "TOTAL" };
    let grandTotal = 0;
    for (const prop of props) {
      const sum = revenueRows.reduce((s, r) => s + (Number(r[prop]) || 0), 0);
      totRow[prop] = sum;
      grandTotal += sum;
    }
    totRow["TOTAL"] = grandTotal;
    revenueRows.push(totRow);
  }
  const ws1 = XLSX.utils.json_to_sheet(revenueRows);
  ws1["!cols"] = [{ wch: 10 }, ...props.map(() => ({ wch: 16 })), { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Revenue by Month");

  // ── Sheet 2: Nights & occupancy by property by month ──
  const nightsRows: any[] = [];
  for (const month of months) {
    const row: Record<string, any> = { Month: month };
    let total = 0;
    for (const prop of props) {
      const val = monthlyMap[month]?.[prop]?.nights || 0;
      row[`${prop} (nights)`] = val;
      row[`${prop} (bookings)`] = monthlyMap[month]?.[prop]?.bookings || 0;
      total += val;
    }
    row["Total Nights"] = total;
    nightsRows.push(row);
  }
  const ws2 = XLSX.utils.json_to_sheet(nightsRows);
  ws2["!cols"] = [{ wch: 10 }, ...props.flatMap(() => [{ wch: 18 }, { wch: 18 }]), { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Occupancy");

  // ── Sheet 3: Breakdown (cleaning, tax, discounts, Airbnb payout) ──
  const breakdownRows: any[] = [];
  for (const month of months) {
    for (const prop of props) {
      const m = monthlyMap[month]?.[prop];
      if (!m || m.bookings === 0) continue;
      breakdownRows.push({
        Month: month,
        Property: prop,
        Bookings: m.bookings,
        "Gross Revenue": m.revenue,
        "Cleaning Fees": m.cleaning,
        "Tourist Tax": m.tax,
        Discounts: m.discount,
        "Airbnb Payout": m.airbnb_payout,
        "Net Revenue": m.revenue - m.discount,
        "Avg/Night": m.nights > 0 ? Math.round(m.revenue / m.nights) : 0,
      });
    }
  }
  const ws3 = XLSX.utils.json_to_sheet(breakdownRows);
  ws3["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Breakdown");

  // ── Sheet 4: Source analysis (Direct vs Airbnb) ──
  const sourceMap: Record<string, Record<string, { revenue: number; bookings: number; nights: number }>> = {};
  for (const b of bookings) {
    const source = (b.source || "direct").replace("airbnb_csv", "airbnb");
    const prop = b.property_name;
    if (!sourceMap[prop]) sourceMap[prop] = {};
    if (!sourceMap[prop][source]) sourceMap[prop][source] = { revenue: 0, bookings: 0, nights: 0 };
    sourceMap[prop][source].revenue += Number(b.total_price) || 0;
    sourceMap[prop][source].bookings += 1;
    sourceMap[prop][source].nights += Number(b.nights) || 0;
  }
  const sourceRows: any[] = [];
  for (const prop of props) {
    const sources = sourceMap[prop] || {};
    for (const [source, data] of Object.entries(sources)) {
      sourceRows.push({
        Property: prop,
        Source: source,
        Bookings: data.bookings,
        Nights: data.nights,
        Revenue: data.revenue,
        "Avg/Night": data.nights > 0 ? Math.round(data.revenue / data.nights) : 0,
      });
    }
  }
  const ws4 = XLSX.utils.json_to_sheet(sourceRows);
  ws4["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws4, "By Source");

  // ── Sheet 5: All bookings detail ──
  const detailRows = bookings.map((b: any) => ({
    Property: b.property_name,
    Guest: b.guest_name,
    "Check-in": b.check_in,
    "Check-out": b.check_out,
    Nights: b.nights,
    Guests: b.guests_count,
    "Price/Night": b.base_price_per_night,
    "Cleaning Fee": b.cleaning_fee,
    "Tourist Tax": b.tourist_tax_total,
    Discount: b.discount_amount,
    Total: b.total_price,
    Source: b.source,
    Status: b.status,
    "Airbnb Code": b.airbnb_confirmation_code || "",
    "Airbnb Payout": b.airbnb_payout || "",
  }));
  const ws5 = XLSX.utils.json_to_sheet(detailRows);
  ws5["!cols"] = Array(15).fill(null).map(() => ({ wch: 14 }));
  XLSX.utils.book_append_sheet(wb, ws5, "All Bookings");

  return wb;
}

// ── Preview summary for the financial report dialog ──
function buildFinancialSummary(bookings: any[]) {
  const propTotals: Record<string, { revenue: number; bookings: number; nights: number }> = {};
  for (const b of bookings) {
    const prop = b.property_name;
    if (!propTotals[prop]) propTotals[prop] = { revenue: 0, bookings: 0, nights: 0 };
    propTotals[prop].revenue += Number(b.total_price) || 0;
    propTotals[prop].bookings += 1;
    propTotals[prop].nights += Number(b.nights) || 0;
  }
  return Object.entries(propTotals).map(([prop, data]) => ({
    property: prop,
    bookings: data.bookings,
    nights: data.nights,
    revenue: data.revenue,
    avg_per_night: data.nights > 0 ? Math.round(data.revenue / data.nights) : 0,
  }));
}

const EXPORT_CONFIGS: ExportConfig[] = [
  {
    key: "financial_report",
    label: "Financial Report",
    icon: <TrendingUp size={20} />,
    description: "Multi-sheet report: revenue by month, occupancy, breakdown, source analysis",
    isFinancialReport: true,
    fetch: fetchFinancialData,
    columns: [
      { key: "property", label: "Property" },
      { key: "bookings", label: "Bookings" },
      { key: "nights", label: "Nights" },
      { key: "revenue", label: "Revenue (€)" },
      { key: "avg_per_night", label: "Avg €/Night" },
    ],
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: <CalendarDays size={20} />,
    description: "All reservations with guest info, dates, and payments",
    fetch: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, properties(name, slug)")
        .order("check_in", { ascending: false });
      return (data || []).map((b: any) => ({
        ...b,
        property_name: b.properties?.name || "",
        property_slug: b.properties?.slug || "",
      }));
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "property_name", label: "Property" },
      { key: "guest_name", label: "Guest" },
      { key: "guest_email", label: "Email" },
      { key: "guest_phone", label: "Phone" },
      { key: "guests_count", label: "Guests" },
      { key: "check_in", label: "Check-in" },
      { key: "check_out", label: "Check-out" },
      { key: "nights", label: "Nights" },
      { key: "base_price_per_night", label: "Price/Night" },
      { key: "cleaning_fee", label: "Cleaning Fee" },
      { key: "tourist_tax_total", label: "Tourist Tax" },
      { key: "discount_amount", label: "Discount" },
      { key: "total_price", label: "Total" },
      { key: "status", label: "Status" },
      { key: "source", label: "Source" },
      { key: "payment_status", label: "Payment Status" },
      { key: "payment_method", label: "Payment Method" },
      { key: "airbnb_confirmation_code", label: "Airbnb Code" },
      { key: "airbnb_payout", label: "Airbnb Payout" },
      { key: "created_at", label: "Created" },
    ],
  },
  {
    key: "properties",
    label: "Properties",
    icon: <Home size={20} />,
    description: "All properties with details, pricing, and settings",
    fetch: async () => {
      const { data } = await supabase.from("properties").select("*").order("display_order");
      return data || [];
    },
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "location", label: "Location" },
      { key: "region", label: "Region" },
      { key: "country", label: "Country" },
      { key: "price_per_night", label: "Price/Night" },
      { key: "weekend_price", label: "Weekend Price" },
      { key: "cleaning_fee", label: "Cleaning Fee" },
      { key: "capacity", label: "Capacity" },
      { key: "bedrooms", label: "Bedrooms" },
      { key: "bathrooms", label: "Bathrooms" },
      { key: "area_sqm", label: "Area (m²)" },
      { key: "min_nights", label: "Min Nights" },
      { key: "status", label: "Status" },
      { key: "currency", label: "Currency" },
    ],
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: <Star size={20} />,
    description: "All guest reviews with ratings",
    fetch: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, properties(name)")
        .order("created_at", { ascending: false });
      return (data || []).map((r: any) => ({
        ...r,
        property_name: r.properties?.name || "",
      }));
    },
    columns: [
      { key: "property_name", label: "Property" },
      { key: "guest_name", label: "Guest" },
      { key: "guest_location", label: "Guest Location" },
      { key: "rating", label: "Rating" },
      { key: "review_text", label: "Review" },
      { key: "stay_date", label: "Stay Date" },
      { key: "created_at", label: "Created" },
    ],
  },
  {
    key: "inquiries",
    label: "Inquiries",
    icon: <Users size={20} />,
    description: "All contact form submissions",
    fetch: async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("*, properties(name)")
        .order("created_at", { ascending: false });
      return (data || []).map((i: any) => ({
        ...i,
        property_name: i.properties?.name || "",
      }));
    },
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "subject", label: "Subject" },
      { key: "message", label: "Message" },
      { key: "property_name", label: "Property" },
      { key: "type", label: "Type" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Created" },
    ],
  },
  {
    key: "availability",
    label: "Availability",
    icon: <CalendarDays size={20} />,
    description: "Calendar availability and blocked dates",
    fetch: async () => {
      const { data } = await supabase
        .from("availability")
        .select("*, properties(name)")
        .order("date", { ascending: false })
        .limit(1000);
      return (data || []).map((a: any) => ({
        ...a,
        property_name: a.properties?.name || "",
      }));
    },
    columns: [
      { key: "property_name", label: "Property" },
      { key: "date", label: "Date" },
      { key: "available", label: "Available" },
      { key: "price_override", label: "Price Override" },
      { key: "source", label: "Source" },
      { key: "airbnb_uid", label: "Airbnb UID" },
    ],
  },
  {
    key: "seasonal_pricing",
    label: "Seasonal Pricing",
    icon: <CreditCard size={20} />,
    description: "All seasonal pricing rules",
    fetch: async () => {
      const { data } = await supabase
        .from("seasonal_pricing")
        .select("*, properties(name)")
        .order("start_date");
      return (data || []).map((s: any) => ({
        ...s,
        property_name: s.properties?.name || "",
      }));
    },
    columns: [
      { key: "property_name", label: "Property" },
      { key: "name", label: "Season" },
      { key: "start_date", label: "Start" },
      { key: "end_date", label: "End" },
      { key: "price_per_night", label: "Price/Night" },
      { key: "min_nights", label: "Min Nights" },
    ],
  },
];

const AdminExportTab = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [rawFinancialData, setRawFinancialData] = useState<any[] | null>(null);
  const [previewConfig, setPreviewConfig] = useState<ExportConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePreview = async (config: ExportConfig) => {
    setLoading(config.key);
    try {
      const data = await config.fetch();
      if (config.isFinancialReport) {
        setRawFinancialData(data);
        setPreviewData(buildFinancialSummary(data));
      } else {
        setRawFinancialData(null);
        setPreviewData(data);
      }
      setPreviewConfig(config);
      setDialogOpen(true);
    } catch (err: any) {
      toast.error(`Error loading ${config.label}: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadXLSX = () => {
    if (!previewConfig) return;

    if (previewConfig.isFinancialReport && rawFinancialData) {
      const wb = buildFinancialWorkbook(rawFinancialData);
      XLSX.writeFile(wb, `maisons-financial-report-${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success(`Financial report exported (5 sheets, ${rawFinancialData.length} bookings)`);
      return;
    }

    if (!previewData) return;

    const rows = previewData.map((row) => {
      const obj: Record<string, any> = {};
      for (const col of previewConfig.columns) {
        obj[col.label] = row[col.key] ?? "";
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, previewConfig.label);

    const colWidths = previewConfig.columns.map((col) => ({
      wch: Math.max(
        col.label.length,
        ...rows.map((r) => String(r[col.label] || "").slice(0, 50).length)
      ),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `maisons-${previewConfig.key}-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success(`${previewConfig.label} exported (${rows.length} rows)`);
  };

  const handleDownloadCSV = () => {
    if (!previewData || !previewConfig) return;

    const rows = previewData.map((row) => {
      const obj: Record<string, any> = {};
      for (const col of previewConfig.columns) {
        obj[col.label] = row[col.key] ?? "";
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maisons-${previewConfig.key}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${previewConfig.label} exported as CSV (${rows.length} rows)`);
  };

  const handleDownloadTemplate = (config: ExportConfig) => {
    if (config.isFinancialReport) return; // no template for reports
    const headers = config.columns.map((c) => c.label);
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 12) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, config.label);
    XLSX.writeFile(wb, `template-${config.key}.xlsx`);
    toast.success(`Template ${config.label} downloaded`);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EXPORT_CONFIGS.map((config) => (
          <Card
            key={config.key}
            className={`hover:shadow-md transition-shadow ${config.isFinancialReport ? "md:col-span-2 lg:col-span-3 border-primary/30 bg-primary/5" : ""}`}
          >
            <CardContent className={`pt-6 space-y-3 ${config.isFinancialReport ? "flex items-center gap-6" : ""}`}>
              <div className={`flex items-center gap-3 ${config.isFinancialReport ? "flex-1" : ""}`}>
                <div className={`p-2 rounded-md ${config.isFinancialReport ? "bg-primary/10" : "bg-muted"}`}>{config.icon}</div>
                <div>
                  <h3 className="font-display text-sm font-medium">{config.label}</h3>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                  {config.isFinancialReport && (
                    <p className="text-xs text-muted-foreground mt-1">
                      5 sheets: Revenue by Month · Occupancy · Breakdown · By Source · All Bookings
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePreview(config)}
                  disabled={loading === config.key}
                  className={config.isFinancialReport ? "" : "flex-1"}
                  variant={config.isFinancialReport ? "default" : "default"}
                >
                  {loading === config.key ? (
                    <Loader2 className="animate-spin mr-1" size={14} />
                  ) : (
                    <Download size={14} className="mr-1" />
                  )}
                  {config.isFinancialReport ? "Generate Report" : "Export"}
                </Button>
                {!config.isFinancialReport && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTemplate(config)}
                    title="Download empty XLS template"
                  >
                    <FileSpreadsheet size={14} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">
              {previewConfig?.label} — {previewData?.length || 0} {previewConfig?.isFinancialReport ? "properties" : "rows"}
            </DialogTitle>
            <DialogDescription>
              {previewConfig?.isFinancialReport
                ? "Summary by property. The XLSX download contains 5 detailed sheets."
                : "Preview your data before downloading. Choose XLSX or CSV format."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 border rounded-md">
            {previewConfig && previewData && (
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewConfig.columns.slice(0, 8).map((col) => (
                      <TableHead key={col.key} className="text-xs whitespace-nowrap">{col.label}</TableHead>
                    ))}
                    {previewConfig.columns.length > 8 && (
                      <TableHead className="text-xs">+{previewConfig.columns.length - 8} more</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 50).map((row, i) => (
                    <TableRow key={i}>
                      {previewConfig.columns.slice(0, 8).map((col) => (
                        <TableCell key={col.key} className="text-xs max-w-[200px] truncate">
                          {typeof row[col.key] === "number"
                            ? row[col.key].toLocaleString("fr-FR")
                            : String(row[col.key] ?? "—")}
                        </TableCell>
                      ))}
                      {previewConfig.columns.length > 8 && (
                        <TableCell className="text-xs text-muted-foreground">…</TableCell>
                      )}
                    </TableRow>
                  ))}
                  {previewData.length > 50 && (
                    <TableRow>
                      <TableCell colSpan={Math.min(previewConfig.columns.length, 9)} className="text-center text-xs text-muted-foreground py-4">
                        Showing 50 of {previewData.length} rows. All rows will be included in the download.
                      </TableCell>
                    </TableRow>
                  )}
                  {previewConfig.isFinancialReport && previewData.length > 0 && (
                    <TableRow className="font-medium bg-muted/50">
                      <TableCell className="text-xs">TOTAL</TableCell>
                      <TableCell className="text-xs">{previewData.reduce((s, r) => s + r.bookings, 0)}</TableCell>
                      <TableCell className="text-xs">{previewData.reduce((s, r) => s + r.nights, 0)}</TableCell>
                      <TableCell className="text-xs">{previewData.reduce((s, r) => s + r.revenue, 0).toLocaleString("fr-FR")}</TableCell>
                      <TableCell className="text-xs">—</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            {!previewConfig?.isFinancialReport && (
              <Button variant="outline" onClick={handleDownloadCSV}>
                <Download size={14} className="mr-1" /> CSV
              </Button>
            )}
            <Button onClick={handleDownloadXLSX}>
              <FileSpreadsheet size={14} className="mr-1" />
              {previewConfig?.isFinancialReport ? "Download Report XLSX" : "Download XLSX"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminExportTab;
