import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Copy } from "lucide-react";

interface Property {
  id: string;
  name: string;
  price_per_night: number | null;
  weekend_price: number | null;
  cleaning_fee: number | null;
  tourist_tax_per_person: number | null;
  min_nights: number | null;
}

interface Season {
  id: string;
  property_id: string;
  name: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  min_nights: number | null;
  is_recurring: boolean | null;
}

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number | null;
  property_id: string | null;
  active: boolean | null;
}

const emptySeasonDefaults = (): Partial<Season> & { property_id: string } => ({
  property_id: "",
  name: "",
  start_date: "",
  end_date: "",
  price_per_night: undefined as unknown as number,
  min_nights: undefined as unknown as number,
  is_recurring: false,
});

const checkOverlap = async (propertyId: string, startDate: string, endDate: string, excludeId?: string) => {
  const { data: existingSeasons } = await supabase
    .from("seasonal_pricing")
    .select("id, name, start_date, end_date")
    .eq("property_id", propertyId);

  if (!existingSeasons) return null;

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  for (const season of existingSeasons) {
    if (excludeId && season.id === excludeId) continue;
    const existingStart = new Date(season.start_date);
    const existingEnd = new Date(season.end_date);

    if (
      (newStart >= existingStart && newStart <= existingEnd) ||
      (newEnd >= existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      return season.name;
    }
  }
  return null;
};

const AdminPricingPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPrices, setEditPrices] = useState<Record<string, Partial<Property>>>({});

  // Season dialog
  const [seasonDialog, setSeasonDialog] = useState(false);
  const [editSeason, setEditSeason] = useState<Partial<Season> & { property_id: string }>(emptySeasonDefaults());

  // Duplicate dialog
  const [dupDialog, setDupDialog] = useState(false);
  const [dupSource, setDupSource] = useState<Season | null>(null);
  const [dupYears, setDupYears] = useState<number[]>([1]);
  const [dupTargetPropertyIds, setDupTargetPropertyIds] = useState<string[]>([]);

  // Seasonal filter
  const [seasonFilter, setSeasonFilter] = useState<string>("all");

  // Multi-period date ranges for season creation
  const [seasonDateRanges, setSeasonDateRanges] = useState<{ start: string; end: string }[]>([{ start: "", end: "" }]);

  // Promo dialog
  const [promoDialog, setPromoDialog] = useState(false);
  const [editPromo, setEditPromo] = useState<Partial<PromoCode>>({});

  const loadAll = async () => {
    const [pRes, sRes, prRes] = await Promise.all([
      supabase.from("properties").select("id, name, price_per_night, weekend_price, cleaning_fee, tourist_tax_per_person, min_nights").order("display_order"),
      supabase.from("seasonal_pricing").select("*").order("start_date"),
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    ]);
    setProperties(pRes.data || []);
    setSeasons(sRes.data || []);
    setPromos(prRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleBaseChange = (propId: string, field: string, value: string) => {
    setEditPrices((prev) => ({
      ...prev,
      [propId]: { ...prev[propId], [field]: value === "" ? null : parseFloat(value) },
    }));
  };

  const saveBase = async (propId: string) => {
    const updates = editPrices[propId];
    if (!updates) return;
    const { error } = await supabase.from("properties").update(updates).eq("id", propId);
    if (error) { toast.error(error.message); return; }
    toast.success("Prices saved");
    loadAll();
    setEditPrices((prev) => { const n = { ...prev }; delete n[propId]; return n; });
  };

  const saveSeason = async () => {
    const s = editSeason;
    const ranges = seasonDateRanges.filter((r) => r.start && r.end);
    if (!s.property_id || !s.name || !s.price_per_night || ranges.length === 0) {
      toast.error("Fill all required fields (name, price, at least one date range)"); return;
    }

    const basePayload = {
      name: s.name,
      price_per_night: Number(s.price_per_night),
      min_nights: s.min_nights ? Number(s.min_nights) : null,
      is_recurring: s.is_recurring ?? false,
    };

    if (s.id) {
      // Edit mode: update with first range only
      const overlap = await checkOverlap(s.property_id, ranges[0].start, ranges[0].end, s.id);
      if (overlap) { toast.error(`Dates overlap with "${overlap}".`); return; }
      const { error } = await supabase.from("seasonal_pricing").update({ ...basePayload, start_date: ranges[0].start, end_date: ranges[0].end }).eq("id", s.id);
      if (error) { toast.error(error.message); return; }
    } else {
      // Create mode: insert all ranges
      const inserts = [];
      const errors: string[] = [];
      for (const r of ranges) {
        const overlap = await checkOverlap(s.property_id, r.start, r.end);
        if (overlap) { errors.push(`${r.start}→${r.end}: conflit avec "${overlap}"`); continue; }
        inserts.push({ ...basePayload, property_id: s.property_id, start_date: r.start, end_date: r.end });
      }
      if (inserts.length > 0) {
        const { error } = await supabase.from("seasonal_pricing").insert(inserts);
        if (error) { toast.error(error.message); return; }
      }
      if (errors.length > 0) toast.error(errors.join(" · "));
      if (inserts.length === 0) return;
    }
    toast.success("Season saved");
    setSeasonDialog(false);
    loadAll();
  };

  const deleteSeason = async (id: string) => {
    if (!confirm("Delete this season?")) return;
    await supabase.from("seasonal_pricing").delete().eq("id", id);
    toast.success("Deleted");
    loadAll();
  };

  const openDuplicateDialog = (s: Season) => {
    setDupSource(s);
    setDupYears([0]);
    setDupTargetPropertyIds([]);
    setDupDialog(true);
  };

  const executeDuplicate = async () => {
    if (!dupSource || (dupYears.length === 0 && dupTargetPropertyIds.length === 0)) return;

    const targetPropIds = dupTargetPropertyIds.length > 0
      ? dupTargetPropertyIds
      : [dupSource.property_id];
    const yearOffsets = dupYears.length > 0 ? dupYears : [0];

    const inserts = [];
    const errors: string[] = [];

    for (const propId of targetPropIds) {
      for (const yearOffset of yearOffsets) {
        // Skip duplicating same property + same year (0 offset on source property)
        if (propId === dupSource.property_id && yearOffset === 0) continue;

        const startDate = new Date(dupSource.start_date);
        const endDate = new Date(dupSource.end_date);
        startDate.setFullYear(startDate.getFullYear() + yearOffset);
        endDate.setFullYear(endDate.getFullYear() + yearOffset);
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];

        const overlap = await checkOverlap(propId, startStr, endStr);
        if (overlap) {
          const propName = properties.find((p) => p.id === propId)?.name || "?";
          errors.push(`${propName} +${yearOffset}y: conflit avec "${overlap}"`);
          continue;
        }

        inserts.push({
          property_id: propId,
          name: dupSource.name,
          start_date: startStr,
          end_date: endStr,
          price_per_night: dupSource.price_per_night,
          min_nights: dupSource.min_nights,
          is_recurring: dupSource.is_recurring ?? false,
        });
      }
    }

    if (inserts.length > 0) {
      const { error } = await supabase.from("seasonal_pricing").insert(inserts);
      if (error) { toast.error(error.message); return; }
      toast.success(`${inserts.length} période(s) créée(s)`);
    }
    if (errors.length > 0) {
      toast.error(errors.join(" · "));
    }

    setDupDialog(false);
    loadAll();
  };

  const savePromo = async () => {
    const p = editPromo;
    if (!p.code) { toast.error("Code is required"); return; }
    if (p.id) {
      const { error } = await supabase.from("promo_codes").update({
        code: p.code, discount_percent: p.discount_percent, discount_amount: p.discount_amount,
        valid_from: p.valid_from, valid_until: p.valid_until, max_uses: p.max_uses,
        property_id: p.property_id, active: p.active ?? true,
      }).eq("id", p.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("promo_codes").insert({
        code: p.code!, discount_percent: p.discount_percent, discount_amount: p.discount_amount,
        valid_from: p.valid_from, valid_until: p.valid_until, max_uses: p.max_uses,
        property_id: p.property_id || null, active: p.active ?? true,
      });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Promo code saved");
    setPromoDialog(false);
    loadAll();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    toast.success("Deleted");
    loadAll();
  };

  const togglePromoActive = async (id: string, active: boolean) => {
    await supabase.from("promo_codes").update({ active: !active }).eq("id", id);
    loadAll();
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Pricing</h1>
      <Tabs defaultValue="base">
        <TabsList>
          <TabsTrigger value="base">Base Pricing</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="smart">Smart Pricing</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
        </TabsList>

        {/* Base Pricing */}
        <TabsContent value="base" className="space-y-4 mt-4">
          {properties.map((p) => {
            const edits = editPrices[p.id] || {};
            const val = (field: keyof Property) => (edits[field] !== undefined ? String(edits[field] ?? "") : String(p[field] ?? ""));
            return (
              <Card key={p.id}>
                <CardHeader><CardTitle className="text-base font-display">{p.name}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      ["price_per_night", "Price/night (€)"],
                      ["weekend_price", "Weekend (€)"],
                      ["cleaning_fee", "Cleaning (€)"],
                      ["tourist_tax_per_person", "Tax/person (€)"],
                      ["min_nights", "Min nights"],
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label className="text-xs text-muted-foreground">{label}</label>
                        <Input
                          type="number"
                          value={val(field as keyof Property)}
                          onChange={(e) => handleBaseChange(p.id, field, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => saveBase(p.id)} disabled={!editPrices[p.id]}>Save</Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Seasonal */}
        <TabsContent value="seasonal" className="mt-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => setSeasonFilter("all")}
              className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                seasonFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-accent"
              }`}
            >
              Toutes
            </button>
            {properties.map((p) => (
              <button
                key={p.id}
                onClick={() => setSeasonFilter(p.id)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  seasonFilter === p.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent"
                }`}
              >
                {p.name}
              </button>
            ))}
            <div className="ml-auto">
              <Button size="sm" onClick={() => { setEditSeason({ ...emptySeasonDefaults(), property_id: properties[0]?.id || "" }); setSeasonDateRanges([{ start: "", end: "" }]); setSeasonDialog(true); }}>
                <Plus size={14} className="mr-1" /> Add Season
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>€/night</TableHead>
                <TableHead>Min nights</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.filter((s) => seasonFilter === "all" || s.property_id === seasonFilter).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{properties.find((p) => p.id === s.property_id)?.name || "—"}</TableCell>
                  <TableCell className="text-sm">
                    <span>{s.name}</span>
                    {s.is_recurring && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-accent text-accent-foreground rounded">Recurring</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{s.start_date}</TableCell>
                  <TableCell className="text-sm">{s.end_date}</TableCell>
                  <TableCell className="text-sm">€{s.price_per_night}</TableCell>
                  <TableCell className="text-sm">{s.min_nights || 1}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" title="Dupliquer sur plusieurs périodes" onClick={() => openDuplicateDialog(s)}><Copy size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditSeason(s); setSeasonDateRanges([{ start: s.start_date, end: s.end_date }]); setSeasonDialog(true); }}><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteSeason(s.id)}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {seasons.filter((s) => seasonFilter === "all" || s.property_id === seasonFilter).length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No seasonal pricing configured</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Smart Pricing */}
        <TabsContent value="smart" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="font-display text-lg text-foreground mb-2">Smart Pricing — Coming Soon</p>
              <p className="text-sm text-muted-foreground">Automatic price suggestions based on occupancy, demand, and seasonality.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promo Codes */}
        <TabsContent value="promos" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => { setEditPromo({ code: "", active: true }); setPromoDialog(true); }}>
              <Plus size={14} className="mr-1" /> Add Promo Code
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid</TableHead>
                <TableHead>Max Uses</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-mono">{p.code}</TableCell>
                  <TableCell className="text-sm">{p.discount_percent ? `${p.discount_percent}%` : p.discount_amount ? `€${p.discount_amount}` : "—"}</TableCell>
                  <TableCell className="text-sm">{p.valid_from || "—"} → {p.valid_until || "—"}</TableCell>
                  <TableCell className="text-sm">{p.max_uses ?? "∞"}</TableCell>
                  <TableCell className="text-sm">{p.current_uses || 0}</TableCell>
                  <TableCell>
                    <button onClick={() => togglePromoActive(p.id, !!p.active)} className={`text-xs px-2 py-0.5 ${p.active ? "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]" : "bg-muted text-muted-foreground"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditPromo(p); setPromoDialog(true); }}><Pencil size={14} /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deletePromo(p.id)}><Trash2 size={14} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {promos.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No promo codes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Season dialog */}
      <Dialog open={seasonDialog} onOpenChange={setSeasonDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editSeason.id ? "Edit Season" : "Add Season"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Property</label>
              <select className="w-full px-3 py-2 border border-border bg-background text-sm" value={editSeason.property_id} onChange={(e) => setEditSeason({ ...editSeason, property_id: e.target.value })}>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-muted-foreground">Season name</label><Input value={editSeason.name} onChange={(e) => setEditSeason({ ...editSeason, name: e.target.value })} /></div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Période(s) de dates</label>
              <div className="space-y-2">
                {seasonDateRanges.map((range, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input type="date" value={range.start} onChange={(e) => { const r = [...seasonDateRanges]; r[idx] = { ...r[idx], start: e.target.value }; setSeasonDateRanges(r); }} className="flex-1" />
                    <span className="text-xs text-muted-foreground">→</span>
                    <Input type="date" value={range.end} onChange={(e) => { const r = [...seasonDateRanges]; r[idx] = { ...r[idx], end: e.target.value }; setSeasonDateRanges(r); }} className="flex-1" />
                    {seasonDateRanges.length > 1 && (
                      <Button size="icon" variant="ghost" className="shrink-0" onClick={() => setSeasonDateRanges(seasonDateRanges.filter((_, i) => i !== idx))}><Trash2 size={14} /></Button>
                    )}
                  </div>
                ))}
                {!editSeason.id && (
                  <Button size="sm" variant="outline" onClick={() => setSeasonDateRanges([...seasonDateRanges, { start: "", end: "" }])}>
                    <Plus size={14} className="mr-1" /> Ajouter une période
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Price/night (€)</label><Input type="number" value={editSeason.price_per_night ?? ""} placeholder="e.g. 250" onChange={(e) => setEditSeason({ ...editSeason, price_per_night: e.target.value ? parseFloat(e.target.value) : undefined as unknown as number })} /></div>
              <div><label className="text-xs text-muted-foreground">Min nights</label><Input type="number" value={editSeason.min_nights ?? ""} placeholder="e.g. 2" onChange={(e) => setEditSeason({ ...editSeason, min_nights: e.target.value ? parseInt(e.target.value) : undefined as unknown as number })} /></div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">Repeat annually</p>
                <p className="text-xs text-muted-foreground">Automatically duplicate this season every year</p>
              </div>
              <Switch checked={editSeason.is_recurring ?? false} onCheckedChange={(checked) => setEditSeason({ ...editSeason, is_recurring: checked })} />
            </div>
            <Button onClick={saveSeason} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promo dialog */}
      <Dialog open={promoDialog} onOpenChange={setPromoDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editPromo.id ? "Edit Promo" : "Add Promo Code"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Code</label><Input value={editPromo.code || ""} onChange={(e) => setEditPromo({ ...editPromo, code: e.target.value.toUpperCase() })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Discount %</label><Input type="number" value={editPromo.discount_percent ?? ""} onChange={(e) => setEditPromo({ ...editPromo, discount_percent: e.target.value ? parseFloat(e.target.value) : null })} /></div>
              <div><label className="text-xs text-muted-foreground">Discount € (flat)</label><Input type="number" value={editPromo.discount_amount ?? ""} onChange={(e) => setEditPromo({ ...editPromo, discount_amount: e.target.value ? parseFloat(e.target.value) : null })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Valid from</label><Input type="date" value={editPromo.valid_from || ""} onChange={(e) => setEditPromo({ ...editPromo, valid_from: e.target.value || null })} /></div>
              <div><label className="text-xs text-muted-foreground">Valid until</label><Input type="date" value={editPromo.valid_until || ""} onChange={(e) => setEditPromo({ ...editPromo, valid_until: e.target.value || null })} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Max uses</label><Input type="number" value={editPromo.max_uses ?? ""} onChange={(e) => setEditPromo({ ...editPromo, max_uses: e.target.value ? parseInt(e.target.value) : null })} /></div>
            <div>
              <label className="text-xs text-muted-foreground">Property (optional)</label>
              <select className="w-full px-3 py-2 border border-border bg-background text-sm" value={editPromo.property_id || ""} onChange={(e) => setEditPromo({ ...editPromo, property_id: e.target.value || null })}>
                <option value="">All properties</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <Button onClick={savePromo} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Duplicate dialog */}
      <Dialog open={dupDialog} onOpenChange={setDupDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Dupliquer "{dupSource?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Période source : {dupSource?.start_date} → {dupSource?.end_date} · €{dupSource?.price_per_night}/nuit
            </p>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Aussi dupliquer vers d'autres propriétés</label>
              <div className="flex flex-wrap gap-2">
                {properties.filter((p) => p.id !== dupSource?.property_id).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setDupTargetPropertyIds((prev) => prev.includes(p.id) ? prev.filter((v) => v !== p.id) : [...prev, p.id])}
                    className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                      dupTargetPropertyIds.includes(p.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Décalage annuel</label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map((y) => (
                  <button
                    key={y}
                    onClick={() => setDupYears((prev) => prev.includes(y) ? prev.filter((v) => v !== y) : [...prev, y].sort())}
                    className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                      dupYears.includes(y)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {y === 0 ? "Mêmes dates" : `+${y} an${y > 1 ? "s" : ""}`}
                  </button>
                ))}
              </div>
            </div>
            {dupSource && (dupYears.length > 0 || dupTargetPropertyIds.length > 0) && (() => {
              const targetPropIds = dupTargetPropertyIds.length > 0 ? dupTargetPropertyIds : [dupSource.property_id];
              const yearOffsets = dupYears.length > 0 ? dupYears : [0];
              const previews: { propName: string; start: string; end: string }[] = [];
              for (const propId of targetPropIds) {
                for (const y of yearOffsets) {
                  if (propId === dupSource.property_id && y === 0) continue;
                  const s = new Date(dupSource.start_date);
                  const e = new Date(dupSource.end_date);
                  s.setFullYear(s.getFullYear() + y);
                  e.setFullYear(e.getFullYear() + y);
                  previews.push({ propName: properties.find((p) => p.id === propId)?.name || "?", start: s.toISOString().split("T")[0], end: e.toISOString().split("T")[0] });
                }
              }
              if (previews.length === 0) return null;
              return (
                <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                  <p className="font-medium text-foreground text-sm">{previews.length} période(s) à créer :</p>
                  {previews.map((p, i) => <p key={i}>{p.propName} : {p.start} → {p.end}</p>)}
                </div>
              );
            })()}
            <Button onClick={executeDuplicate} className="w-full" disabled={
              (() => {
                const targetPropIds = dupTargetPropertyIds.length > 0 ? dupTargetPropertyIds : [dupSource?.property_id || ""];
                const yearOffsets = dupYears.length > 0 ? dupYears : [0];
                return targetPropIds.every((pid) => yearOffsets.every((y) => pid === dupSource?.property_id && y === 0));
              })()
            }>
              Dupliquer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPricingPage;
