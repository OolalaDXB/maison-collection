import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Save } from "lucide-react";

interface ReviewRow {
  id: string;
  property_id: string;
  guest_name: string;
  guest_location: string | null;
  rating: number;
  review_text: string;
  stay_date: string | null;
}

interface PropertyOption { id: string; name: string; }

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProp, setFilterProp] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [rRes, pRes] = await Promise.all([
      supabase.from("reviews").select("*").order("stay_date", { ascending: false }),
      supabase.from("properties").select("id, name").order("display_order"),
    ]);
    setReviews(rRes.data || []);
    setProperties(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const propName = (id: string) => properties.find((p) => p.id === id)?.name || "—";

  const filtered = filterProp ? reviews.filter((r) => r.property_id === filterProp) : reviews;

  const openNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      property_id: properties[0]?.id || "",
      guest_name: "",
      guest_location: null,
      rating: 5,
      review_text: "",
      stay_date: null,
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const isNew = !reviews.find((r) => r.id === editing.id);
    const { id, ...rest } = editing;
    let error;
    if (isNew) {
      ({ error } = await supabase.from("reviews").insert(rest as any));
    } else {
      ({ error } = await supabase.from("reviews").update(rest as any).eq("id", id));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Review saved");
    setEditDialog(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    toast.success("Deleted");
    loadData();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Reviews</h1>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> Add Review</Button>
      </div>

      <div className="mb-4">
        <select className="px-3 py-2 border border-border bg-background text-sm" value={filterProp} onChange={(e) => setFilterProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
          ) : filtered.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reviews</TableCell></TableRow>
          ) : filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-sm">
                <p className="font-medium">{r.guest_name}</p>
                {r.guest_location && <p className="text-xs text-muted-foreground">{r.guest_location}</p>}
              </TableCell>
              <TableCell className="text-sm">{propName(r.property_id)}</TableCell>
              <TableCell className="text-sm text-primary">{"★".repeat(r.rating)}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{r.review_text}</TableCell>
              <TableCell className="text-sm">{r.stay_date || "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setEditDialog(true); }}><Pencil size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing && reviews.find((r) => r.id === editing.id) ? "Edit Review" : "Add Review"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Property</label>
                <select className="w-full px-3 py-2 border border-border bg-background text-sm" value={editing.property_id} onChange={(e) => setEditing({ ...editing, property_id: e.target.value })}>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Guest Name</label><Input value={editing.guest_name} onChange={(e) => setEditing({ ...editing, guest_name: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Location</label><Input value={editing.guest_location || ""} onChange={(e) => setEditing({ ...editing, guest_location: e.target.value || null })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Rating (1-5)</label><Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)) })} /></div>
                <div><label className="text-xs text-muted-foreground">Stay Date</label><Input type="date" value={editing.stay_date || ""} onChange={(e) => setEditing({ ...editing, stay_date: e.target.value || null })} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground">Review Text</label><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y min-h-[80px]" value={editing.review_text} onChange={(e) => setEditing({ ...editing, review_text: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
