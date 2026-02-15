import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FadeIn from "@/components/FadeIn";
import SEO from "@/components/SEO";
import { useSiteContent } from "@/hooks/useSiteContent";

const AboutPage = () => {
  const title = useSiteContent("about", "title", "Darya & Mickaël");
  const subtitle = useSiteContent("about", "subtitle", "About");
  const daryaP1 = useSiteContent("about", "darya_p1", "Darya is Franco-Russian, with deep local knowledge of both Brittany and the Caucasus. She brings trilingual fluency in French, English, and Russian — and with it, natural access to three distinct markets.");
  const daryaP2 = useSiteContent("about", "darya_p2", "She handles the daily operations: welcome, maintenance, listening. Same-day response, always before 10am. Guests don't interact with a platform. They interact with a person.");
  const philoTitle = useSiteContent("about", "philosophy_title", "Philosophy");
  const philoP1 = useSiteContent("about", "philosophy_p1", "Not an agency. Not endless scaling. Just houses cared for properly.");
  const philoP2 = useSiteContent("about", "philosophy_p2", "We are expatriate proprietors who returned to our roots to restore properties in places we know intimately. Every maison in our collection reflects a place we've lived, a landscape we've walked, a community we belong to.");
  const locationsLabel = useSiteContent("about", "locations_label", "Where we are");
  const signature = useSiteContent("about", "signature", "— Darya & Mickaël");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Maisons"
        description="We started with our own homes. Now we curate a collection of distinctive properties across Europe and beyond, each chosen with intention."
        path="/about"
      />
      <Header />

      <section className="section-padding pt-32 md:pt-40">
        <div className="max-container max-w-3xl">
          <FadeIn>
            <p className="section-label">{subtitle}</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-8">
              {title}
            </h1>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg">
              <p>{daryaP1}</p>
              <p>{daryaP2}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="border-t border-border my-16 pt-16">
              <h2 className="font-display text-3xl text-foreground mb-6">
                {philoTitle}
              </h2>
              <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg">
                <p>{philoP1}</p>
                <p>{philoP2}</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="border-t border-border pt-16">
              <p className="section-label mb-6">{locationsLabel}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-display text-xl mb-2">Dubai</h3>
                  <p className="text-sm text-muted-foreground">
                    Strategic oversight
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-xl mb-2">Brittany</h3>
                  <p className="text-sm text-muted-foreground">
                    Ground operations
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-xl mb-2">Gudauri</h3>
                  <p className="text-sm text-muted-foreground">Local team</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="font-display italic text-xl text-primary mt-16">
              {signature}
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;