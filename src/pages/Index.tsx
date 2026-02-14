import { Link } from "react-router-dom";
import { properties } from "@/data/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/PropertyCard";
import FadeIn from "@/components/FadeIn";

const services = [
  {
    icon: "◇",
    title: "Selection & Positioning",
    description:
      "We identify properties with character and potential, transforming them into memorable destinations with narrative positioning and editorial storytelling.",
  },
  {
    icon: "◎",
    title: "Management",
    description:
      "Complete operational management: welcome, maintenance, guest screening, multilingual support in French, English, and Russian. Same-day response.",
  },
  {
    icon: "△",
    title: "Revenue",
    description:
      "Intelligent pricing strategy, occupancy optimization focused on quality over volume. We position your property above the ordinary.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-screen flex items-end">
        <div className="absolute inset-0">
          <img
            src={properties[0].heroImage}
            alt="Maison Georgia — Mountain duplex in the Caucasus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,0%,0.7)] via-[hsl(0,0%,0%,0.2)] to-transparent" />
        </div>
        <div className="relative z-10 max-container px-[5%] pb-20 md:pb-28 w-full">
          <FadeIn>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-[hsl(0,0%,100%)] mb-6 max-w-3xl">
              Houses with a point of view
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-base md:text-lg text-[hsl(0,0%,80%)] max-w-xl mb-8 font-light">
              A collection of distinctive homes across Europe and the Caucasus.
              Each property tells a story, shaped by its landscape and chosen
              with intention.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <a
              href="#collection"
              className="inline-block px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm uppercase tracking-[0.1em]"
            >
              Discover the Collection
            </a>
          </FadeIn>
          {/* Badge */}
          <FadeIn delay={0.5}>
            <div className="absolute bottom-20 md:bottom-28 right-[5%] hidden md:block">
              <div className="px-4 py-2 bg-[hsl(0,0%,100%,0.12)] backdrop-blur-md border border-[hsl(0,0%,100%,0.2)] text-[hsl(0,0%,100%)] text-sm">
                5.0 · 20+ reviews · Guest Favourite
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">The Collection</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-16 max-w-2xl">
              Each maison is selected for its character, its relationship to
              place.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, i) => (
              <PropertyCard key={property.slug} property={property} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="dark-section section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label text-terra-cotta-light">Philosophy</p>
            <h2 className="font-display text-3xl md:text-4xl text-[hsl(0,0%,100%)] mb-8 max-w-2xl">
              Not rentals. Residences.
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-[hsl(0,0%,70%)] text-lg max-w-2xl mb-12 font-light leading-relaxed">
              We don't believe in vacation rentals. We believe in places that
              change how you see the world — houses that become part of your
              story, not just your itinerary.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <blockquote className="font-display italic text-2xl md:text-3xl text-primary max-w-lg">
              "Where houses become places."
            </blockquote>
          </FadeIn>
        </div>
      </section>

      {/* Services Preview */}
      <section className="warm-section section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">Services</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 max-w-2xl">
              Beyond hospitality
            </h2>
            <p className="text-muted-foreground max-w-xl mb-16 font-light">
              We also partner with select property owners to bring their vision to life.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.1}>
                <div className="p-8 bg-background border border-border hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
                  <span className="inline-flex items-center justify-center w-12 h-12 border border-primary text-primary text-lg mb-6">
                    {service.icon}
                  </span>
                  <h3 className="font-display text-xl mb-3">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <Link
              to="/management"
              className="inline-block text-sm text-primary hover:underline underline-offset-4 transition-all"
            >
              Learn about our management services →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">About</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 max-w-2xl">
              Darya & Micka&euml;l
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-muted-foreground max-w-2xl mb-8 font-light leading-relaxed">
              Expatriate proprietors who returned to their roots to restore
              properties in places they know intimately. Not an agency. Not
              endless scaling. Just houses cared for properly.
            </p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <Link
              to="/about"
              className="inline-block text-sm text-primary hover:underline underline-offset-4 transition-all"
            >
              Read our story →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Contact */}
      <section className="warm-section section-padding">
        <div className="max-container text-center">
          <FadeIn>
            <p className="section-label">Contact</p>
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-8">
              Let's talk
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <a
              href="mailto:chez@maisons.co"
              className="font-display text-xl md:text-2xl text-primary hover:underline underline-offset-4 transition-all"
            >
              chez@maisons.co
            </a>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
