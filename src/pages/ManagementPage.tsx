import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";

const services = [
  {
    icon: "◇",
    title: "Curation",
    description:
      "Narrative positioning, editorial storytelling. Competitive benchmarking, strategic recommendations for distinctive properties.",
  },
  {
    icon: "△",
    title: "Revenue Optimization",
    description:
      "Intelligent pricing strategy focused on quality over volume. Occupancy management, forecast modeling, seasonal strategy.",
  },
  {
    icon: "◎",
    title: "Premium Operations",
    description:
      "Automated yet human workflows. Same-day response before 10am. Guest screening and filtering. Community building over passing tourists.",
  },
  {
    icon: "◆",
    title: "Narrative & Brand",
    description:
      "Editorial storytelling for each property. Professional photography strategy. Consistent brand identity across your portfolio.",
  },
  {
    icon: "◯",
    title: "Multilingual Support",
    description:
      "Operations in French, English, and Russian. Natural access to francophone, anglophone, and Russian markets.",
  },
  {
    icon: "⬡",
    title: "Full Management",
    description:
      "Complete delegation from listing to guest departure. Ground operations combined with strategic oversight from Dubai.",
  },
];

const ManagementPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    property: "",
    services: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="section-padding pt-32 md:pt-40">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">Maisons Management</p>
            <h1 className="font-display text-4xl md:text-6xl text-foreground mb-6 max-w-3xl">
              Beyond Hospitality
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg text-muted-foreground max-w-2xl font-light leading-relaxed">
              For property owners who want more than a key handover. We bring
              editorial thinking, operational excellence, and genuine care to
              every maison we manage.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding pt-16">
        <div className="max-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.08}>
                <div className="p-8 bg-card border border-border hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 h-full">
                  <span className="inline-flex items-center justify-center w-12 h-12 border border-primary text-primary text-lg mb-6">
                    {service.icon}
                  </span>
                  <h3 className="font-display text-xl mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Cases */}
      <section className="warm-section section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">Track Record</p>
            <h2 className="font-display text-3xl mb-12">Proven results</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <div className="p-8 bg-background border border-border">
                <p className="section-label mb-2">Maison Georgia</p>
                <h3 className="font-display text-2xl mb-4">Gudauri, Caucasus</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>€35,000/year revenue</p>
                  <p>5.0 stars · 20+ reviews</p>
                  <p>Superhost · Guest Favourite</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="p-8 bg-background border border-border">
                <p className="section-label mb-2">Maison Atlantique</p>
                <h3 className="font-display text-2xl mb-4">Quistinic, Brittany</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Architecture by Anthropie (2023)</p>
                  <p>Featured in Archibien, Houzz</p>
                  <p>5.0 stars</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding">
        <div className="max-container max-w-2xl">
          <FadeIn>
            <p className="section-label">Get in touch</p>
            <h2 className="font-display text-3xl mb-8">
              Tell us about your property
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            {submitted ? (
              <p className="font-display text-lg italic text-primary">
                Thank you. We'll review your inquiry and respond within 24 hours.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <textarea
                  placeholder="Describe your property"
                  rows={4}
                  value={formData.property}
                  onChange={(e) =>
                    setFormData({ ...formData, property: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ManagementPage;
