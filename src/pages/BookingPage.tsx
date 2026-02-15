import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useActivePaymentMethods } from "@/hooks/usePaymentMethods";
import { useDefaultBankAccount } from "@/hooks/useBankAccounts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

interface PropertyData {
  id: string;
  name: string;
  slug: string;
  price_per_night: number | null;
  weekend_price: number | null;
  cleaning_fee: number | null;
  tourist_tax_per_person: number | null;
}

const BookingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [seasonalPricing, setSeasonalPricing] = useState<any[]>([]);
  const [contractHtml, setContractHtml] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const { data: paymentMethods = [], isLoading: methodsLoading } = useActivePaymentMethods();
  const { data: bankAccount } = useDefaultBankAccount("EUR");

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guests_count: parseInt(searchParams.get("guests") || "1"),
    special_requests: "",
    check_in: searchParams.get("checkin") || "",
    check_out: searchParams.get("checkout") || "",
  });

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const { data } = await supabase.from("properties").select("id, name, slug, price_per_night, weekend_price, cleaning_fee, tourist_tax_per_person").eq("slug", slug).single();
      if (data) {
        setProperty(data);
        const [avRes, spRes] = await Promise.all([
          supabase.from("availability").select("date, price_override, available").eq("property_id", data.id),
          supabase.from("seasonal_pricing").select("start_date, end_date, price_per_night").eq("property_id", data.id),
        ]);
        setAvailability(avRes.data || []);
        setSeasonalPricing(spRes.data || []);

        const { data: tmpl } = await supabase.from("contract_templates").select("body_html").eq("active", true).or(`property_id.eq.${data.id},property_id.is.null`).order("property_id", { ascending: false }).limit(1).single();
        if (tmpl) setContractHtml(tmpl.body_html);
      }
    };
    load();
  }, [slug]);

  const price = usePriceCalculation({
    checkIn: form.check_in,
    checkOut: form.check_out,
    guestsCount: form.guests_count,
    defaultPrice: property?.price_per_night || 0,
    weekendPrice: property?.weekend_price || null,
    cleaningFee: property?.cleaning_fee || 0,
    touristTaxPerPerson: property?.tourist_tax_per_person || 0,
    availability,
    seasonalPricing,
  });

  const renderContract = () => {
    if (!contractHtml || !property || !price) return "<p>No contract template available.</p>";
    return contractHtml
      .replace(/\{\{guest_name\}\}/g, form.guest_name)
      .replace(/\{\{property_name\}\}/g, property.name)
      .replace(/\{\{check_in\}\}/g, form.check_in)
      .replace(/\{\{check_out\}\}/g, form.check_out)
      .replace(/\{\{nights\}\}/g, String(price.nights))
      .replace(/\{\{total_price\}\}/g, `€${price.total}`);
  };

  const handleSubmit = async () => {
    if (!property || !price || !paymentMethod) return;
    if (honeypot) return;
    if (turnstileSiteKey && !turnstileToken) return;
    setSubmitting(true);

    // Insert booking
    const { data: booking, error: bError } = await supabase.from("bookings").insert({
      property_id: property.id,
      guest_name: form.guest_name,
      guest_email: form.guest_email,
      guest_phone: form.guest_phone || null,
      guests_count: form.guests_count,
      check_in: form.check_in,
      check_out: form.check_out,
      base_price_per_night: price.avgNightlyRate,
      cleaning_fee: price.cleaningFee,
      tourist_tax_total: price.touristTax,
      total_price: price.total,
      status: "pending",
      source: "direct",
      special_requests: form.special_requests || null,
      payment_method: paymentMethod,
      payment_status: "pending",
    } as any).select().single();

    if (bError) { toast.error(bError.message); setSubmitting(false); return; }

    // Insert contract
    if (contractHtml) {
      await supabase.from("booking_contracts").insert({
        booking_id: booking.id,
        contract_html: renderContract(),
        accepted_at: new Date().toISOString(),
      });
    }

    // Block dates
    for (let i = 0; i < price.nights; i++) {
      const d = new Date(form.check_in);
      d.setDate(d.getDate() + i);
      await supabase.from("availability").upsert(
        { property_id: property.id, date: d.toISOString().split("T")[0], available: false, source: "booking", booking_id: booking.id },
        { onConflict: "property_id,date" }
      );
    }

    // Create inquiry notification
    await supabase.from("inquiries").insert({
      name: form.guest_name,
      email: form.guest_email,
      phone: form.guest_phone || null,
      type: "booking",
      property_id: property.id,
      message: `Booking request: ${form.check_in} → ${form.check_out}, ${price.nights} nights, €${price.total}, payment: ${paymentMethod}`,
    });

    // Handle payment method
    if (paymentMethod === "card") {
      const { data: session, error: sError } = await supabase.functions.invoke("create-checkout", {
        body: {
          booking_id: booking.id,
          amount: Math.round(price.total * 100),
          currency: "eur",
          property_name: property.name,
          guest_email: form.guest_email,
          success_url: `${window.location.origin}/book/${slug}/confirmation?booking_id=${booking.id}`,
          cancel_url: `${window.location.origin}/book/${slug}?step=4`,
        },
      });

      if (sError || !session?.url) {
        toast.error("Payment setup failed. Please try again or choose another method.");
        setSubmitting(false);
        return;
      }

      window.location.href = session.url;
      return;
    }

    // For transfer/crypto, redirect to confirmation
    setSubmitting(false);
    navigate(`/book/${slug}/confirmation?booking_id=${booking.id}`);
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-padding"><div className="max-container text-center py-20"><p className="text-muted-foreground">Loading…</p></div></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="section-padding">
        <div className="max-container max-w-2xl mx-auto">
          <h1 className="font-display text-3xl mb-2">Book {property.name}</h1>
          <p className="text-sm text-muted-foreground mb-8">{form.check_in} → {form.check_out} · {price?.nights || 0} nights</p>

          {/* Step indicators */}
          <div className="flex gap-1 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 ${step >= s ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <h2 className="font-display text-xl mb-4">Your Details</h2>
              <div><label className="text-xs text-muted-foreground mb-1 block">Full Name *</label><Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} required /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Email *</label><Input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">Phone *</label><Input type="tel" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Guests</label><Input type="number" min={1} max={10} value={form.guests_count} onChange={(e) => setForm({ ...form, guests_count: parseInt(e.target.value) || 1 })} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Special Requests</label><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={3} value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} /></div>
              <Button
                className="w-full"
                onClick={() => {
                  if (!form.guest_name || !form.guest_email) { toast.error("Name and email are required"); return; }
                  setStep(2);
                }}
              >Continue</Button>
            </div>
          )}

          {/* Step 2: Contract */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4">Rental Agreement</h2>
              <div className="border border-border p-6 max-h-[400px] overflow-y-auto text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContract() }} />
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={contractAccepted} onChange={(e) => setContractAccepted(e.target.checked)} className="mt-1" />
                <span className="text-sm">I have read and accept the rental agreement</span>
              </label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!contractAccepted} onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-2">Payment Method</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you'd like to pay. All methods are accepted regardless of amount.
              </p>

              {methodsLoading ? (
                <p className="text-sm text-muted-foreground">Loading payment options…</p>
              ) : paymentMethods.length === 0 ? (
                <div className="border border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No payment methods available. Please contact us at chez@maisons.co.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.code}
                      type="button"
                      onClick={() => setPaymentMethod(method.code)}
                      className={`w-full border p-5 text-left transition-colors ${
                        paymentMethod === method.code
                          ? "border-foreground bg-[hsl(0,0%,97%)]"
                          : "border-[hsl(0,0%,88%)] hover:border-[hsl(0,0%,70%)]"
                      }`}
                    >
                      <p className="font-body font-medium text-sm text-foreground">
                        {method.code === "card" && "💳 "}
                        {method.code === "bank_transfer" && "🏦 "}
                        {method.code === "crypto" && "₿ "}
                        {method.name}
                      </p>
                      {method.description && (
                        <p className="font-body font-light text-xs text-muted-foreground mt-1">
                          {method.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button
                  className="flex-1"
                  disabled={!paymentMethod}
                  onClick={() => setStep(4)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Summary & Confirm */}
          {step === 4 && price && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4">Summary & Confirm</h2>

              <div className="border border-border p-4 text-sm space-y-2">
                <p className="font-medium text-foreground">{form.guest_name}</p>
                <p className="text-muted-foreground">{form.guest_email} · {form.guest_phone || "—"}</p>
                <p className="text-muted-foreground">{form.guests_count} guest{form.guests_count > 1 ? "s" : ""}</p>
              </div>

              <div className="border border-border p-4 text-sm space-y-1">
                <div className="flex justify-between"><span>{price.nights} nights × ~€{price.avgNightlyRate}/night</span><span>€{price.subtotal}</span></div>
                {price.cleaningFee > 0 && <div className="flex justify-between"><span>Cleaning fee</span><span>€{price.cleaningFee}</span></div>}
                {price.touristTax > 0 && <div className="flex justify-between"><span>Tourist tax</span><span>€{price.touristTax}</span></div>}
                {price.promoDiscount > 0 && <div className="flex justify-between text-primary"><span>Promo discount</span><span>-€{price.promoDiscount}</span></div>}
                <div className="flex justify-between font-display text-lg border-t border-border pt-2 mt-2"><span>Total</span><span>€{price.total}</span></div>
              </div>

              <div className="border border-border p-4 text-sm">
                <p className="text-muted-foreground">
                  Payment method:{" "}
                  <span className="text-foreground font-medium">
                    {paymentMethods.find((m) => m.code === paymentMethod)?.name || paymentMethod}
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={submitting || (!!turnstileSiteKey && !turnstileToken)}>
                  {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Submitting…</> : "Confirm Booking"}
                </Button>
              </div>
              {turnstileSiteKey && (
                <Turnstile siteKey={turnstileSiteKey} onSuccess={(token) => setTurnstileToken(token)} onError={() => setTurnstileToken(null)} onExpire={() => setTurnstileToken(null)} options={{ theme: 'light', size: 'normal' }} />
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
