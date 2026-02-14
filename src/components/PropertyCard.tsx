import { Link } from "react-router-dom";
import type { Property } from "@/data/properties";
import FadeIn from "@/components/FadeIn";

interface PropertyCardProps {
  property: Property;
  index: number;
}

const PropertyCard = ({ property, index }: PropertyCardProps) => {
  const isComingSoon = property.status === "coming_soon";

  return (
    <FadeIn delay={index * 0.15}>
      <Link
        to={`/${property.slug}`}
        className="group block"
      >
        <div className="overflow-hidden bg-card border border-border">
          {/* Image */}
          <div className="relative h-[320px] overflow-hidden">
            {isComingSoon ? (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="font-display text-2xl italic text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            ) : (
              <img
                src={property.heroImage}
                alt={property.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            {/* Tags */}
            {property.tags.length > 0 && (
              <div className="absolute top-4 left-4 flex gap-2">
                {property.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs uppercase tracking-wider bg-background/90 backdrop-blur-sm text-foreground border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Rating badge */}
            {property.airbnbRating && (
              <div className="absolute bottom-4 right-4 px-3 py-1 text-xs bg-background/90 backdrop-blur-sm text-foreground border border-border">
                ★ {property.airbnbRating}
                {property.tags.includes("Superhost") && " · Superhost"}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 transition-transform duration-500 group-hover:-translate-y-1">
            <p className="section-label mb-2">{property.location}</p>
            <h3 className="font-display text-2xl text-foreground mb-2">
              {property.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
              {property.description}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {property.areaSqm && (
                <span>
                  {property.areaSqm}m² · {property.capacity} guests
                </span>
              )}
              {property.pricePerNight && (
                <span className="font-medium text-foreground">
                  From €{property.pricePerNight}/night
                </span>
              )}
              {isComingSoon && (
                <span className="text-primary font-medium">Opening 2026</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
};

export default PropertyCard;
