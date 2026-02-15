import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { ChevronDown, Plus, Trash2, Pencil } from "lucide-react";

interface PaymentMethodRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  config: Record<string, any>;
  currencies: string[];
  display_order: number;
}

interface BankAccountRow {
  id: string;
  bank_name: string;
  iban: string;
  bic: string;
  currency: string;
  is_default: boolean;
}

interface Transaction {
  id: string;
  guest_name: string;
  guest_email: string;
  property_id: string;
  total_price: number;
  status: string | null;
  paid_at: string | null;
  payment_method: string | null;
  payment_status: string | null;
  stripe_payment_intent: string | null;
  created_at: string | null;
}

const AdminPaymentsPage = () => {
  const [methods, setMethods] = useState<PaymentMethodRow[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountRow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [properties, setProperties] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Bank account form
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccountRow | null>(null);
  const [bankForm, setBankForm] = useState({ bank_name: "", iban: "", bic: "", currency: "EUR", is_default: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [mRes, baRes, bRes, pRes] = await Promise.all([
      supabase.from("payment_methods" as any).select("*").order("display_order"),
      supabase.from("bank_accounts" as any).select("*").order("created_at"),
      supabase.from("bookings").select("id, guest_name, guest_email, property_id, total_price, status, paid_at, payment_method, payment_status, stripe_payment_intent, created_at").order("created_at", { ascending: false }),
      supabase.from("properties").select("id, name"),
    ]);
    setMethods((mRes.data || []) as unknown as PaymentMethodRow[]);
    setBankAccounts((baRes.data || []) as unknown as BankAccountRow[]);
    setTransactions((bRes.data || []) as unknown as Transaction[]);
    const pm: Record<string, string> = {};
    (pRes.data || []).forEach((p: any) => { pm[p.id] = p.name; });
    setProperties(pm);
    setLoading(false);
  };

  // Payment methods
  const toggleMethod = async (method: PaymentMethodRow) => {
    const { error } = await supabase
      .from("payment_methods" as any)
      .update({ active: !method.active } as any)
      .eq("id", method.id);
    if (error) toast.error(error.message);
    else {
      setMethods(methods.map(m => m.id === method.id ? { ...m, active: !m.active } : m));
      toast.success(`${method.name} ${!method.active ? "enabled" : "disabled"}`);
    }
  };

  const updateMethodConfig = async (method: PaymentMethodRow, key: string, value: string) => {
    const newConfig = { ...method.config, [key]: value };
    const { error } = await supabase
      .from("payment_methods" as any)
      .update({ config: newConfig } as any)
      .eq("id", method.id);
    if (error) toast.error(error.message);
    else {
      setMethods(methods.map(m => m.id === method.id ? { ...m, config: newConfig } : m));
      toast.success("Configuration saved");
    }
  };

  // Bank accounts
  const saveBankAccount = async () => {
    if (!bankForm.bank_name || !bankForm.iban || !bankForm.bic) {
      toast.error("All fields are required");
      return;
    }

    if (editingBank) {
      const { error } = await supabase.from("bank_accounts" as any).update(bankForm as any).eq("id", editingBank.id);
      if (error) toast.error(error.message);
      else { toast.success("Bank account updated"); resetBankForm(); loadData(); }
    } else {
      const { error } = await supabase.from("bank_accounts" as any).insert(bankForm as any);
      if (error) toast.error(error.message);
      else { toast.success("Bank account added"); resetBankForm(); loadData(); }
    }
  };

  const deleteBankAccount = async (id: string) => {
    const { error } = await supabase.from("bank_accounts" as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); setBankAccounts(bankAccounts.filter(b => b.id !== id)); }
  };

  const resetBankForm = () => {
    setShowBankForm(false);
    setEditingBank(null);
    setBankForm({ bank_name: "", iban: "", bic: "", currency: "EUR", is_default: false });
  };

  const startEditBank = (bank: BankAccountRow) => {
    setEditingBank(bank);
    setBankForm({ bank_name: bank.bank_name, iban: bank.iban, bic: bank.bic, currency: bank.currency, is_default: bank.is_default });
    setShowBankForm(true);
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Payments</h1>
      <Tabs defaultValue="methods">
        <TabsList>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Payment Methods */}
        <TabsContent value="methods" className="mt-4 space-y-3">
          {methods.map((method) => (
            <Collapsible key={method.id}>
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMethod(method)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${method.active ? "bg-primary" : "bg-muted"}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${method.active ? "left-5" : "left-0.5"}`} />
                      </button>
                      <CardTitle className="text-base font-display">{method.name}</CardTitle>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm"><ChevronDown size={16} /></Button>
                    </CollapsibleTrigger>
                  </div>
                  {method.description && (
                    <p className="text-xs text-muted-foreground mt-1 ml-[52px]">{method.description}</p>
                  )}
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-4 space-y-3">
                    {method.code === "card" && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          The Stripe secret key is configured as a Supabase Edge Function secret (STRIPE_SECRET_KEY).
                        </p>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Stripe Publishable Key</label>
                          <div className="flex gap-2">
                            <Input
                              value={method.config.publishable_key || ""}
                              onChange={(e) => setMethods(methods.map(m => m.id === method.id ? { ...m, config: { ...m.config, publishable_key: e.target.value } } : m))}
                              placeholder="pk_live_…"
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => updateMethodConfig(method, "publishable_key", method.config.publishable_key || "")}>Save</Button>
                          </div>
                        </div>
                      </>
                    )}
                    {method.code === "bank_transfer" && (
                      <p className="text-sm text-muted-foreground">
                        Bank transfer uses the bank accounts configured in the "Bank Accounts" tab. Make sure to set a default account for each currency.
                      </p>
                    )}
                    {method.code === "crypto" && (
                      <>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Wallet Address</label>
                          <div className="flex gap-2">
                            <Input
                              value={method.config.wallet_address || ""}
                              onChange={(e) => setMethods(methods.map(m => m.id === method.id ? { ...m, config: { ...m.config, wallet_address: e.target.value } } : m))}
                              placeholder="0x…"
                              className="flex-1 font-mono text-xs"
                            />
                            <Button size="sm" onClick={() => updateMethodConfig(method, "wallet_address", method.config.wallet_address || "")}>Save</Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Network</label>
                          <select
                            className="px-3 py-2 border border-border bg-background text-sm"
                            value={method.config.network || "ethereum"}
                            onChange={(e) => {
                              setMethods(methods.map(m => m.id === method.id ? { ...m, config: { ...m.config, network: e.target.value } } : m));
                              updateMethodConfig(method, "network", e.target.value);
                            }}
                          >
                            <option value="ethereum">Ethereum</option>
                            <option value="polygon">Polygon</option>
                            <option value="arbitrum">Arbitrum</option>
                            <option value="base">Base</option>
                          </select>
                        </div>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </TabsContent>

        {/* Bank Accounts */}
        <TabsContent value="bank" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">Bank Accounts</CardTitle>
                <Button size="sm" variant="outline" onClick={() => { resetBankForm(); setShowBankForm(true); }}>
                  <Plus size={14} className="mr-1" /> Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showBankForm && (
                <div className="border border-border p-4 mb-4 space-y-3">
                  <h4 className="font-display text-sm">{editingBank ? "Edit" : "Add"} Bank Account</h4>
                  <Input placeholder="Bank name" value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} />
                  <Input placeholder="IBAN" value={bankForm.iban} onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })} className="font-mono text-xs" />
                  <Input placeholder="BIC / SWIFT" value={bankForm.bic} onChange={(e) => setBankForm({ ...bankForm, bic: e.target.value })} className="font-mono text-xs" />
                  <div className="flex gap-3 items-center">
                    <select className="px-3 py-2 border border-border bg-background text-sm" value={bankForm.currency} onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value })}>
                      <option value="EUR">EUR — Euro (€)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="GEL">GEL — Georgian Lari (₾)</option>
                      <option value="AED">AED — UAE Dirham (د.إ)</option>
                      <option value="GBP">GBP — British Pound (£)</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={bankForm.is_default} onChange={(e) => setBankForm({ ...bankForm, is_default: e.target.checked })} />
                      Default for this currency
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveBankAccount}>Save</Button>
                    <Button size="sm" variant="outline" onClick={resetBankForm}>Cancel</Button>
                  </div>
                </div>
              )}

              {bankAccounts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No bank accounts configured. Add one to enable bank transfer payments.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>BIC</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm">{b.bank_name}</TableCell>
                        <TableCell className="text-xs font-mono">{b.iban}</TableCell>
                        <TableCell className="text-xs font-mono">{b.bic}</TableCell>
                        <TableCell className="text-sm">{b.currency}</TableCell>
                        <TableCell>
                          {b.is_default && <span className="text-[0.65rem] px-2 py-0.5 uppercase tracking-wider bg-primary/10 text-primary">default</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => startEditBank(b)}><Pencil size={14} /></Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteBankAccount(b.id)}><Trash2 size={14} /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions yet</TableCell></TableRow>
              ) : transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm">{t.guest_name}</TableCell>
                  <TableCell className="text-sm">{properties[t.property_id] || "—"}</TableCell>
                  <TableCell className="text-sm">€{t.total_price}</TableCell>
                  <TableCell className="text-xs uppercase">{t.payment_method || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-[0.65rem] px-2 py-0.5 uppercase tracking-wider ${
                      t.payment_status === "paid" || t.paid_at
                        ? "bg-[hsl(120,40%,92%)] text-[hsl(120,40%,30%)]"
                        : "bg-[hsl(45,80%,92%)] text-[hsl(45,60%,30%)]"
                    }`}>
                      {t.payment_status || (t.paid_at ? "paid" : "pending")}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
