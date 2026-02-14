import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { properties } from "@/data/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/PropertyCard";
import FadeIn from "@/components/FadeIn";
import { useSiteContent } from "@/hooks/useSiteContent";

const services = [
  {
    num: "01",
    title: "Selection & Positioning",
    description:
      "We identify properties with character and potential, transforming them into memorable destinations with narrative positioning and editorial storytelling.",
  },
  {
    num: "02",
    title: "Management",
    description:
      "Complete operational management: welcome, maintenance, guest screening, multilingual support in French, English, and Russian. Same-day response.",
  },
  {
    num: "03",
    title: "Revenue",
    description:
      "Intelligent pricing strategy, occupancy optimization focused on quality over volume. We position your property above the ordinary.",
  },
];

const Index = () => {
  const heroTitle = useSiteContent("home", "hero_title", "Houses with a point of view");
  const heroSubtitle = useSiteContent("home", "hero_subtitle", "A collection of distinctive homes across Europe, the Caucasus, and the Gulf.");
  const philosophyTitle = useSiteContent("home", "philosophy_title", "Not rentals. Residences.");
  const philosophyText = useSiteContent("home", "philosophy_text", "We don't believe in vacation rentals. We believe in places that change how you see the world — houses that become part of your story, not just your itinerary.");

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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.40)]" />
        </div>
        <div className="relative z-10 max-container px-[5%] pb-20 md:pb-28 w-full">
          <FadeIn>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 max-w-3xl">
              {heroTitle}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-base md:text-lg text-[rgba(255,255,255,0.8)] max-w-xl mb-8 font-light">
              {heroSubtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap gap-4">
              <a
                href="#collection"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 text-sm uppercase tracking-[0.1em]"
              >
                Discover the Collection
              </a>
              <Link
                to="/management"
                className="inline-block px-8 py-3 border border-[rgba(255,255,255,0.5)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-all duration-300 text-sm uppercase tracking-[0.1em]"
              >
                Entrust your property
              </Link>
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

      {/* Social Proof — compact, light */}
      <section className="bg-[#fafaf8] py-16 md:py-20">
        <div className="max-container px-[5%]">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-3">
                <Star size={16} className="text-primary fill-primary" />
                <span className="font-display text-2xl text-foreground">5.0</span>
                <span className="font-body font-light text-sm text-[#666666]">
                  across all properties · Superhost · Guest Favourite · 30+ five-star reviews
                </span>
              </div>
              <div className="w-[200px] h-px bg-[#e8e8e8]" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Philosophy — light */}
      <section className="section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">Philosophy</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8 max-w-2xl">
              {philosophyTitle}
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-[#444444] text-lg max-w-2xl mb-12 font-light leading-relaxed">
              {philosophyText}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <blockquote className="font-display italic text-2xl text-primary max-w-lg mb-6">
              "Where houses become places."
            </blockquote>
            <div className="w-[60px] h-px bg-[#e8e8e8]" />
          </FadeIn>
        </div>
      </section>

      {/* Services Preview */}
      <section className="bg-[#f5f3f0] section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">Services</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 max-w-2xl">
              Beyond hospitality
            </h2>
            <p className="font-light text-[#444444] leading-[1.75] max-w-xl mb-16">
              We also partner with select property owners to bring their vision to life.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.1}>
                <div className="p-8 bg-background border border-[#eeeeee] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
                  <span className="font-display text-2xl text-[#e0e0e0] block mb-6">
                    {service.num}
                  </span>
                  <h3 className="font-display text-xl mb-3">{service.title}</h3>
                  <p className="text-sm font-light text-[#444444] leading-[1.75]">
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
            <p className="font-light text-[#444444] leading-[1.75] max-w-2xl mb-8">
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

      {/* Dual CTA */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#fafaf8] p-12 md:p-16"
          >
            <p className="font-body uppercase tracking-[0.15em] text-[0.7rem] text-[#999999] mb-4">For Travelers</p>
            <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Stay in homes with a point of view.
            </h3>
            <p className="font-body font-light text-[#444444] leading-relaxed mb-8">
              Few properties, high standards, real people behind every stay.
            </p>
            <a
              href="#collection"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity"
            >
              Browse the collection
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#f0ede8] p-12 md:p-16"
          >
            <p className="font-body uppercase tracking-[0.15em] text-[0.7rem] text-[#999999] mb-4">For Owners</p>
            <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              We don't manage every property.
            </h3>
            <p className="font-body font-light text-[#444444] leading-relaxed mb-8">
              Just the ones worth it. And if yours isn't ready yet — we'll get it there.
            </p>
            <Link
              to="/management"
              className="inline-block px-8 py-3 border border-primary text-primary text-sm uppercase tracking-[0.1em] hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Talk to us
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
