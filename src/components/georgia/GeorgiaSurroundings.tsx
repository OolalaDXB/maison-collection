import PropertyMap from "@/components/PropertyMap";
import { usePropertyMapData } from "@/hooks/usePropertyMapData";

const GEORGIA_ID = "cdcc1fb2-d8e8-4004-a900-e196312952f9";
const FALLBACK_CENTER: [number, number] = [44.4735, 42.4575];

const GeorgiaSurroundings = () => {
  const { center, pois } = usePropertyMapData(GEORGIA_ID, FALLBACK_CENTER);

  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-1">
        The Surroundings
      </h3>
      <p className="font-body font-light text-sm text-muted-foreground mb-6">Gudauri, Greater Caucasus</p>

      <PropertyMap
        center={center}
        zoom={14}
        propertyName="Maison Georgia"
        pois={pois}
      />

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h4 className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground font-medium mb-4">
            Setting
          </h4>
          <div className="space-y-2">
            {[
              "Ski resort — New Gudauri",
              "2,200m altitude",
              "Greater Caucasus range",
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
              "Gondola — 200m (4 min walk)",
              "Ski rental — 50m",
              "Restaurants — 2 min walk",
              "Supermarket — 3 min walk",
              "Tbilisi — 2h by car",
              "Tbilisi Airport — 2h",
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
