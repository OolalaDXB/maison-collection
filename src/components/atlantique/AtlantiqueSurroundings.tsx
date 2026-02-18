import PropertyMap from "@/components/PropertyMap";
import { usePropertyMapData } from "@/hooks/usePropertyMapData";

const ATLANTIQUE_ID = "e514d218-0cdc-43cd-a97b-061132976bfb";
const FALLBACK_CENTER: [number, number] = [-3.1333, 47.9167];

const AtlantiqueSurroundings = () => {
  const { center, pois } = usePropertyMapData(ATLANTIQUE_ID, FALLBACK_CENTER);

  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-1">
        The Surroundings
      </h3>
      <p className="font-body font-light text-sm text-muted-foreground mb-6">Quistinic, Brittany</p>

      <PropertyMap
        center={center}
        zoom={12}
        propertyName="Maison Atlantique"
        pois={pois}
      />

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h4 className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground font-medium mb-4">
            Setting
          </h4>
          <div className="space-y-2">
            {[
              "Out of town — absolute tranquility",
              "5 000m² private wooded grounds",
              "Bocage countryside",
              "Near historic village of Poul Fétan",
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
              "Blavet Valley — 5 min",
              "Beaches — 30 min by car",
              "Lorient — 50 min by car",
              "Carnac — 50 min",
              "Vannes — 50 min",
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
