import PropertyMap from "@/components/PropertyMap";

const GeorgiaSurroundings = () => {
  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-1">
        The Surroundings
      </h3>
      <p className="font-body font-light text-sm text-muted-foreground mb-6">Gudauri, Greater Caucasus</p>

      <PropertyMap
        center={[44.4731, 42.4614]}
        zoom={13}
        propertyName="Maison Georgia"
      />

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h4 className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground font-medium mb-4">
            Setting
          </h4>
          <div className="space-y-2">
            {[
              "New Gudauri complex — modern infrastructure",
              "Altitude 2,200m",
              "200m from gondola lift",
              "Ski rental 50m away",
            ].map((s) => (
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
              "Restaurants & bars — 2 min walk",
              "Supermarket — 5 min walk",
              "Tbilisi — 2h by car",
              "Tbilisi Airport — 2h by car",
              "Cross Pass — 30 min",
              "Ananuri Fortress — 1h",
              "Kazbegi — 2h",
            ].map((s) => (
              <p key={s} className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeorgiaSurroundings;
