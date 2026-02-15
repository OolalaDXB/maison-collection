import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";

const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedProperty = searchParams.get("property") || "";
  const preselectedType = searchParams.get("type") || "booking";

  const [inquiryType, setInquiryType] = useState<"booking" | "collaboration">(
    preselectedType === "collaboration" ? "collaboration" : "booking"
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    property: preselectedProperty,
    message: "",
    dates: "",
    guests: "",
    propertyLocation: "",
    propertyType: "",
  });

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

    const message =
      inquiryType === "booking"
        ? `[Booking Inquiry]\nProperty: ${form.property}\nDates: ${form.dates}\nGuests: ${form.guests}\n\n${form.message}`
        : `[Collaboration Inquiry]\nProperty location: ${form.propertyLocation}\nProperty type: ${form.propertyType}\n\n${form.message}`;

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        type: inquiryType === "booking" ? "booking" : "management",
        subject: inquiryType === "booking" ? "Booking Inquiry" : "Property Collaboration",
        message,
      } as any);
      if (error) throw error;
      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch {
      window.location.href = `mailto:chez@maisons.co?subject=${encodeURIComponent(
        inquiryType === "booking" ? "Booking Inquiry" : "Collaboration Inquiry"
      )}&body=${encodeURIComponent(message)}`;
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-border bg-background text-foreground text-sm font-body focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact"
        description="Get in touch for a booking inquiry or to discuss managing your property with Maisons. We respond within 24 hours."
        path="/contact"
      />
      <Header />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-container max-w-[600px] mx-auto">
          <FadeIn>
            <p className="section-label">Contact</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Get in touch
            </h1>
            <p className="text-muted-foreground font-light mb-8">
              Whether you'd like to book a stay or discuss managing your property with us.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            {submitted ? (
              <div className="text-center py-16">
                <p className="font-display text-lg italic text-primary mb-2">
                  Thank you for reaching out.
                </p>
                <p className="text-sm text-muted-foreground">
                  Managed by Darya — Response within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Toggle */}
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setInquiryType("booking")}
                    className={`flex-1 py-3 font-body uppercase text-xs tracking-[0.1em] border transition-colors ${
                      inquiryType === "booking"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:border-foreground"
                    }`}
                  >
                    Booking Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryType("collaboration")}
                    className={`flex-1 py-3 font-body uppercase text-xs tracking-[0.1em] border border-l-0 transition-colors ${
                      inquiryType === "collaboration"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:border-foreground"
                    }`}
                  >
                    Property Collaboration
                  </button>
                </div>

                {/* Common fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your name *"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder="Your email *"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />

                {/* Booking-specific */}
                {inquiryType === "booking" && (
                  <>
                    <select
                      value={form.property}
                      onChange={(e) => setForm({ ...form, property: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Select a property</option>
                      <option value="georgia">Maison Georgia</option>
                      <option value="atlantique">Maison Atlantique</option>
                      <option value="arabia">Maison Arabia</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Preferred dates (e.g. 15-20 March 2026)"
                      value={form.dates}
                      onChange={(e) => setForm({ ...form, dates: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="Number of guests"
                      value={form.guests}
                      onChange={(e) => setForm({ ...form, guests: e.target.value })}
                      className={inputClass}
                    />
                  </>
                )}

                {/* Collaboration-specific */}
                {inquiryType === "collaboration" && (
                  <>
                    <input
                      type="text"
                      placeholder="Property location"
                      value={form.propertyLocation}
                      onChange={(e) =>
                        setForm({ ...form, propertyLocation: e.target.value })
                      }
                      className={inputClass}
                    />
                    <select
                      value={form.propertyType}
                      onChange={(e) =>
                        setForm({ ...form, propertyType: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">Property type</option>
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="other">Other</option>
                    </select>
                  </>
                )}

                <textarea
                  placeholder={
                    inquiryType === "booking"
                      ? "Any special requests or questions"
                      : "Tell us about your property *"
                  }
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${inputClass} resize-none`}
                  required={inquiryType === "collaboration"}
                />

                {turnstileSiteKey && (
                  <Turnstile
                    siteKey={turnstileSiteKey}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => setTurnstileToken(null)}
                    onExpire={() => setTurnstileToken(null)}
                    options={{ theme: "light", size: "normal" }}
                  />
                )}

                <button
                  type="submit"
                  disabled={submitting || (!!turnstileSiteKey && !turnstileToken)}
                  className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send Message"}
                </button>

                <p className="text-xs text-muted-foreground">
                  Managed by Darya — Response within 24 hours.
                </p>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
