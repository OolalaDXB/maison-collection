import { useState } from "react";
import { Link } from "react-router-dom";
import type { PropertyData } from "@/hooks/useProperty";
import FadeIn from "@/components/FadeIn";
import {
  Waves, Building2, Mountain, Bath, Car, Wifi, Flame, LandPlot, CircleDot, Sun, UtensilsCrossed,
  Zap, Monitor, Leaf, ShowerHead, Armchair, BriefcaseBusiness
} from "lucide-react";

const features = [
  { icon: Waves, label: "Heated pool 12×6m under enclosure" },
  { icon: Building2, label: "Contemporary architecture (2020–2022)" },
  { icon: Mountain, label: "Stone masonry + Douglas fir extension" },
  { icon: LandPlot, label: "5 000m² private grounds" },
  { icon: Sun, label: "20m² covered terrace (enclosable)" },
  { icon: Armchair, label: "20m² open terrace with sun loungers" },
  { icon: Bath, label: "2 private en-suite bathrooms" },
  { icon: CircleDot, label: "Basketball court" },
  { icon: UtensilsCrossed, label: "BBQ grill & outdoor dining" },
  { icon: Zap, label: "Zip line, swing & outdoor playground" },
  { icon: BriefcaseBusiness, label: "Dedicated workspace with fibre WiFi" },
  { icon: Flame, label: "Pellet stove (pellets provided)" },
  { icon: Monitor, label: "TV & piano" },
  { icon: Leaf, label: "Solar panels — eco-friendly" },
  { icon: Car, label: "30 min from Morbihan beaches" },
  { icon: Wifi, label: "Fibre WiFi" },
];

const AtlantiqueContent = ({ property }: { property: PropertyData | null }) => {
  const [expanded, setExpanded] = useState(false);

  const name = property?.name ?? "Maison Atlantique";
  const location = property ? `${property.location}, ${property.region}, ${property.country}` : "Quistinic, Brittany, France";
  const specs = property
    ? `${property.capacity ?? 6} guests · ${property.bedrooms ?? 2} bedrooms · 3 beds · ${property.bathrooms ?? 2} bathrooms · ${property.area_sqm ?? 120}m² + terraces · 5 000m²`
    : "6 guests · 2 bedrooms · 3 beds · 2 bathrooms · 120m² + terraces · 5 000m²";
  const desc = property?.description ?? null;

  return (
    <div>
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="mb-6">
          <p className="font-body font-light text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Collection</Link>
            {" > "}{property?.country ?? "France"}{" > "}{property?.region ?? "Brittany"}{" > "}{property?.location ?? "Quistinic"}
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
            <div className="space-y-4">
              {desc.split(/\n\n+/).map((para, i) => (
                <p key={i} className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] whitespace-pre-wrap">{para}</p>
              ))}
            </div>
          ) : (
            <>
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
                Welcome to a 19th-century Breton Pen Ty house, reimagined by an architecture 
                studio between 2020 and 2022. Ancient stone meets contemporary design: original 
                rubble masonry and a black Douglas fir extension creating 120m² of refined living 
                space, complemented by 40m² of terraces — including a covered, enclosable 
                terrace — set on 5 000m² of private wooded grounds.
              </p>
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
                Large bay windows frame the landscape — fields, centuries-old oak forests, 
                Breton sky — and flood the spaces with light. The heated pool (12×6m) is 
                sheltered beneath an elegant enclosure, extending the swimming season from 
                late April through September. Steps from the historic village of Poul Fétan, 
                in absolute tranquility, 30 minutes from Morbihan beaches.
              </p>
            </>
          )}

          {property?.long_description ? (
            expanded && (
              <div className="space-y-4 mt-4">
                {property.long_description.split(/\n\n+/).map((para, i) => (
                  <p key={i} className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] whitespace-pre-wrap">{para}</p>
                ))}
              </div>
            )
          ) : (
            expanded && (
              <div className="mt-4">
                <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
                  Designed for both work and relaxation: fibre WiFi, a bright dedicated 
                  workspace overlooking the garden, covered terrace, and pellet stove for 
                  cool evenings. The upper floor offers an open space perfect for children.
                </p>
                <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
                  The garden features a zip line, swing, basketball court, and football area. 
                  Many hiking trails surround the house. The Blavet Valley is 5 minutes away, 
                  and the beaches of Carnac, Quiberon, and the Gulf of Morbihan are all 
                  within easy reach.
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

export default AtlantiqueContent;
