import heroImg from "@/assets/atlantique-hero.avif";
import type { PropertyData } from "@/hooks/useProperty";

interface AtlantiqueHeroProps {
  property: PropertyData | null;
  imageCount: number;
}

const AtlantiqueHero = ({ property, imageCount }: AtlantiqueHeroProps) => {
  const name = property?.name ?? "Maison Atlantique";
  const location = property ? `${property.location} · ${property.region} · ${property.country}` : "Quistinic · Brittany · France";
  const specs = property
    ? `${property.capacity ?? 6} guests · ${property.bedrooms ?? 2} bedrooms · ${property.bathrooms ?? 2} bathrooms · ${property.area_sqm ?? 120}m²`
    : "6 guests · 2 bedrooms · 3 beds · 2 bathrooms · 120m² + terraces · 5 000m²";

  const handleViewPhotos = () => {
    const el = document.getElementById("atlantique-gallery");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] mt-[72px] bg-[#2a2a2a]">
      <img
        src={heroImg}
        alt={`${name} — contemporary stone house in Brittany`}
        className="w-full h-full object-cover"
        fetchPriority="high"
        decoding="sync"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.45)]" />

      <div className="absolute bottom-8 left-[5%] md:bottom-12 md:left-[5%] max-w-xl">
        <p className="font-body uppercase tracking-[0.15em] text-[0.75rem] text-[rgba(255,255,255,0.7)] mb-2">
          {location}
        </p>
        <h1 className="font-display font-normal text-4xl md:text-5xl text-white mb-3">
          {name}
        </h1>
        <p className="font-body font-light text-[0.875rem] text-[rgba(255,255,255,0.8)] mb-6">
          {specs}
        </p>
        <button
          onClick={handleViewPhotos}
          className="font-body uppercase text-xs tracking-[0.1em] bg-white text-[hsl(0,0%,10%)] px-5 py-2.5 hover:bg-[hsl(0,0%,95%)] transition-colors"
        >
          View all photos ({imageCount})
        </button>
      </div>
    </section>
  );
};

export default AtlantiqueHero;
