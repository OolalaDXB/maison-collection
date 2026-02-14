import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  type: string | null;
  status: string | null;
  property_id: string | null;
  created_at: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  booking: "bg-[hsl(210,60%,92%)] text-[hsl(210,60%,30%)]",
  management: "bg-[hsl(280,40%,92%)] text-[hsl(280,40%,30%)]",
  partnership: "bg-[hsl(160,40%,92%)] text-[hsl(160,40%,30%)]",
  general: "bg-muted text-muted-foreground",
  waitlist: "bg-[hsl(30,60%,92%)] text-[hsl(30,60%,30%)]",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-[hsl(210,60%,92%)] text-[hsl(210,60%,30%)]",
  read: "bg-muted text-muted-foreground",
  replied: "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]",
  archived: "bg-[hsl(0,0%,92%)] text-[hsl(0,0%,40%)]",
};

const AdminInquiriesPage = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    const { data } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    setInquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Status → ${status}`);
      setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
    }
  };

  const filtered = inquiries.filter((i) => {
    if (filterType && i.type !== filterType) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl">Inquiries</h1>
        {newCount > 0 && <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground">{newCount} new</span>}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="px-3 py-2 border border-border bg-background text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {["booking", "management", "partnership", "general", "waitlist"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="px-3 py-2 border border-border bg-background text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {["new", "read", "replied", "archived"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No inquiries yet</TableCell></TableRow>
          ) : filtered.map((inq) => (
            <>
              <TableRow key={inq.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}>
                <TableCell className="text-sm">{inq.created_at ? new Date(inq.created_at).toLocaleDateString() : "—"}</TableCell>
                <TableCell className="text-sm font-medium">{inq.name}</TableCell>
                <TableCell className="text-sm">{inq.email}</TableCell>
                <TableCell><span className={`text-[0.65rem] px-2 py-0.5 uppercase tracking-wider ${TYPE_COLORS[inq.type || ""] || "bg-muted text-muted-foreground"}`}>{inq.type}</span></TableCell>
                <TableCell><span className={`text-[0.65rem] px-2 py-0.5 uppercase tracking-wider ${STATUS_COLORS[inq.status || ""] || "bg-muted text-muted-foreground"}`}>{inq.status}</span></TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{inq.message || "—"}</TableCell>
              </TableRow>
              {expandedId === inq.id && (
                <TableRow key={`${inq.id}-detail`}>
                  <TableCell colSpan={6} className="bg-muted/20 p-4">
                    <div className="space-y-3">
                      {inq.phone && <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {inq.phone}</p>}
                      {inq.subject && <p className="text-sm"><span className="text-muted-foreground">Subject:</span> {inq.subject}</p>}
                      <p className="text-sm">{inq.message || "No message"}</p>
                      <div className="flex gap-2 pt-2">
                        {["new", "read", "replied", "archived"].map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); updateStatus(inq.id, s); }}
                            className={`text-xs px-3 py-1 border transition-colors ${inq.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </AdminLayout>
  );
};

export default AdminInquiriesPage;
