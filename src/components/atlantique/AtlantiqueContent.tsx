import { useState } from "react";
import { Link } from "react-router-dom";
import FadeIn from "@/components/FadeIn";
import {
  Waves, Building2, Mountain, TreePine, Bath, Car, Wifi, Flame, LandPlot, CircleDot, Sun, UtensilsCrossed
} from "lucide-react";

const features = [
  { icon: Waves, label: "Heated covered pool" },
  { icon: Building2, label: "Contemporary architecture" },
  { icon: Mountain, label: "Stone masonry construction" },
  { icon: LandPlot, label: "5 000m² private grounds" },
  { icon: Sun, label: "20m² covered terrace (enclosable)" },
  { icon: TreePine, label: "20m² open terrace" },
  { icon: Bath, label: "2 private bathrooms" },
  { icon: CircleDot, label: "Basketball hoop" },
  { icon: UtensilsCrossed, label: "Barbecue" },
  { icon: Car, label: "20 min from Atlantic coast" },
  { icon: Wifi, label: "Fast WiFi" },
  { icon: Flame, label: "Wood stove" },
];

const AtlantiqueContent = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="mb-6">
          <p className="font-body font-light text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Collection</Link>
            {" > "}France{" > "}Brittany{" > "}Quistinic
          </p>
        </nav>

        {/* Title block */}
        <div className="mb-8">
          <h2 className="font-display text-3xl text-foreground mb-1">Maison Atlantique</h2>
          <p className="font-body font-light text-[hsl(0,0%,40%)] text-sm mb-1">Quistinic, Brittany, France</p>
          <p className="font-body font-light text-muted-foreground text-sm">
            6 guests · 2 bedrooms · 2 bathrooms · 120m² + 40m² terraces · 5 000m² land
          </p>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
            A 19th-century Breton penty, meticulously reimagined by Anthropie Architecture
            between 2020 and 2022. The original stone masonry meets a bold contemporary
            extension in Douglas fir with black pigmented cladding, creating 120m² of refined
            living space, complemented by 40m² of terraces — including a covered,
            enclosable terrace — set on 5 000m² of private grounds.
          </p>
          <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
            The heated pool is sheltered beneath an elegant covering, extending the
            swimming season from April through September. Set in the peaceful bocage
            countryside of Morbihan, the property offers complete serenity —
            twenty minutes from the Atlantic coast.
          </p>

          {expanded && (
            <div className="mt-4">
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
                The renovation preserves the character of the original penty — thick stone walls, 
                exposed beams, and a sense of rootedness in the landscape — while introducing 
                a contemporary extension in Douglas fir frame with black pigmented cladding. 
                The double-height living space brings together old and new with a wood stove, 
                open kitchen, and dining for six.
              </p>
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
                The property sits on a private plot in the bocage countryside of Quistinic, 
                surrounded by hedgerows and meadows. There are no neighbors in sight. 
                The Gulf of Morbihan, Quiberon peninsula, and the beaches of southern Brittany 
                are all within easy reach.
              </p>
            </div>
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
