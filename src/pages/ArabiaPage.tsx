import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";

const ArabiaPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="min-h-screen flex items-center justify-center section-padding pt-32">
        <div className="max-container text-center">
          <FadeIn>
            <p className="section-label mb-6">Coming Soon</p>
            <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">
              Maison Arabia
            </h1>
            <p className="font-display text-xl text-primary italic mb-8">
              Dubai · Opening 2026
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-muted-foreground max-w-md mx-auto mb-12 font-light leading-relaxed">
              Our next chapter unfolds in the Gulf. A new maison is being
              assembled with the same intention and care that defines our
              collection.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            {submitted ? (
              <p className="text-primary font-display text-lg italic">
                Thank you. We'll be in touch.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity"
                >
                  Join Waitlist
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

export default ArabiaPage;
