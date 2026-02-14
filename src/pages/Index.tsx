import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Star, Award, Heart } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { properties } from "@/data/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/PropertyCard";
import FadeIn from "@/components/FadeIn";
import { useSiteContent } from "@/hooks/useSiteContent";

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

const AnimatedRating = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 50;
    const increment = 5.0 / steps;
    const stepTime = duration / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= 5.0) {
        setValue(5.0);
        clearInterval(interval);
      } else {
        setValue(Math.round(current * 10) / 10);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [isInView]);

  return <span ref={ref}>{value.toFixed(1)}</span>;
};

const Index = () => {
  const heroTitle = useSiteContent("home", "hero_title", "Houses with a point of view");
  const heroSubtitle = useSiteContent("home", "hero_subtitle", "A collection of distinctive homes across Europe and the Caucasus. Each property tells a story, shaped by its landscape and chosen with intention.");
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

      {/* Trust Section */}
      <section className="bg-[#0a1628] py-[80px] md:py-[120px]">
        <div className="max-container px-[5%] text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star size={28} className="text-[#c1695f] fill-[#c1695f]" />
              <span className="font-display text-5xl text-white">
                <AnimatedRating />
              </span>
            </div>
            <p className="font-body font-light text-white/70 text-base mb-16">
              — across all properties
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Award, title: "Superhost", subtitle: "Awarded for outstanding hospitality" },
              { icon: Heart, title: "Guest Favourite", subtitle: "Among the highest-rated homes on Airbnb" },
              { icon: Star, title: "30+ Reviews", subtitle: "Every single one — five stars" },
            ].map((badge, i) => (
              <FadeIn key={badge.title} delay={i * 0.2}>
                <div className="border border-[rgba(255,255,255,0.3)] px-8 py-6 text-center">
                  <badge.icon size={20} className="text-white mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-body uppercase tracking-wider text-sm text-white mb-1">{badge.title}</p>
                  <p className="font-body font-light text-xs text-[rgba(255,255,255,0.6)]">{badge.subtitle}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="dark-section section-padding">
        <div className="max-container">
          <FadeIn>
            <p className="section-label" style={{ color: "#999999" }}>Philosophy</p>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-8 max-w-2xl">
              {philosophyTitle}
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-[rgba(255,255,255,0.7)] text-lg max-w-2xl mb-12 font-light leading-relaxed">
              {philosophyText}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <blockquote className="font-display italic text-2xl md:text-3xl text-[rgba(255,255,255,0.85)] max-w-lg">
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
            <p className="font-light text-[#444444] leading-[1.75] max-w-xl mb-16">
              We also partner with select property owners to bring their vision to life.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {services.map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.1}>
                <div className="p-8 bg-background border border-[#f0f0f0] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500">
                  <span className="inline-flex items-center justify-center w-12 h-12 border border-[#e0e0e0] text-foreground text-lg mb-6">
                    {service.icon}
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
            className="bg-white p-12 md:p-16"
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
            className="bg-[#f5f3f0] p-12 md:p-16"
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
