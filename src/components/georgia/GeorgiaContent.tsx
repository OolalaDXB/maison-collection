import { useState } from "react";
import { Link } from "react-router-dom";
import type { PropertyData } from "@/hooks/useProperty";
import FadeIn from "@/components/FadeIn";
import {
  Mountain, Bath, Car, Wifi, Flame, Lock,
  Dumbbell, BedDouble, Maximize2, CableCar
} from "lucide-react";

const features = [
  { icon: Mountain, label: "2,200m altitude, Caucasus views" },
  { icon: CableCar, label: "200m from gondola (4 min walk)" },
  { icon: Flame, label: "Wood-burning fireplace" },
  { icon: Maximize2, label: "100m² duplex, double-height windows" },
  { icon: Bath, label: "3 private bathrooms" },
  { icon: BedDouble, label: "Sleeps 6 (queen + twins + sofa bed)" },
  { icon: Wifi, label: "Fast WiFi & Smart TV" },
  { icon: Car, label: "Free parking" },
  { icon: Lock, label: "Self check-in 24/7" },
  { icon: Dumbbell, label: "SPA in building (paid access)" },
];

const GeorgiaContent = ({ property }: { property: PropertyData | null }) => {
  const [expanded, setExpanded] = useState(false);

  const name = property?.name ?? "Maison Georgia";
  const location = property ? `${property.location}, ${property.region}, ${property.country}` : "Gudauri, Greater Caucasus, Georgia";
  const specs = property
    ? `${property.capacity ?? 6} guests · ${property.bedrooms ?? 2} bedrooms · 3 beds · ${property.bathrooms ?? 3} bathrooms · ${property.area_sqm ?? 100}m²`
    : "6 guests · 2 bedrooms · 3 beds · 3 bathrooms · 100m²";
  const desc = property?.description ?? null;

  return (
    <div>
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="mb-6">
          <p className="font-body font-light text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Collection</Link>
            {" > "}{property?.country ?? "Georgia"}{" > "}{property?.region ?? "Greater Caucasus"}{" > "}{property?.location ?? "Gudauri"}
          </p>
        </nav>

        {/* Title block */}
        <div className="mb-8">
          <h2 className="font-display text-3xl text-foreground mb-1">{name}</h2>
          <p className="font-body font-light text-[hsl(0,0%,40%)] text-sm mb-1">{location}</p>
          <p className="font-body font-light text-muted-foreground text-sm">
            {specs}
          </p>
        </div>

        {/* Description */}
        <div className="mb-4">
          {desc ? (
            <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">{desc}</p>
          ) : (
            <>
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
                A mountain duplex at 2,200 meters, 200 meters from the gondola in New Gudauri. 
                Double-height windows frame the Greater Caucasus range from sunrise to sunset. 
                Two levels, two private bedrooms sleeping six, three full bathrooms, a wood-burning 
                fireplace with unlimited supply, and a fully equipped kitchen.
              </p>
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
                Level 1 opens onto a bright studio living space — sofa bed, kitchen, fireplace, 
                bathroom with bathtub. Level 2 holds a queen bedroom and a twin bedroom, each 
                with private en-suite bathrooms. Ski lockers in the basement, rental shop 50 meters 
                away, SPA accessible for a fee.
              </p>
            </>
          )}

          {property?.long_description ? (
            expanded && (
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
                {property.long_description}
              </p>
            )
          ) : (
            expanded && (
              <div className="mt-4">
                <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
                  Why guests love it: the location is genuinely ski-in/ski-out — four minutes on foot 
                  to the gondola. Panoramic double-height bay windows catch the sunrise over the peaks 
                  every morning. Three bathrooms mean zero morning queues, even with six guests. Self 
                  check-in 24/7 via secure lockbox. Restaurants, supermarket, and ski rental are all 
                  within walking distance. Free parking in front of the building. Guaranteed warmth 
                  even at −15°C — the fireplace and modern insulation make it effortless.
                </p>
              </div>
            )
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="font-body uppercase text-xs tracking-[0.1em] text-foreground hover:text-primary transition-colors mb-10"
        >
          {expanded ? "Show less −" : "Read the whole description +"}
        </button>
      </FadeIn>

      {/* Key Features */}
      <FadeIn>
        <div className="border-t border-border pt-10 mb-10">
          <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground mb-6 font-medium">
            Key Features
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <f.icon size={22} className="text-foreground shrink-0" strokeWidth={1.5} />
                <span className="font-body font-light text-[hsl(0,0%,27%)] text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default GeorgiaContent;
