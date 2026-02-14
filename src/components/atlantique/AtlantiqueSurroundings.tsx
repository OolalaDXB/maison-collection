import PropertyMap from "@/components/PropertyMap";

const AtlantiqueSurroundings = () => {
  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-1">
        The Surroundings
      </h3>
      <p className="font-body font-light text-sm text-muted-foreground mb-6">Quistinic, Brittany</p>

      <PropertyMap
        center={[-3.1333, 47.9167]}
        zoom={12}
        propertyName="Maison Atlantique"
      />

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h4 className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground font-medium mb-4">
            Setting
          </h4>
          <div className="space-y-2">
            {["Out of town", "Private property", "Bocage countryside"].map((s) => (
              <p key={s} className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s}</p>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground font-medium mb-4">
            Nearby
          </h4>
          <div className="space-y-2">
            {[
              "Beach — 20 min by car",
              "Restaurants — 10 min by car",
              "Lorient — 25 min by car",
              "Gulf of Morbihan — 30 min",
              "Quiberon — 40 min",
            ].map((s) => (
              <p key={s} className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlantiqueSurroundings;
