import { lazy, Suspense } from "react";
import { icons, type LucideProps } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { usePropertyRegion } from "@/hooks/usePropertyRegion";

interface Props {
  propertyId: string;
  /** Region photos are still passed in from the page (local assets) */
  photos?: { src: string; alt: string; caption?: string }[];
}

const getIcon = (iconName: string) => {
  const Icon = (icons as any)[iconName];
  return Icon || icons.MapPin;
};

const PropertyCommunity = ({ propertyId, photos = [] }: Props) => {
  const { data: region } = usePropertyRegion(propertyId);

  if (!region?.content) return null;

  const { content, cards, links } = region;

  return (
    <section className="bg-[#0a1628] py-16 md:py-20 px-[5%]">
      <div className="max-w-[1200px] mx-auto">
        <FadeIn>
          {content.subtitle && (
            <p className="font-body uppercase tracking-wider text-[0.7rem] text-white/60 mb-3">
              {content.subtitle}
            </p>
          )}
          <h3 className="font-display font-normal text-3xl text-white mb-2">
            {content.title}
          </h3>
          {content.tagline && (
            <p className="font-body font-light text-lg text-white/70 mb-8">
              {content.tagline}
            </p>
          )}

          {content.intro_text && (
            <div className="max-w-2xl mb-10">
              {content.intro_text.split("\n\n").map((paragraph, i) => (
                <p key={i} className="font-body font-light text-white/80 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </FadeIn>

        {/* Region photos */}
        {photos.length > 0 && (
          <div className={`grid gap-3 mb-10 ${photos.length === 4 ? "grid-cols-2 md:grid-cols-4" : `grid-cols-1 md:grid-cols-${Math.min(photos.length, 3)}`}`}>
            {photos.map((photo, i) => (
              <FadeIn key={photo.alt} delay={i * 0.15}>
                <div className="relative overflow-hidden group">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-[220px] md:h-[260px] object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {photo.caption && (
                    <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 font-body font-light text-xs text-white/80">
                      {photo.caption}
                    </p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 mb-10 ${cards.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : `md:grid-cols-${Math.min(cards.length, 3)}`}`}>
            {cards.map((card, i) => {
              const IconComponent = getIcon(card.icon);
              return (
                <FadeIn key={card.id} delay={i * 0.2}>
                  <div className="border border-white/20 px-6 py-5 h-full flex flex-col">
                    <IconComponent size={24} className="text-white mb-3 shrink-0" strokeWidth={1.5} />
                    <h4 className="font-body font-medium text-sm text-white mb-2">{card.title}</h4>
                    <p className="font-body font-light text-sm text-white/70 leading-relaxed flex-1">{card.text}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {links.length > 0 && (
          <FadeIn delay={0.6}>
            <div className="flex flex-wrap gap-6">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-light text-sm text-white/60 hover:text-white transition-colors"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
};

export default PropertyCommunity;
