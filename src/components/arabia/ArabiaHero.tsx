const ArabiaHero = () => {
  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] mt-[72px] bg-[#f5f3f0] flex items-center justify-center">
      <div className="text-center px-[5%]">
        <p className="font-body uppercase tracking-[0.15em] text-[0.75rem] text-[#999] mb-3">
          The Sustainable City · Dubai
        </p>
        <h1 className="font-display font-normal text-4xl md:text-5xl text-foreground mb-3">
          Maison Arabia
        </h1>
        <p className="font-body font-light text-[0.875rem] text-[#666] mb-4">
          6 guests · 4 bedrooms · 3 bathrooms · Townhouse
        </p>
        <p className="font-body font-light italic text-sm text-[#999]">
          Photos coming soon
        </p>
      </div>
    </section>
  );
};

export default ArabiaHero;
