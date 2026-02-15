import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useFxRates } from "@/hooks/useFxRates";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SEO from "@/components/SEO";

interface Property {
  id: string;
  name: string;
}

interface LedgerEntry {
  id: string;
  property_id: string;
  booking_id: string | null;
  entry_type: string;
  category: string;
  amount: number;
  currency: string;
  amount_eur: number | null;
  description: string;
  reference: string | null;
  counterparty: string | null;
  entry_date: string;
  source: string;
}

const CURRENCIES = ["EUR", "USD", "AED", "GEL", "GBP"] as const;

const INCOME_CATEGORIES = [
  "platform_payout", "direct_payment", "security_deposit_return", "other_income",
];
const EXPENSE_CATEGORIES = [
  "platform_commission", "fx_fee", "bank_fee", "transfer_fee", "cleaning", "laundry",
  "maintenance", "repair", "supplies", "utilities", "internet", "insurance",
  "tax_income", "tax_property", "tax_tourist", "management_fee", "accounting",
  "legal", "marketing", "photography", "software", "key_handover", "welcome_basket", "other_expense",
];

const CATEGORY_LABELS: Record<string, string> = {
  platform_payout: "Platform Payout",
  direct_payment: "Direct Payment",
  security_deposit_return: "Security Deposit Return",
  other_income: "Other Income",
  platform_commission: "Platform Commission",
  fx_fee: "FX Fee",
  bank_fee: "Bank Fee",
  transfer_fee: "Transfer Fee",
  cleaning: "Cleaning",
  laundry: "Laundry",
  maintenance: "Maintenance",
  repair: "Repair",
  supplies: "Supplies",
  utilities: "Utilities",
  internet: "Internet",
  insurance: "Insurance",
  tax_income: "Income Tax",
  tax_property: "Property Tax",
  tax_tourist: "Tourist Tax",
  management_fee: "Management Fee",
  accounting: "Accounting",
  legal: "Legal",
  marketing: "Marketing",
  photography: "Photography",
  software: "Software",
  key_handover: "Key Handover",
  welcome_basket: "Welcome Basket",
  other_expense: "Other Expense",
};

