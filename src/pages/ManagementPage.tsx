import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Palette, Camera, TrendingUp, Users, Wrench, BarChart3, Shield, Star,
} from "lucide-react";
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
    title: "Audit & Selection",
    desc: "We visit. We assess. Not every property makes it into the collection. We look for character, location, and potential — not just square meters. If your property isn't ready, we tell you honestly what it needs.",
  },
  {
    num: "02",
    title: "Elevation",
    desc: "If needed, we bring your property to the level. Interior styling, photography direction, listing narrative, amenity upgrades, operational setup. We don't just list — we transform. We work with our network of architects, designers, and local artisans.",
  },
  {
    num: "03",
    title: "Management",
    desc: "Once live, we handle everything. Pricing strategy, guest screening, multilingual communication (French, English, Russian), maintenance coordination, and quality control. Same-day response before 10am. You get a monthly report and peace of mind.",
  },
];

const serviceItems = [
  { icon: Search, title: "Property Audit", desc: "On-site visit. Honest assessment of strengths, gaps, and potential. Competitive benchmarking." },
  { icon: Palette, title: "Styling & Staging", desc: "Interior recommendations, furniture sourcing, styling direction to match the collection's standard." },
  { icon: Camera, title: "Photography & Narrative", desc: "Professional photography direction. Editorial listing copy. Consistent brand identity." },
  { icon: TrendingUp, title: "Revenue & Pricing", desc: "Dynamic pricing strategy. Seasonal adjustments. Focus on quality bookings, not volume." },
  { icon: Users, title: "Guest Management", desc: "Screening, communication in FR/EN/RU, check-in coordination, issue resolution. Same-day response." },
  { icon: Wrench, title: "Maintenance & Operations", desc: "Cleaning coordination, restocking, minor repairs, vendor management. Regular quality checks." },
  { icon: BarChart3, title: "Reporting", desc: "Monthly owner report: revenue, occupancy, guest feedback, maintenance log, recommendations." },
  { icon: Shield, title: "Legal & Compliance", desc: "Rental contracts, insurance guidance, local regulation compliance, tourist tax handling." },
];

const elevationTags = [
  "Interior styling & furniture",
  "Professional photography",
  "Listing optimization",
  "Amenity audit & upgrades",
  "Operational setup",
  "Architectural consultation",
];

const faqs = [
  { q: "What types of properties do you manage?", a: "Homes with character — architectural projects, renovated heritage properties, well-designed apartments in exceptional locations. We look for places with a story, not generic rentals." },
  { q: "What commission do you take?", a: "Our management fee is between 15–20% of booking revenue depending on the scope of services. No hidden fees. We discuss everything transparently before starting." },
  { q: "Do you only manage properties in France and Georgia?", a: "Today, yes — Brittany and the Caucasus. We're expanding selectively to the Gulf region in 2026. If your property is elsewhere and exceptional, talk to us." },
  { q: "What if my property needs work before going live?", a: "That's part of what we do. We'll audit your property, give you an honest assessment, and propose a plan — from light staging to full renovation management." },
  { q: "How long before my property is live?", a: "For collection-ready properties: 2–4 weeks (photography, listing, operational setup). For properties needing work: depends on scope, but we move fast." },
];

const serviceTypeOptions = [
  "Full management",
  "Seasonal management",
  "Property audit only",
  "Help getting my property ready",
  "Just exploring",
];

const ManagementPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    serviceType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.location,
        type: formData.serviceType || "general",
        message: formData.message,
        status: "new",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      // Fallback to mailto
      const body = `Name: ${formData.name}%0AEmail: ${formData.email}%0ALocation: ${formData.location}%0AService: ${formData.serviceType}%0A%0A${encodeURIComponent(formData.message)}`;
      window.location.href = `mailto:chez@maisons.co?subject=${encodeURIComponent("Management Inquiry — " + formData.name)}&body=${body}`;
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-[hsl(var(--border))] bg-background text-foreground text-sm font-body focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* S1: Hero */}
      <section className="px-[5%] pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">For Property Owners</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-display text-4xl md:text-6xl text-foreground max-w-3xl">
              We don't manage every property.
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-display italic text-2xl md:text-3xl text-[#666666] mt-4">
              Just the ones worth it.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="font-body font-light text-[#444444] text-lg leading-relaxed max-w-2xl mt-8">
              We started with our own homes — a mountain duplex in the Caucasus, an
              architect-renovated stone house in Brittany. We learned what it takes to
              deliver five-star stays, every single time. Now we bring that standard to a
              select number of properties.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* S2: Approach */}
      <section className="section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">Our Approach</p>
            <h2 className="font-display text-3xl text-foreground mb-12">
              Three steps. No shortcuts.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.15}>
                <div>
                  <span className="font-display text-4xl text-[#e0e0e0] block mb-4">
                    {s.num}
                  </span>
                  <h3 className="font-body uppercase tracking-wider text-sm text-foreground mb-3">
                    {s.title}
                  </h3>
                  <p className="font-body font-light text-[#444444] text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S3: Services */}
      <section className="bg-[#f5f3f0] section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">Services</p>
            <h2 className="font-display text-3xl text-foreground mb-12">
              What's included
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceItems.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.08}>
                <div className="flex gap-4">
                  <s.icon size={20} className="text-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-body text-sm text-foreground mb-1">{s.title}</h3>
                    <p className="font-body font-light text-[#444444] text-sm leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* S4: Proof */}
      <section className="bg-[#0a1628] section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="font-body uppercase tracking-wider text-[0.7rem] text-[rgba(255,255,255,0.6)] mb-4">
              Track Record
            </p>
            <h2 className="font-display text-3xl text-white mb-12">
              We proved it on our own homes first.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <div className="border border-[rgba(255,255,255,0.3)] p-8">
                <h3 className="font-display text-2xl text-white mb-2">
                  Maison Georgia
                </h3>
                <p className="font-body font-light text-[rgba(255,255,255,0.5)] text-sm mb-4">
                  Gudauri, Caucasus
                </p>
                <p className="font-body text-sm text-[rgba(255,255,255,0.7)] mb-4">
                  <Star size={14} className="inline text-[#c1695f] fill-[#c1695f] -mt-0.5 mr-1" />
                  5.0 · 22+ reviews · Superhost · Guest Favourite
                </p>
                <div className="space-y-1 font-body font-light text-sm text-white mb-6">
                  <p>+35% net revenue growth in 2 years</p>
                  <p>90%+ occupancy in season</p>
                  <p>Superhost · Guest Favourite</p>
                </div>
                <Link
                  to="/georgia"
                  className="font-body text-sm text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
                >
                  View the property →
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="border border-[rgba(255,255,255,0.3)] p-8">
                <h3 className="font-display text-2xl text-white mb-2">
                  Maison Atlantique
                </h3>
                <p className="font-body font-light text-[rgba(255,255,255,0.5)] text-sm mb-4">
                  Quistinic, Brittany
                </p>
                <p className="font-body text-sm text-[rgba(255,255,255,0.7)] mb-4">
                  <Star size={14} className="inline text-[#c1695f] fill-[#c1695f] -mt-0.5 mr-1" />
                  5.0 · Superhost
                </p>
                <div className="space-y-1 font-body font-light text-sm text-white mb-6">
                  <p>Architecture by Anthropie (2020–2022)</p>
                  <p>Featured in Archibien, Houzz</p>
                  <p>First full season: sold out</p>
                </div>
                <Link
                  to="/atlantique"
                  className="font-body text-sm text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
                >
                  View the property →
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* S5: Elevation */}
      <section className="section-padding">
        <div className="max-container">
          <FadeIn>
            <h2 className="font-display text-3xl text-foreground mb-4">
              Your property isn't at the level yet?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="font-display italic text-xl text-[#666666] mb-8">
              That's exactly why we're here.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="font-body font-light text-[#444444] text-lg leading-relaxed max-w-2xl space-y-4 mb-10">
              <p>
                Not every home is collection-ready on day one. Some need styling. Some
                need better photography. Some need a complete rethink of their guest
                experience.
              </p>
              <p>
                We work with a network of architects, interior designers, photographers,
                and local artisans to bring properties up to standard. From a weekend of
                staging to a full renovation — we scope it, manage it, and deliver it.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-2">
              {elevationTags.map((tag) => (
                <span
                  key={tag}
                  className="font-body font-light text-xs border border-[#e0e0e0] px-3 py-1.5 text-[#666666]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* S6: Contact */}
      <section className="bg-[#f5f3f0] section-padding">
        <div className="max-container max-w-2xl">
          <FadeIn>
            <h2 className="font-display text-3xl text-foreground mb-4">
              Let's talk about your property.
            </h2>
            <p className="font-body font-light text-[#444444] mb-8">
              Tell us about your property and what you're looking for. We'll get back to
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Property location (city, region, country)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className={`${inputClass} ${!formData.serviceType ? "text-[#999999]" : ""}`}
                >
                  <option value="" disabled>
                    What are you looking for?
                  </option>
                  {serviceTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Tell us about your property"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send inquiry"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      {/* S7: FAQ */}
      <section className="section-padding">
        <div className="max-container max-w-3xl">
          <FadeIn>
            <h2 className="font-display text-3xl text-foreground mb-8">
              Common questions
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-[#e0e0e0]">
                  <AccordionTrigger className="font-body text-sm text-foreground py-5 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-body font-light text-[#444444] text-sm leading-relaxed pb-5">
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
