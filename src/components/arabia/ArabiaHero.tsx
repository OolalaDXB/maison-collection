interface ArabiaHeroProps {
  heroImage?: string | null;
  imageCount: number;
}

const ArabiaHero = ({ heroImage, imageCount }: ArabiaHeroProps) => {
  const handleViewPhotos = () => {
    const el = document.getElementById("arabia-gallery");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (!heroImage) {
    return (
      <section className="relative w-full h-[70vh] md:h-[80vh] mt-[72px] bg-[hsl(var(--muted))] flex items-center justify-center">
        <div className="text-center px-[5%]">
          <p className="font-body uppercase tracking-[0.15em] text-[0.75rem] text-[hsl(0,0%,60%)] mb-3">
            The Sustainable City · Dubai
          </p>
          <h1 className="font-display font-normal text-4xl md:text-5xl text-foreground mb-3">
            Maison Arabia
          </h1>
          <p className="font-body font-light text-[0.875rem] text-[hsl(0,0%,40%)] mb-4">
            6 guests · 4 bedrooms · 3 bathrooms · Townhouse
          </p>
          <p className="font-body font-light italic text-sm text-[hsl(0,0%,60%)]">
            Photos coming soon
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] mt-[72px]">
      <img
        src={heroImage}
        alt="Maison Arabia — townhouse in The Sustainable City, Dubai"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.45)]" />

      <div className="absolute bottom-8 left-[5%] md:bottom-12 md:left-[5%] max-w-xl">
        <p className="font-body uppercase tracking-[0.15em] text-[0.75rem] text-[rgba(255,255,255,0.7)] mb-2">
          The Sustainable City · Dubai
        </p>
        <h1 className="font-display font-normal text-4xl md:text-5xl text-white mb-3">
          Maison Arabia
        </h1>
        <p className="font-body font-light text-[0.875rem] text-[rgba(255,255,255,0.8)] mb-6">
          6 guests · 4 bedrooms · 3 bathrooms · Townhouse
        </p>
        {imageCount > 0 && (
          <button
            onClick={handleViewPhotos}
            className="font-body uppercase text-xs tracking-[0.1em] bg-white text-[hsl(0,0%,10%)] px-5 py-2.5 hover:bg-[hsl(0,0%,95%)] transition-colors"
          >
            View all photos ({imageCount})
          </button>
        )}
      </div>
    </section>
  );
};

export default ArabiaHero;