const AdminFinancePage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-12-31`;
  });
  const [filterProp, setFilterProp] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [currency, setCurrency] = useState<string>("EUR");
  const { convertFromEur, formatPrice } = useFxRates();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    property_id: "",
    entry_type: "expense" as "income" | "expense",
    category: "",
    amount: "",
    currency: "EUR",
    fx_rate: "",
    amount_eur: "",
    entry_date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
    counterparty: "",
    receipt_url: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const [pRes, lRes] = await Promise.all([
      supabase.from("properties").select("id, name").order("display_order"),
      supabase.from("ledger_entries" as any).select("*").gte("entry_date", dateFrom).lte("entry_date", dateTo).order("entry_date", { ascending: false }),
    ]);
    setProperties(pRes.data || []);
    setLedger((lRes.data as unknown as LedgerEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  const propMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

  const conv = (eur: number) => currency === "EUR" ? eur : convertFromEur(eur, currency);
  const fmt = (amount: number) => formatPrice(Math.round(amount), currency);

  // Filtered ledger
  const filtered = useMemo(() => {
    return ledger.filter(e => {
      if (filterProp && e.property_id !== filterProp) return false;
      if (filterCat && e.category !== filterCat) return false;
      return true;
    });
  }, [ledger, filterProp, filterCat]);

  // KPIs
  const totalIncome = useMemo(() => filtered.filter(e => e.entry_type === "income").reduce((s, e) => s + (e.amount_eur || e.amount), 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(e => e.entry_type === "expense").reduce((s, e) => s + (e.amount_eur || e.amount), 0), [filtered]);
  const netProfit = totalIncome - totalExpense;

  // Revenue by property (horizontal bars)
  const propRevenue = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(e => e.entry_type === "income").forEach(e => {
      map.set(e.property_id, (map.get(e.property_id) || 0) + (e.amount_eur || e.amount));
    });
    return Array.from(map.entries())
      .map(([pid, total]) => ({ name: propMap.get(pid) || "—", total: Math.round(conv(total)) }))
      .sort((a, b) => b.total - a.total);
  }, [filtered, propMap, currency, convertFromEur]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    filtered.forEach(e => {
      const month = e.entry_date.slice(0, 7);
      if (!map.has(month)) map.set(month, { income: 0, expenses: 0 });
      const entry = map.get(month)!;
      const amt = e.amount_eur || e.amount;
      if (e.entry_type === "income") entry.income += amt;
      else entry.expenses += amt;
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        Income: Math.round(conv(data.income)),
        Expenses: Math.round(conv(data.expenses)),
      }));
  }, [filtered, currency, convertFromEur]);

  // Auto-calc amount_eur
  const updateAmountEur = (amt: string, fxRate: string) => {
    if (amt && fxRate && parseFloat(fxRate) > 0) {
      setForm(prev => ({ ...prev, amount: amt, fx_rate: fxRate, amount_eur: String(Math.round(parseFloat(amt) / parseFloat(fxRate) * 100) / 100) }));
    } else if (form.currency === "EUR") {
      setForm(prev => ({ ...prev, amount: amt, fx_rate: fxRate, amount_eur: amt }));
    } else {
      setForm(prev => ({ ...prev, amount: amt, fx_rate: fxRate }));
    }
  };

  const handleSave = async () => {
    if (!form.property_id || !form.category || !form.amount || !form.description) {
      toast.error("Fill in required fields");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("ledger_entries" as any).insert({
      property_id: form.property_id,
      entry_type: form.entry_type,
      category: form.category,
      amount: parseFloat(form.amount),
      currency: form.currency,
      fx_rate: form.fx_rate ? parseFloat(form.fx_rate) : null,
      amount_eur: form.amount_eur ? parseFloat(form.amount_eur) : (form.currency === "EUR" ? parseFloat(form.amount) : null),
      entry_date: form.entry_date,
      description: form.description,
      reference: form.reference || null,
      counterparty: form.counterparty || null,
      receipt_url: form.receipt_url || null,
      source: "manual",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Entry added");
    setModalOpen(false);
    setForm({ property_id: "", entry_type: "expense", category: "", amount: "", currency: "EUR", fx_rate: "", amount_eur: "", entry_date: new Date().toISOString().split("T")[0], description: "", reference: "", counterparty: "", receipt_url: "" });
    fetchData();
  };

  const exportLedgerCSV = () => {
    const rows = [["Date", "Property", "Type", "Category", "Description", "Amount", "Currency", "Amount EUR", "Reference", "Counterparty", "Source"]];
    filtered.forEach(e => {
      rows.push([e.entry_date, propMap.get(e.property_id) || "", e.entry_type, CATEGORY_LABELS[e.category] || e.category, e.description, String(e.amount), e.currency, String(e.amount_eur || ""), e.reference || "", e.counterparty || "", e.source]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSummaryCSV = () => {
    const rows = [["Property", `Income (${currency})`, `Expenses (${currency})`, `Net (${currency})`]];
    const propTotals = new Map<string, { income: number; expenses: number }>();
    filtered.forEach(e => {
      if (!propTotals.has(e.property_id)) propTotals.set(e.property_id, { income: 0, expenses: 0 });
      const t = propTotals.get(e.property_id)!;
      const amt = e.amount_eur || e.amount;
      if (e.entry_type === "income") t.income += amt; else t.expenses += amt;
    });
    propTotals.forEach((t, pid) => {
      rows.push([propMap.get(pid) || "", String(Math.round(conv(t.income))), String(Math.round(conv(t.expenses))), String(Math.round(conv(t.income - t.expenses)))]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-summary-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = form.entry_type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <AdminLayout>
      <SEO title="Finance — Admin" description="" path="/admin/finance" noindex />
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl">Finance</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Revenue, expenses & ledger</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Input type="date" className="w-36 text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span className="text-muted-foreground text-sm">→</span>
            <Input type="date" className="w-36 text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-border bg-background text-sm h-9 font-body" value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[hsl(36,15%,90%)] border-l-2 border-l-primary">
              <CardContent className="pt-6 relative overflow-hidden">
                <DollarSign size={32} className="absolute top-4 right-4 text-primary opacity-[0.12]" />
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground font-body mb-1">Total Revenue</p>
                <p className="text-3xl font-display">{loading ? "…" : fmt(conv(totalIncome))}</p>
              </CardContent>
            </Card>
            <Card className="border-[hsl(36,15%,90%)] border-l-2 border-l-[hsl(0,50%,55%)]">
              <CardContent className="pt-6 relative overflow-hidden">
                <TrendingDown size={32} className="absolute top-4 right-4 text-[hsl(0,50%,55%)] opacity-[0.12]" />
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground font-body mb-1">Total Expenses</p>
                <p className="text-3xl font-display">{loading ? "…" : fmt(conv(totalExpense))}</p>
              </CardContent>
            </Card>
            <Card className="border-[hsl(36,15%,90%)] border-l-2 border-l-[hsl(120,35%,45%)]">
              <CardContent className="pt-6 relative overflow-hidden">
                <TrendingUp size={32} className="absolute top-4 right-4 text-[hsl(120,35%,45%)] opacity-[0.12]" />
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground font-body mb-1">Net Profit</p>
                <p className={`text-3xl font-display ${netProfit < 0 ? "text-[hsl(0,50%,55%)]" : ""}`}>{loading ? "…" : fmt(conv(netProfit))}</p>
              </CardContent>
            </Card>
            <Card className="border-[hsl(36,15%,90%)] border-l-2 border-l-[hsl(210,50%,50%)]">
              <CardContent className="pt-6 relative overflow-hidden">
                <Calendar size={32} className="absolute top-4 right-4 text-[hsl(210,50%,50%)] opacity-[0.12]" />
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground font-body mb-1">Entries</p>
                <p className="text-3xl font-display">{loading ? "…" : filtered.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by property */}
          {propRevenue.length > 0 && (
            <Card className="border-[hsl(36,15%,90%)]">
              <CardHeader><CardTitle className="text-base font-display">Revenue by Property</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(120, propRevenue.length * 50)}>
                  <BarChart data={propRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="total" fill="hsl(7,41%,56%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Monthly trend */}
          {monthlyTrend.length > 0 && (
            <Card className="border-[hsl(36,15%,90%)]">
              <CardHeader><CardTitle className="text-base font-display">Monthly Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Line type="monotone" dataKey="Income" stroke="hsl(7,41%,56%)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Expenses" stroke="hsl(0,50%,55%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: LEDGER */}
        <TabsContent value="ledger" className="mt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 border border-border bg-background text-sm h-9 font-body" value={filterProp} onChange={e => setFilterProp(e.target.value)}>
                <option value="">All properties</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="px-3 py-2 border border-border bg-background text-sm h-9 font-body" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="">All categories</option>
                {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <Button size="sm" onClick={() => { setForm(prev => ({ ...prev, property_id: properties[0]?.id || "" })); setModalOpen(true); }}>
              <Plus size={14} className="mr-1" /> Add entry
            </Button>
          </div>

          <Card className="border-[hsl(36,15%,90%)]">
            <CardContent className="p-0">
              <Table className="admin-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Income</TableHead>
                    <TableHead className="text-right">Expense</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No entries</TableCell></TableRow>
                  ) : (
                    filtered.map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs">{e.entry_date}</TableCell>
                        <TableCell className="text-xs font-display">{propMap.get(e.property_id) || "—"}</TableCell>
                        <TableCell className="text-xs">
                          <span className={`px-2 py-0.5 ${e.entry_type === "income" ? "bg-[hsl(120,35%,95%)] text-[hsl(120,40%,30%)]" : "bg-[hsl(0,45%,94%)] text-[hsl(0,50%,35%)]"}`}>
                            {CATEGORY_LABELS[e.category] || e.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{e.description}</TableCell>
                        <TableCell className="text-sm text-right text-[hsl(120,40%,35%)]">
                          {e.entry_type === "income" ? fmt(conv(e.amount_eur || e.amount)) : ""}
                        </TableCell>
                        <TableCell className="text-sm text-right text-[hsl(0,50%,45%)]">
                          {e.entry_type === "expense" ? fmt(conv(e.amount_eur || e.amount)) : ""}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: EXPORT */}
        <TabsContent value="export" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[hsl(36,15%,90%)]">
              <CardHeader><CardTitle className="text-base font-display">Export Ledger</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Download all ledger entries for the selected date range as CSV.</p>
                <p className="text-xs text-muted-foreground">{filtered.length} entries from {dateFrom} to {dateTo}</p>
                <Button variant="outline" onClick={exportLedgerCSV} disabled={loading || filtered.length === 0}>
                  <Download size={14} className="mr-2" /> Export Ledger CSV
                </Button>
              </CardContent>
            </Card>
            <Card className="border-[hsl(36,15%,90%)]">
              <CardHeader><CardTitle className="text-base font-display">Export Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Download a summary by property with income, expenses, and net profit.</p>
                <Button variant="outline" onClick={exportSummaryCSV} disabled={loading || filtered.length === 0}>
                  <Download size={14} className="mr-2" /> Export Summary CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add entry modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Add Ledger Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Property *</label>
                <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={form.property_id} onChange={e => setForm(prev => ({ ...prev, property_id: e.target.value }))}>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Type *</label>
                <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={form.entry_type} onChange={e => setForm(prev => ({ ...prev, entry_type: e.target.value as any, category: "" }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Category *</label>
              <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>
                <option value="">Select…</option>
                {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Amount *</label>
                <Input type="number" value={form.amount} onChange={e => updateAmountEur(e.target.value, form.fx_rate)} placeholder="0.00" />
              </div>
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Currency</label>
                <select className="w-full px-3 py-2 border border-border bg-background text-sm h-9" value={form.currency} onChange={e => { setForm(prev => ({ ...prev, currency: e.target.value })); updateAmountEur(form.amount, form.fx_rate); }}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">FX Rate</label>
                <Input type="number" value={form.fx_rate} onChange={e => updateAmountEur(form.amount, e.target.value)} placeholder="1.00" step="0.0001" />
              </div>
            </div>
            {form.currency !== "EUR" && (
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Amount EUR</label>
                <Input type="number" value={form.amount_eur} onChange={e => setForm(prev => ({ ...prev, amount_eur: e.target.value }))} placeholder="Auto-calc" />
              </div>
            )}
            <div>
              <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Date *</label>
              <Input type="date" value={form.entry_date} onChange={e => setForm(prev => ({ ...prev, entry_date: e.target.value }))} />
            </div>
            <div>
              <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Description *</label>
              <Input value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="e.g. Monthly cleaning service" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Reference</label>
                <Input value={form.reference} onChange={e => setForm(prev => ({ ...prev, reference: e.target.value }))} placeholder="Invoice #" />
              </div>
              <div>
                <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Counterparty</label>
                <Input value={form.counterparty} onChange={e => setForm(prev => ({ ...prev, counterparty: e.target.value }))} placeholder="Vendor name" />
              </div>
            </div>
            <div>
              <label className="font-body text-[0.75rem] uppercase tracking-wide text-muted-foreground mb-1 block">Receipt URL</label>
              <Input value={form.receipt_url} onChange={e => setForm(prev => ({ ...prev, receipt_url: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="animate-spin mr-2" size={14} /> Saving…</> : "Save Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminFinancePage;
