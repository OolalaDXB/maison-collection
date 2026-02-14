import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AtlantiqueCrossSell = () => {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("properties")
      .select("slug, name, location, region, country, description, hero_image, price_per_night")
      .neq("slug", "atlantique")
      .order("display_order")
      .then(({ data }) => { if (data) setProperties(data); });
  }, []);

  if (properties.length === 0) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-[5%] py-16">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-8 text-center">
        Discover Our Other Properties
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((p) => (
          <Link
            key={p.slug}
            to={`/${p.slug}`}
            className="group block"
          >
            <div className="aspect-[4/3] bg-[hsl(0,0%,95%)] overflow-hidden mb-4">
              {p.hero_image ? (
                <img
                  src={p.hero_image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-body text-sm">
                  Photo coming soon
                </div>
              )}
            </div>
            <h4 className="font-display text-xl text-foreground mb-1">{p.name}</h4>
            <p className="font-body font-light text-sm text-muted-foreground mb-1">
              {p.location}, {p.country}
            </p>
            {p.price_per_night && (
              <p className="font-body font-light text-sm text-foreground">
                From {p.price_per_night}€ / night
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AtlantiqueCrossSell;
