import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const steps = [
  {
    num: "01",
    text: "We visit your property. We assess it honestly. Not every home makes it into the collection. We look for character, location, and something worth building on. If it's not ready, we'll tell you what it needs.",
  },
  {
    num: "02",
    text: "We get it to the level. Styling, photography direction, the listing narrative, amenity upgrades if needed. We work with architects, designers, and photographers we trust. We don't just put your property online — we make it the version of itself that guests remember.",
  },
  {
    num: "03",
    text: "We handle everything. Pricing that adapts to demand, guest vetting, multilingual communication in French, English and Russian, check-in coordination, cleaning, maintenance, quality checks. You get a monthly report and peace of mind. Same-day response before 10am.",
  },
];

const elevationTags = [
  "Interior styling",
  "Professional photography",
  "Listing narrative",
  "Amenity audit",
  "Operational setup",
  "Architectural consultation",
];

const faqs = [
  {
    q: "What kind of properties do you work with?",
    a: "Homes with character — architectural renovations, well-designed apartments in exceptional locations, heritage properties with a story. We're looking for places guests will remember, not generic rentals. If you're unsure, just reach out.",
  },
  {
    q: "How much does it cost?",
    a: "Our fee is 15–20% of booking revenue, depending on the scope. No setup fees, no hidden costs. We discuss everything before we start.",
  },
  {
    q: "What if my property needs work first?",
    a: "That's part of what we do. We'll visit, give you an honest assessment, and propose a plan — from light staging to a full renovation. We manage the process end to end.",
  },
  {
    q: "Where do you operate?",
    a: "Today: Brittany, the Caucasus, and Dubai. We're expanding selectively. If your property is elsewhere and it's exceptional, talk to us.",
  },
  {
    q: "How quickly can my property go live?",
    a: "If it's ready: 2–4 weeks (photos, listing, setup). If it needs work: depends on scope, but we move fast and we'll give you a timeline upfront.",
  },
];

const ManagementPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

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
      <Header />

      {/* S1: Hero */}
      <section className="px-[5%] pt-32 md:pt-40 pb-10 md:pb-16">
        <div className="max-w-[750px] mx-auto">
          <FadeIn>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1]">
              We started with our own homes.
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="font-body font-light text-lg text-[hsl(0,0%,27%)] leading-relaxed mt-6 space-y-4">
              <p>
                A mountain duplex in the Caucasus. A stone house reimagined by
                architects in Brittany. A family townhouse in Dubai's only
                net-zero community.
              </p>
              <p>
                We didn't start as managers — we started as owners. We learned
                what it takes to earn five stars every time: the right photos,
                the right words, the right pricing, the right welcome. Now we
                bring that to a handful of other properties. Not an agency. Not a
                platform. Just us, doing for your home what we do for ours.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
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
              What we do.
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
              Our own track record.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <div className="border border-[hsl(0,0%,93%)] p-8">
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
                  View the property →
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="border border-[hsl(0,0%,93%)] p-8">
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
                  View the property →
                </Link>
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
              Your property isn't there yet?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="font-display italic text-xl text-[hsl(0,0%,40%)] mb-8">
              That's why we're here.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="font-body font-light text-base text-[hsl(0,0%,27%)] leading-relaxed max-w-2xl space-y-4 mb-10">
              <p>
                Not every home is ready on day one. Some need styling. Some need
                better photography. Some need a complete rethink of how guests
                experience the space.
              </p>
              <p>
                We work with architects, interior designers, and photographers
                to bring properties up to the standard. From a weekend of
                staging to a full renovation — we scope it, manage it, and
                deliver it.
              </p>
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
              Let's talk about your property.
            </h2>
            <p className="font-body font-light text-[hsl(0,0%,27%)] mb-8">
              Tell us where it is and what you're thinking. We'll get back to
              you within 24 hours.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            {submitted ? (
              <p className="font-display text-lg italic text-primary">
                Thank you — we'll be in touch within 24 hours.
              </p>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
                <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <textarea
                  placeholder="Tell us about your property — where it is, what it's like, and what you need."
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`${inputClass} resize-none`}
                />
                {turnstileSiteKey && (
                  <Turnstile siteKey={turnstileSiteKey} onSuccess={(token) => setTurnstileToken(token)} onError={() => setTurnstileToken(null)} onExpire={() => setTurnstileToken(null)} options={{ theme: 'light', size: 'normal' }} />
                )}
                <button
                  type="submit"
                  disabled={submitting || (!!turnstileSiteKey && !turnstileToken)}
                  className="px-8 py-3 bg-primary text-primary-foreground text-xs font-body uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send"}
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
              Questions.
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
                  <AccordionTrigger className="font-body text-sm text-foreground py-5 hover:no-underline">
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
