import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-container max-w-2xl">
          <FadeIn>
            <p className="section-label">Contact</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Let's talk
            </h1>
            <p className="text-muted-foreground font-light mb-4">
              For reservations, partnerships, or property management inquiries.
            </p>
            <a
              href="mailto:chez@maisons.co"
              className="inline-block font-display text-xl text-primary hover:underline underline-offset-4 mb-4"
            >
              chez@maisons.co
            </a>
            <div className="flex gap-6 text-sm text-muted-foreground mb-16">
              <a
                href="https://www.airbnb.com/h/gudaurichalet"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Georgia on Airbnb ↗
              </a>
              <a
                href="https://www.airbnb.com/l/LEHC2J81"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Atlantique on Airbnb ↗
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
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
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="general">General Inquiry</option>
                  <option value="booking">Booking</option>
                  <option value="management">Property Management</option>
                  <option value="partnership">Partnership</option>
                </select>
                <textarea
                  placeholder="Your message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity"
                >
                  Send Message
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
