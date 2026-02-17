import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, Search } from "lucide-react";
import jsPDF from "jspdf";

interface ContractRow {
  id: string;
  booking_id: string;
  contract_html: string;
  signature_url: string | null;
  accepted_at: string | null;
  created_at: string | null;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  property_id: string;
  property_name: string;
}

const AdminContractsPage = () => {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProp, setFilterProp] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [cRes, pRes] = await Promise.all([
        supabase
          .from("booking_contracts")
          .select("id, booking_id, contract_html, signature_url, accepted_at, created_at, bookings(guest_name, guest_email, check_in, check_out, property_id)")
          .not("accepted_at", "is", null)
          .order("accepted_at", { ascending: false }),
        supabase.from("properties").select("id, name").order("display_order"),
      ]);
      const props = pRes.data || [];
      setProperties(props);
      const propMap = Object.fromEntries(props.map((p) => [p.id, p.name]));
      const rows: ContractRow[] = (cRes.data || []).map((c: any) => {
        const b = c.bookings || {};
        return {
          id: c.id,
          booking_id: c.booking_id,
          contract_html: c.contract_html,
          signature_url: c.signature_url,
          accepted_at: c.accepted_at,
          created_at: c.created_at,
          guest_name: b.guest_name || "—",
          guest_email: b.guest_email || "",
          check_in: b.check_in || "",
          check_out: b.check_out || "",
          property_id: b.property_id || "",
          property_name: propMap[b.property_id] || "—",
        };
      });
      setContracts(rows);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = contracts.filter((c) => {
    if (filterProp && c.property_id !== filterProp) return false;
    if (dateFrom && c.accepted_at && c.accepted_at < dateFrom) return false;
    if (dateTo && c.accepted_at && c.accepted_at > dateTo + "T23:59:59") return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.guest_name.toLowerCase().includes(q) && !c.guest_email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const downloadPdf = async (c: ContractRow) => {
    setGeneratingId(c.id);
    try {
      const refCode = `BOOK-${c.booking_id.slice(0, 8).toUpperCase()}`;
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
      if (c.accepted_at) {
        pdf.text(`Signé le: ${new Date(c.accepted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin, y);
      }
      y += 10;

      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(10);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = c.contract_html;
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
      pdf.text(c.guest_name, margin, y);
      y += 8;

      if (c.signature_url) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = c.signature_url!; });
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
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Contracts</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="px-3 py-2 border border-border bg-background text-sm" value={filterProp} onChange={(e) => setFilterProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Input type="date" className="w-36 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
        <Input type="date" className="w-36 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
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
            <TableHead>Stay</TableHead>
            <TableHead>Signed</TableHead>
            <TableHead>Signature</TableHead>
            <TableHead className="text-right">PDF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No signed contracts found</TableCell></TableRow>
          ) : filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="text-sm font-medium">{c.guest_name}</div>
                <div className="text-xs text-muted-foreground">{c.guest_email}</div>
              </TableCell>
              <TableCell className="text-sm">{c.property_name}</TableCell>
              <TableCell className="text-sm">{c.check_in} → {c.check_out}</TableCell>
              <TableCell className="text-sm">
                {c.accepted_at ? new Date(c.accepted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </TableCell>
              <TableCell>
                {c.signature_url ? (
                  <img src={c.signature_url} alt="Signature" className="h-8 w-auto bg-white border border-border rounded" />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => downloadPdf(c)} disabled={generatingId === c.id}>
                  {generatingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <><Download size={14} className="mr-1" /> PDF</>}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default AdminContractsPage;
