import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Property } from "@/data/properties";
import FadeIn from "@/components/FadeIn";

interface PropertyCardProps {
  property: Property;
  index: number;
}

const locationLabels: Record<string, string> = {
  georgia: "Gudauri · Georgia",
  atlantique: "Quistinic · Brittany",
  arabia: "The Sustainable City · Dubai",
};

const multiCurrency: Record<string, string> = {
  georgia: "~$195 · 715 AED · 531 ₾",
  atlantique: "~£215 · ~$270",
  arabia: "~1,390 AED · ~$378",
};

const PropertyCard = ({ property, index }: PropertyCardProps) => {
  const { t } = useTranslation();
  const isComingSoon = property.status === "coming_soon";
  const locLabel = locationLabels[property.slug] || property.location;
  const currencies = multiCurrency[property.slug];

  return (
    <FadeIn delay={index * 0.15}>
      <Link to={`/${property.slug}`} className="group block">
        <div className="overflow-hidden bg-card border border-[#f0f0f0] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-[400ms]">
          <div className="relative h-[320px] overflow-hidden">
            {isComingSoon ? (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="font-display text-2xl italic text-muted-foreground">
                  {t("property_card.coming_soon")}
                </span>
              </div>
            ) : !property.heroImage ? (
              <div className="w-full h-full bg-[#f5f3f0] flex items-center justify-center">
                <span className="font-display text-2xl italic text-foreground/60">
                  {property.name}
                </span>
              </div>
            ) : (
              <img
                src={property.heroImage}
                alt={property.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            )}
            {property.tags.length > 0 && (
              <div className="absolute top-4 left-4 flex gap-2">
                {property.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs uppercase tracking-wider bg-background/90 backdrop-blur-sm text-foreground border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {property.airbnbRating && (
              <div className="absolute bottom-4 right-4 px-3 py-1 text-xs bg-background/90 backdrop-blur-sm text-foreground border border-border">
                ★ {property.airbnbRating}
                {property.tags.includes("Superhost") && " · Superhost"}
              </div>
            )}
          </div>
          <div className="p-6">
            <p className="font-body uppercase tracking-[0.12em] text-[0.7rem] text-[#999999] mb-1">
              {locLabel}
            </p>
            <h3 className="font-display text-2xl text-foreground mb-2">
              {property.name}
            </h3>
            <p className="text-sm font-light text-[#444444] leading-[1.75] mb-4 line-clamp-2">
              {property.description}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {property.areaSqm && (
                <span>
                  {property.areaSqm}m² · {property.capacity} {t("property_card.guests")}
                </span>
              )}
              <div className="text-right">
                {property.pricePerNight && (
                  <>
                    <span className="font-medium text-foreground">
                      {t("property_card.from")} €{property.pricePerNight}{t("property_card.per_night")}
                    </span>
                    {currencies && (
                      <p className="font-body font-light text-[0.75rem] text-[#999999] mt-0.5">
                        {currencies}
                      </p>
                    )}
                  </>
                )}
                {isComingSoon && (
                  <span className="text-primary font-medium">{t("property_card.opening_2026")}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
};

export default PropertyCard;
