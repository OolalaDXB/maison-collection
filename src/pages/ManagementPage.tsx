import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Turnstile } from "@marsidev/react-turnstile";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import atlantiqueHero from "@/assets/atlantique-hero.avif";
import georgiaHero from "@/assets/georgia-10.avif";
import atlantiqueCoast from "@/assets/management-atlantique-coast.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ManagementPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // DB-driven editorial content (language-aware via useSiteContent)
  const heroTitle   = useSiteContent("management", "hero_title",       "We started with our own homes.");
  const heroP1      = useSiteContent("management", "hero_p1",          "A mountain duplex in the Caucasus. A stone house reimagined by architects in Brittany. A family townhouse in Dubai's only net-zero community.");
  const heroP2      = useSiteContent("management", "hero_p2",          "We didn't start as managers — we started as owners. We learned what it takes to earn five stars every time: the right photos, the right words, the right pricing, the right welcome. Now we bring that to a handful of other properties. Not an agency. Not a platform. Just us, doing for your home what we do for ours.");
  const whatWeDoTitle = useSiteContent("management", "whatwedo_title", "What we do.");
  const step1       = useSiteContent("management", "step_1",           "We visit your property. We assess it honestly. Not every home makes it into the collection. We look for character, location, and something worth building on. If it's not ready, we'll tell you what it needs.");
  const step2       = useSiteContent("management", "step_2",           "We get it to the level. Styling, photography direction, the listing narrative, amenity upgrades if needed. We work with architects, designers, and photographers we trust. We don't just put your property online — we make it the version of itself that guests remember.");
  const step3       = useSiteContent("management", "step_3",           "We handle everything. Pricing that adapts to demand, guest vetting, multilingual communication in French, English and Russian, check-in coordination, cleaning, maintenance, quality checks. You get a monthly report and peace of mind. Same-day response before 10am.");
  const proofTitle  = useSiteContent("management", "proof_title",      "Our own track record.");
  const notReadyTitle    = useSiteContent("management", "notready_title",    "Your property isn't there yet?");
  const notReadySubtitle = useSiteContent("management", "notready_subtitle", "That's why we're here.");
  const notReadyP1  = useSiteContent("management", "notready_p1",      "Not every home is ready on day one. Some need styling. Some need better photography. Some need a complete rethink of how guests experience the space.");
  const notReadyP2  = useSiteContent("management", "notready_p2",      "We work with architects, interior designers, and photographers to bring properties up to the standard. From a weekend of staging to a full renovation — we scope it, manage it, and deliver it.");
  const contactTitle = useSiteContent("management", "contact_title",   "Let's talk about your property.");
  const contactDesc  = useSiteContent("management", "contact_desc",    "Tell us where it is and what you're thinking. We'll get back to you within 24 hours.");
  const contactThanks = useSiteContent("management", "contact_thanks", "Thank you — we'll be in touch within 24 hours.");
  const faqTitle    = useSiteContent("management", "faq_title",        "Questions.");

  const steps = [
    { num: "01", text: step1 },
    { num: "02", text: step2 },
    { num: "03", text: step3 },
  ];

  // i18n-translated strings (hardcoded UI / static content)
  const elevationTags = [
    t("management.tag_styling"),
    t("management.tag_photography"),
    t("management.tag_listing"),
    t("management.tag_amenity"),
    t("management.tag_operational"),
    t("management.tag_arch"),
  ];

  const faqs = [
    { q: t("management.faq_0_q"), a: t("management.faq_0_a") },
    { q: t("management.faq_1_q"), a: t("management.faq_1_a") },
    { q: t("management.faq_2_q"), a: t("management.faq_2_a") },
    { q: t("management.faq_3_q"), a: t("management.faq_3_a") },
    { q: t("management.faq_4_q"), a: t("management.faq_4_a") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (turnstileSiteKey && !turnstileToken) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        type: "management",
        status: "new",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      const body = `Name: ${formData.name}%0AEmail: ${formData.email}%0A%0A${encodeURIComponent(formData.message)}`;
      window.location.href = `mailto:chez@maisons.co?subject=${encodeURIComponent("Management Inquiry — " + formData.name)}&body=${body}`;
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-[hsl(var(--border))] bg-background text-foreground text-sm font-body focus:outline-none focus:border-foreground transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Property Management"
        description="We select, position, and manage distinctive holiday homes. From listing optimization to guest experience, we handle everything while you earn."
        path="/management"
      />
      <Header />

      {/* S1: Hero with image */}
      <section className="pt-24 md:pt-32">
        {/* Hero — Côte atlantique bretonne */}
        <FadeIn>
          <div className="w-full h-[38vh] md:h-[48vh] overflow-hidden">
            <img src={atlantiqueCoast} alt="Côte atlantique bretonne — Bretagne" className="w-full h-full object-cover object-center" loading="eager" />
          </div>
        </FadeIn>

        <div className="max-w-[750px] mx-auto px-[5%] pt-12 pb-10 md:pb-16">
          <FadeIn delay={0.1}>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1]">
              {heroTitle}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="font-body font-light text-lg text-[hsl(0,0%,27%)] leading-relaxed mt-6 space-y-4">
              <p>{heroP1}</p>
              <p>{heroP2}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <a
              href="mailto:chez@maisons.co"
              className="font-body text-sm text-primary mt-6 inline-block hover:text-primary/80 transition-colors"
            >
              chez@maisons.co →
            </a>
          </FadeIn>
        </div>
      </section>

      {/* S2: What we do */}
      <section className="px-[5%] pt-8 pb-12">
        <div className="max-w-[750px] mx-auto">
          <FadeIn>
            <h2 className="font-display text-3xl text-foreground mb-10">
              {whatWeDoTitle}
            </h2>
          </FadeIn>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.1}>
                <p className="font-body font-light text-base text-[hsl(0,0%,27%)] leading-relaxed">
                  <span className="font-display text-xl text-[hsl(0,0%,87%)] mr-2">
                    {s.num}.
                  </span>
                  <span className="text-[hsl(0,0%,60%)] mr-2">—</span>
                  {s.text}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[750px] mx-auto px-[5%]">
        <div className="h-px bg-[hsl(0,0%,88%)]" />
      </div>

      {/* S3: Proof */}
      <section className="px-[5%] pt-8 pb-12">
        <div className="max-w-[750px] mx-auto">
          <FadeIn>
            <h2 className="font-display text-3xl text-foreground mb-12">
              {proofTitle}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <div className="border border-[hsl(0,0%,93%)] overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img src={georgiaHero} alt="Maison Georgia — Caucase" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-8">
                <h3 className="font-display text-xl text-foreground mb-1">
                  Maison Georgia
                </h3>
                <p className="font-body font-light text-sm text-[hsl(0,0%,60%)] mb-4">
                  Gudauri, Caucasus
                </p>
                <p className="font-body text-sm text-[hsl(0,0%,27%)] mb-4">
                  <Star
                    size={14}
                    className="inline text-[hsl(var(--primary))] fill-[hsl(var(--primary))] -mt-0.5 mr-1"
                  />
                  5.0 · 22+ reviews · Superhost · Guest Favourite
                </p>
                <div className="space-y-1 font-body font-light text-sm text-[hsl(0,0%,27%)] mb-6">
                  <p>+35% net revenue growth in 2 years</p>
                  <p>90%+ occupancy in season</p>
                </div>
                <Link
                  to="/georgia"
                  className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {t("management.view_property")}
                </Link>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="border border-[hsl(0,0%,93%)] overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img src={atlantiqueHero} alt="Maison Atlantique — Bretagne" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-8">
                <h3 className="font-display text-xl text-foreground mb-1">
                  Maison Atlantique
                </h3>
                <p className="font-body font-light text-sm text-[hsl(0,0%,60%)] mb-4">
                  Quistinic, Brittany
                </p>
                <p className="font-body text-sm text-[hsl(0,0%,27%)] mb-4">
                  <Star
                    size={14}
                    className="inline text-[hsl(var(--primary))] fill-[hsl(var(--primary))] -mt-0.5 mr-1"
                  />
                  5.0 · 22 reviews · Superhost
                </p>
                <div className="space-y-1 font-body font-light text-sm text-[hsl(0,0%,27%)] mb-6">
                  <p>Architecture by Anthropie (2020–2022)</p>
                  <p>Featured in Archibien, Houzz</p>
                  <p>First full season: fully booked</p>
                </div>
                <Link
                  to="/atlantique"
                  className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {t("management.view_property")}
                </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="max-w-[750px] mx-auto px-[5%]">
        <div className="h-px bg-[hsl(0,0%,88%)]" />
      </div>

      {/* S4: Not ready yet */}
      <section className="px-[5%] pt-8 pb-12">
        <div className="max-w-[750px] mx-auto">
          <FadeIn>
            <h2 className="font-display text-3xl text-foreground mb-2">
              {notReadyTitle}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="font-display italic text-xl text-[hsl(0,0%,40%)] mb-8">
              {notReadySubtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="font-body font-light text-base text-[hsl(0,0%,27%)] leading-relaxed max-w-2xl space-y-4 mb-10">
              <p>{notReadyP1}</p>
              <p>{notReadyP2}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-wrap gap-2">
              {elevationTags.map((tag) => (
                <span
                  key={tag}
                  className="font-body font-light text-xs border border-[hsl(0,0%,88%)] px-3 py-1.5 text-[hsl(0,0%,40%)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-[750px] mx-auto px-[5%]">
        <div className="h-px bg-[hsl(0,0%,88%)]" />
      </div>

      {/* S5: Contact */}
      <section className="px-[5%] pt-8 pb-12">
        <div className="max-w-[750px] mx-auto">
          <FadeIn>
            <h2 className="font-display text-3xl text-foreground mb-2">
              {contactTitle}
            </h2>
            <p className="font-body font-light text-[hsl(0,0%,27%)] mb-8">
              {contactDesc}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            {submitted ? (
              <p className="font-display text-lg italic text-primary">
                {contactThanks}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder={t("management.name_placeholder")}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder={t("management.email_placeholder")}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <textarea
                  placeholder={t("management.message_placeholder")}
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
                {turnstileSiteKey && (
                  <Turnstile siteKey={turnstileSiteKey} onSuccess={(token) => setTurnstileToken(token)} onError={() => setTurnstileToken(null)} onExpire={() => setTurnstileToken(null)} options={{ theme: "light", size: "normal" }} />
                )}
                <button
                  type="submit"
                  disabled={submitting || (!!turnstileSiteKey && !turnstileToken)}
                  className="px-8 py-3 bg-primary text-primary-foreground text-xs font-body uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? t("management.sending") : t("management.send")}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      <div className="max-w-[750px] mx-auto px-[5%]">
        <div className="h-px bg-[hsl(0,0%,88%)]" />
      </div>

      {/* S6: FAQ */}
      <section className="px-[5%] pt-8 pb-12">
        <div className="max-w-[750px] mx-auto">
          <FadeIn>
            <h2 className="font-display text-2xl text-foreground mb-8">
              {faqTitle}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b border-[hsl(0,0%,93%)]"
                >
                  <AccordionTrigger className="font-body text-sm text-foreground py-5 hover:no-underline text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-body font-light text-sm text-[hsl(0,0%,27%)] leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ManagementPage;
