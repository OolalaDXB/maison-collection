const AtlantiqueContact = () => {
  return (
    <div className="bg-[hsl(36,20%,95%)] p-8 md:p-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-4">
        Have Questions About Maison Atlantique?
      </h3>
      <p className="font-body font-light text-sm text-[hsl(0,0%,27%)] leading-relaxed mb-6">
        We'd love to help you plan your stay.
        Reach out and we'll get back to you within 24 hours.
      </p>
      <a
        href="mailto:contact@maisons.co?subject=Question about Maison Atlantique"
        className="inline-block bg-foreground text-background font-body uppercase text-xs tracking-[0.1em] px-6 py-3 hover:opacity-90 transition-opacity"
      >
        Contact us
      </a>
    </div>
  );
};

export default AtlantiqueContact;
