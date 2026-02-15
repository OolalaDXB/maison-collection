import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Loader2, FileSpreadsheet, CalendarDays, Home, Star, Users, CreditCard } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  fetch: () => Promise<any[]>;
  columns: { key: string; label: string }[];
}

const EXPORT_CONFIGS: ExportConfig[] = [
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
  const [previewConfig, setPreviewConfig] = useState<ExportConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePreview = async (config: ExportConfig) => {
    setLoading(config.key);
    try {
      const data = await config.fetch();
      setPreviewData(data);
      setPreviewConfig(config);
      setDialogOpen(true);
    } catch (err: any) {
      toast.error(`Error loading ${config.label}: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadXLSX = () => {
    if (!previewData || !previewConfig) return;

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

    // Auto-width columns
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
          <Card key={config.key} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted">{config.icon}</div>
                <div>
                  <h3 className="font-display text-sm font-medium">{config.label}</h3>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePreview(config)}
                  disabled={loading === config.key}
                  className="flex-1"
                >
                  {loading === config.key ? (
                    <Loader2 className="animate-spin mr-1" size={14} />
                  ) : (
                    <Download size={14} className="mr-1" />
                  )}
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadTemplate(config)}
                  title="Download empty XLS template"
                >
                  <FileSpreadsheet size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display">
              {previewConfig?.label} — {previewData?.length || 0} rows
            </DialogTitle>
            <DialogDescription>
              Preview your data before downloading. Choose XLSX or CSV format.
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
                          {String(row[col.key] ?? "—")}
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
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download size={14} className="mr-1" /> CSV
            </Button>
            <Button onClick={handleDownloadXLSX}>
              <FileSpreadsheet size={14} className="mr-1" /> Download XLSX
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminExportTab;
