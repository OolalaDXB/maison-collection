import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroImage from "@/components/HeroImage";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { properties } from "@/data/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/PropertyCard";
import FadeIn from "@/components/FadeIn";
import SEO from "@/components/SEO";
import { OrganizationSchema } from "@/components/StructuredData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { t } = useTranslation();
  const [heroOverrides, setHeroOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchHeroes = async () => {
      const { data } = await supabase.from("properties").select("slug, hero_image").not("hero_image", "is", null);
      if (data) {
        const overrides: Record<string, string> = {};
        data.forEach((p: any) => { if (p.hero_image) overrides[p.slug] = p.hero_image; });
        setHeroOverrides(overrides);
      }
    };
    fetchHeroes();
  }, []);

  const enrichedProperties = properties.map(p => ({
    ...p,
    heroImage: p.heroImage || heroOverrides[p.slug] || "",
  }));

  // All editorial content from DB
  const heroTitle = useSiteContent("home", "hero_title", "Houses with a point of view");
  const heroSubtitle = useSiteContent("home", "hero_subtitle", "A collection of distinctive homes across Europe, the Caucasus, and the Gulf.");
  const collectionLabel = useSiteContent("home", "collection_label", "The Collection");
  const collectionTitle = useSiteContent("home", "collection_title", "Each maison is selected for its character, its relationship to place.");
  const socialProof = useSiteContent("home", "social_proof", "across all properties · Superhost · Guest Favourite · 30+ five-star reviews");
  const philosophyLabel = useSiteContent("home", "philosophy_label", "Philosophy");
  const philosophyTitle = useSiteContent("home", "philosophy_title", "Not rentals. Residences.");
  const philosophyText = useSiteContent("home", "philosophy_text", "We don't believe in vacation rentals. We believe in places that change how you see the world — houses that become part of your story, not just your itinerary.");
  const philosophyQuote = useSiteContent("home", "philosophy_quote", "Where houses become places.");
  const servicesLabel = useSiteContent("home", "services_label", "Services");
  const servicesTitle = useSiteContent("home", "services_title", "Beyond hospitality");
  const servicesDesc = useSiteContent("home", "services_desc", "We also partner with select property owners to bring their vision to life.");
  const s1Title = useSiteContent("home", "s1_title", "Selection & Positioning");
  const s1Desc = useSiteContent("home", "s1_desc", "We identify properties with character and potential, transforming them into memorable destinations with narrative positioning and editorial storytelling.");
  const s2Title = useSiteContent("home", "s2_title", "Management");
  const s2Desc = useSiteContent("home", "s2_desc", "Complete operational management: welcome, maintenance, guest screening, multilingual support in French, English, and Russian. Same-day response.");
  const s3Title = useSiteContent("home", "s3_title", "Revenue");
  const s3Desc = useSiteContent("home", "s3_desc", "Intelligent pricing strategy, occupancy optimization focused on quality over volume. We position your property above the ordinary.");
  const servicesLink = useSiteContent("home", "services_link", "Learn about our management services →");
  const aboutDesc = useSiteContent("home", "about_desc", "Expatriate proprietors who returned to their roots to restore properties in places they know intimately. Not an agency. Not endless scaling. Just houses cared for properly.");
  const aboutLink = useSiteContent("home", "about_link", "Read our story →");
  const ctaDiscover = useSiteContent("home", "cta_discover", "Discover the Collection");
  const ctaEntrust = useSiteContent("home", "cta_entrust", "Entrust your property");
  const travelersLabel = useSiteContent("home", "travelers_label", "For Travelers");
  const travelersTitle = useSiteContent("home", "travelers_title", "Stay in homes with a point of view.");
  const travelersDesc = useSiteContent("home", "travelers_desc", "Few properties, high standards, real people behind every stay.");
  const travelersCta = useSiteContent("home", "travelers_cta", "Browse the collection");
  const ownersLabel = useSiteContent("home", "owners_label", "For Owners");
  const ownersTitle = useSiteContent("home", "owners_title", "We don't manage every property.");
  const ownersDesc = useSiteContent("home", "owners_desc", "Just the ones worth it. And if yours isn't ready yet — we'll get it there.");
  const ownersCta = useSiteContent("home", "owners_cta", "Talk to us");

  const services = [
    { num: "01", title: s1Title, description: s1Desc },
    { num: "02", title: s2Title, description: s2Desc },
    { num: "03", title: s3Title, description: s3Desc },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Maisons — Houses with a point of view"
        description="A collection of distinctive homes in Brittany, the Caucasus, and Dubai. Each property tells a story, shaped by its landscape and chosen with intention."
        path="/"
      />
      <OrganizationSchema name="Maisons" url="https://maisons.co" email="chez@maisons.co" />
      <Header />

      {/* Hero */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <HeroImage
            src={properties[0].heroImage}
            alt="Maison Georgia — Mountain duplex in the Caucasus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.40)]" />
        </div>
        <div className="relative z-10 max-container px-[5%] pb-20 md:pb-28 w-full">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 max-w-3xl">
            {heroTitle}
          </h1>
          <p className="text-base md:text-lg text-[rgba(255,255,255,0.8)] max-w-xl mb-8 font-light">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#collection"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 text-sm uppercase tracking-[0.1em]"
            >
              {ctaDiscover}
            </a>
            <Link
              to="/management"
              className="inline-block px-8 py-3 border border-[rgba(255,255,255,0.5)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-all duration-300 text-sm uppercase tracking-[0.1em]"
            >
              {ctaEntrust}
            </Link>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="py-10 md:py-14 px-[5%]">
        <div className="max-container">
          <FadeIn>
            <p className="section-label">{collectionLabel}</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-16 max-w-2xl">
              {collectionTitle}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrichedProperties.map((property, i) => (
              <PropertyCard key={property.slug} property={property} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="pt-12 pb-8 px-[5%] bg-background">
        <div className="max-container text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Star size={28} className="text-primary fill-primary" />
              <span className="font-display text-4xl md:text-5xl text-foreground">5.0</span>
              <span className="font-body text-lg md:text-xl text-[hsl(0,0%,33%)]">
                {socialProof}
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Philosophy */}
      <section className="pt-8 pb-12 px-[5%] bg-background">
        <div className="max-container">
          <div className="border-t-2 border-[hsl(0,0%,88%)] mb-8 md:mb-10" />
          <FadeIn>
            <p className="section-label">{philosophyLabel}</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 max-w-2xl">
              {philosophyTitle}
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-muted-foreground text-lg max-w-2xl mb-6 font-light leading-relaxed">
              {philosophyText}
            </p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <blockquote className="font-display italic text-2xl text-primary max-w-lg">
              "{philosophyQuote}"
            </blockquote>
          </FadeIn>
        </div>
      </section>

      {/* Services Preview */}
      <section className="pt-8 pb-12 px-[5%] bg-background">
        <div className="max-container">
          <div className="border-t-2 border-[hsl(0,0%,88%)] mb-8 md:mb-10" />
          <FadeIn>
            <p className="section-label">{servicesLabel}</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 max-w-2xl">
              {servicesTitle}
            </h2>
            <p className="font-light text-muted-foreground leading-[1.75] max-w-xl mb-8">
              {servicesDesc}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {services.map((service, i) => (
              <FadeIn key={service.num} delay={i * 0.1} className="h-full">
                <div className="h-full p-8 bg-background border border-border hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col">
                  <span className="font-display text-2xl text-border block mb-4">
                    {service.num}
                  </span>
                  <h3 className="font-display text-xl mb-2">{service.title}</h3>
                  <p className="text-sm font-light text-muted-foreground leading-[1.75]">
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
              {servicesLink}
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* About Preview */}
      <section className="pt-8 pb-12 px-[5%] bg-background">
        <div className="max-container">
          <div className="border-t-2 border-[hsl(0,0%,88%)] mb-8 md:mb-10" />
          <FadeIn>
            <p className="section-label">{t("nav.about")}</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 max-w-2xl">
              Darya & Micka&euml;l
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="font-light text-muted-foreground leading-[1.75] max-w-2xl mb-6">
              {aboutDesc}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Link
              to="/about"
              className="inline-block text-sm text-primary hover:underline underline-offset-4 transition-all"
            >
              {aboutLink}
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="pt-8 pb-16 bg-background">
        <div className="max-container px-[5%]">
          <div className="border-t-2 border-[hsl(0,0%,88%)] mb-8 md:mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2">
            <FadeIn>
              <div className="py-4 pr-4 md:pr-16">
                <p className="font-body uppercase tracking-[0.15em] text-[0.7rem] text-muted-foreground mb-3">{travelersLabel}</p>
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                  {travelersTitle}
                </h3>
                <p className="font-body font-light text-muted-foreground leading-relaxed mb-6">
                  {travelersDesc}
                </p>
                <a
                  href="#collection"
                  className="inline-block px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity"
                >
                  {travelersCta}
                </a>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="py-4 pl-4 md:pl-16 border-t md:border-t-0 md:border-l border-border mt-8 md:mt-0 pt-8 md:pt-4">
                <p className="font-body uppercase tracking-[0.15em] text-[0.7rem] text-muted-foreground mb-3">{ownersLabel}</p>
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                  {ownersTitle}
                </h3>
                <p className="font-body font-light text-muted-foreground leading-relaxed mb-6">
                  {ownersDesc}
                </p>
                <Link
                  to="/management"
                  className="inline-block px-8 py-3 border border-primary text-primary text-sm uppercase tracking-[0.1em] hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {ownersCta}
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;