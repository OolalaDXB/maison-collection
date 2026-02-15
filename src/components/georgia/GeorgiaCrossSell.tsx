import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import atlantiqueHero from "@/assets/atlantique-hero.png";

const localHeroFallback: Record<string, string> = {
  atlantique: atlantiqueHero,
};

const GeorgiaCrossSell = () => {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("properties")
      .select("slug, name, location, region, country, description, hero_image, price_per_night, status")
      .neq("slug", "georgia")
      .order("display_order")
      .then(({ data }) => { if (data) setProperties(data); });
  }, []);

  if (properties.length === 0) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-[5%] py-16">
      <h3 className="font-body uppercase tracking-[0.15em] text-[0.7rem] text-[#999999] font-normal mb-8 text-center">
        Discover Our Other Properties
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((p) => {
          const heroSrc = p.hero_image || localHeroFallback[p.slug];
          const isComingSoon = p.status === "coming_soon";
          return (
            <Link key={p.slug} to={`/${p.slug}`} className="group block">
              <div className="aspect-[4/3] bg-[hsl(0,0%,95%)] overflow-hidden mb-4">
                {heroSrc ? (
                  <img
                    src={heroSrc}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">
                    Coming Soon
                  </div>
                )}
              </div>
              <p className="font-body uppercase tracking-[0.12em] text-[0.7rem] text-[#999999] mb-1">
                {p.location}, {p.country}
              </p>
              <h4 className="font-display text-xl text-foreground mb-1">{p.name}</h4>
              {p.price_per_night && !isComingSoon ? (
                <p className="font-body font-light text-sm text-foreground">
                  From {p.price_per_night}€ / night
                </p>
              ) : isComingSoon ? (
                <p className="font-body font-light text-sm text-primary">Opening 2026</p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GeorgiaCrossSell;
