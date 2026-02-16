import heroImg from "@/assets/georgia-10.png";

interface GeorgiaHeroProps {
  imageCount: number;
}

const GeorgiaHero = ({ imageCount }: GeorgiaHeroProps) => {
  const handleViewPhotos = () => {
    const el = document.getElementById("georgia-gallery");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] mt-[72px] bg-[#2a2a2a]">
      <img
        srcSet={`${heroImg} 1200w`}
        sizes="100vw"
        src={heroImg}
        alt="Maison Georgia — ski loft in Gudauri, Caucasus"
        className="w-full h-full object-cover"
        fetchPriority="high"
        decoding="sync"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.45)]" />

      <div className="absolute bottom-8 left-[5%] md:bottom-12 md:left-[5%] max-w-xl">
        <p className="font-body uppercase tracking-[0.15em] text-[0.75rem] text-[rgba(255,255,255,0.7)] mb-2">
          Gudauri · Greater Caucasus · Georgia
        </p>
        <h1 className="font-display font-normal text-4xl md:text-5xl text-white mb-3">
          Maison Georgia
        </h1>
        <p className="font-body font-light text-[0.875rem] text-[rgba(255,255,255,0.8)] mb-6">
          6 guests · 2 bedrooms · 3 beds · 3 bathrooms · 100m²
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

export default GeorgiaHero;
