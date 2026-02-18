import PropertyMap from "@/components/PropertyMap";
import { usePropertyMapData } from "@/hooks/usePropertyMapData";

const ARABIA_ID = "2cded4d5-47f4-4168-9b0e-824891c3c69e";
const FALLBACK_CENTER: [number, number] = [55.3033, 25.1161];

const ArabiaSurroundings = () => {
  const { center, pois } = usePropertyMapData(ARABIA_ID, FALLBACK_CENTER);

  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-1">
        The Surroundings
      </h3>
      <p className="font-body font-light text-sm text-muted-foreground mb-6">The Sustainable City, Dubai</p>

      <PropertyMap
        center={center}
        zoom={13}
        propertyName="Maison Arabia"
        pois={pois}
      />

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h4 className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground font-medium mb-4">
            Setting
          </h4>
          <div className="space-y-2">
            {[
              "The Sustainable City",
              "Gated car-free community",
              "Dubai, UAE",
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
              "Community pool — 3 min walk",
              "Restaurants & cafes — on site",
              "Zoom Supermarket — on site",
              "Mall of the Emirates — 15 min",
              "Global Village — 10 min",
              "Dubai coastline — 25 min",
              "Dubai Mall / Downtown — 30 min",
              "DXB Airport — 35 min",
            ].map((s) => (
              <p key={s} className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabiaSurroundings;
