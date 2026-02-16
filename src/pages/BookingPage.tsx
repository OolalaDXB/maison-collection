import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useActivePaymentMethods } from "@/hooks/usePaymentMethods";
import { useDefaultBankAccount } from "@/hooks/useBankAccounts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

interface PropertyData {
  id: string; name: string; slug: string;
  price_per_night: number | null; weekend_price: number | null;
  cleaning_fee: number | null; tourist_tax_per_person: number | null;
}

const BookingPage = () => {
  const { t } = useTranslation();
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
    guest_name: "", guest_email: "", guest_phone: "",
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
    checkIn: form.check_in, checkOut: form.check_out, guestsCount: form.guests_count,
    defaultPrice: property?.price_per_night || 0, weekendPrice: property?.weekend_price || null,
    cleaningFee: property?.cleaning_fee || 0, touristTaxPerPerson: property?.tourist_tax_per_person || 0,
    availability, seasonalPricing,
  });

  const escapeHtml = (unsafe: string): string =>
    unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const renderContract = () => {
    if (!contractHtml || !property || !price) return "<p>No contract template available.</p>";
    return contractHtml
      .replace(/\{\{guest_name\}\}/g, escapeHtml(form.guest_name))
      .replace(/\{\{guest_email\}\}/g, escapeHtml(form.guest_email))
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

    // Use atomic database function to prevent race conditions
    const { data: bookingId, error: bError } = await supabase.rpc("create_booking_atomic" as any, {
      p_property_id: property.id,
      p_check_in: form.check_in,
      p_check_out: form.check_out,
      p_guest_name: form.guest_name,
      p_guest_email: form.guest_email,
      p_guest_phone: form.guest_phone || null,
      p_guests_count: form.guests_count,
      p_base_price_per_night: price.avgNightlyRate,
      p_cleaning_fee: price.cleaningFee,
      p_tourist_tax_total: price.touristTax,
      p_total_price: price.total,
      p_special_requests: form.special_requests || null,
      p_payment_method: paymentMethod,
      p_contract_html: contractHtml ? renderContract() : null,
    });

    if (bError) {
      const msg = bError.message.includes("DATES_UNAVAILABLE")
        ? "These dates are no longer available. Please choose different dates."
        : bError.message;
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    // Create inquiry notification (non-blocking)
    supabase.from("inquiries").insert({
      name: form.guest_name, email: form.guest_email, phone: form.guest_phone || null,
      type: "booking", property_id: property.id,
      message: `Booking request: ${form.check_in} → ${form.check_out}, ${price.nights} nights, €${price.total}, payment: ${paymentMethod}`,
    });

    if (paymentMethod === "card") {
      const { data: session, error: sError } = await supabase.functions.invoke("create-checkout", {
        body: {
          booking_id: bookingId, amount: Math.round(price.total * 100), currency: "eur",
          property_name: property.name, guest_email: form.guest_email,
          success_url: `${window.location.origin}/book/${slug}/confirmation?booking_id=${bookingId}`,
          cancel_url: `${window.location.origin}/book/${slug}?step=4`,
        },
      });
      if (sError || !session?.url) { toast.error("Payment setup failed."); setSubmitting(false); return; }
      window.location.href = session.url;
      return;
    }

    setSubmitting(false);
    navigate(`/book/${slug}/confirmation?booking_id=${bookingId}`);
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
      <SEO title={`${t("booking.book_property")} ${property.name}`} description={`Complete your reservation at ${property.name}.`} path={`/book/${slug}`} noindex={true} />
      <Header />
      <div className="section-padding">
        <div className="max-container max-w-2xl mx-auto">
          <h1 className="font-display text-3xl mb-2">{t("booking.book_property")} {property.name}</h1>
          <p className="text-sm text-muted-foreground mb-8">{form.check_in} → {form.check_out} · {price?.nights || 0} {t("booking.nights")}</p>

          <div className="flex gap-1 mb-8">
            {[1, 2, 3, 4].map((s) => (<div key={s} className={`h-1 flex-1 ${step >= s ? "bg-primary" : "bg-border"}`} />))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <h2 className="font-display text-xl mb-4">{t("booking.your_details")}</h2>
              <div><label className="text-xs text-muted-foreground mb-1 block">{t("booking.full_name")} *</label><Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} required /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">{t("booking.email")} *</label><Input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground mb-1 block">{t("booking.phone")} *</label><Input type="tel" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{t("booking.guests")}</label><Input type="number" min={1} max={10} value={form.guests_count} onChange={(e) => setForm({ ...form, guests_count: parseInt(e.target.value) || 1 })} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">{t("booking.special_requests")}</label><textarea className="w-full px-3 py-2 border border-border bg-background text-sm resize-y" rows={3} value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} /></div>
              <Button className="w-full" onClick={() => { if (!form.guest_name || !form.guest_email) { toast.error("Name and email are required"); return; } setStep(2); }}>{t("booking.continue")}</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4">{t("booking.rental_agreement")}</h2>
              <div className="border border-border p-6 max-h-[400px] overflow-y-auto text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContract() }} />
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={contractAccepted} onChange={(e) => setContractAccepted(e.target.checked)} className="mt-1" />
                <span className="text-sm">{t("booking.accept_agreement")}</span>
              </label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>{t("booking.back")}</Button>
                <Button className="flex-1" disabled={!contractAccepted} onClick={() => setStep(3)}>{t("booking.continue")}</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-2">{t("booking.payment_method")}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t("booking.payment_method_desc")}</p>
              {methodsLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : paymentMethods.length === 0 ? (
                <div className="border border-border p-6 text-center"><p className="text-sm text-muted-foreground">No payment methods available.</p></div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button key={method.code} type="button" onClick={() => setPaymentMethod(method.code)}
                      className={`w-full border p-5 text-left transition-colors ${paymentMethod === method.code ? "border-foreground bg-[hsl(0,0%,97%)]" : "border-[hsl(0,0%,88%)] hover:border-[hsl(0,0%,70%)]"}`}>
                      <p className="font-body font-medium text-sm text-foreground">
                        {method.code === "card" && "💳 "}{method.code === "bank_transfer" && "🏦 "}{method.code === "crypto" && "₿ "}{method.name}
                      </p>
                      {method.description && <p className="font-body font-light text-xs text-muted-foreground mt-1">{method.description}</p>}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>{t("booking.back")}</Button>
                <Button className="flex-1" disabled={!paymentMethod} onClick={() => setStep(4)}>{t("booking.continue")}</Button>
              </div>
            </div>
          )}

          {step === 4 && price && (
            <div className="space-y-4">
              <h2 className="font-display text-xl mb-4">{t("booking.summary")}</h2>
              <div className="border border-border p-4 text-sm space-y-2">
                <p className="font-medium text-foreground">{form.guest_name}</p>
                <p className="text-muted-foreground">{form.guest_email} · {form.guest_phone || "—"}</p>
                <p className="text-muted-foreground">{form.guests_count} {form.guests_count > 1 ? t("property_card.guests") : "guest"}</p>
              </div>
              <div className="border border-border p-4 text-sm space-y-1">
                <div className="flex justify-between"><span>{price.nights} {t("booking.nights")} × ~€{price.avgNightlyRate}/{t("booking.nights").charAt(0) === "n" ? "night" : t("booking.nights")}</span><span>€{price.subtotal}</span></div>
                {price.cleaningFee > 0 && <div className="flex justify-between"><span>Cleaning fee</span><span>€{price.cleaningFee}</span></div>}
                {price.touristTax > 0 && <div className="flex justify-between"><span>Tourist tax</span><span>€{price.touristTax}</span></div>}
                {price.promoDiscount > 0 && <div className="flex justify-between text-primary"><span>Promo discount</span><span>-€{price.promoDiscount}</span></div>}
                <div className="flex justify-between font-display text-lg border-t border-border pt-2 mt-2"><span>{t("booking.total")}</span><span>€{price.total}</span></div>
              </div>
              <div className="border border-border p-4 text-sm">
                <p className="text-muted-foreground">{t("booking.payment_method")}: <span className="text-foreground font-medium">{paymentMethods.find((m) => m.code === paymentMethod)?.name || paymentMethod}</span></p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>{t("booking.back")}</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={submitting || (!!turnstileSiteKey && !turnstileToken)}>
                  {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> {t("booking.submitting")}</> : t("booking.confirm")}
                </Button>
              </div>
              {turnstileSiteKey && <Turnstile siteKey={turnstileSiteKey} onSuccess={(token) => setTurnstileToken(token)} onError={() => setTurnstileToken(null)} onExpire={() => setTurnstileToken(null)} options={{ theme: 'light', size: 'normal' }} />}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
