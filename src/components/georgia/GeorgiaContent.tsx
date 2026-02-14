import { useState } from "react";
import { Link } from "react-router-dom";
import FadeIn from "@/components/FadeIn";
import {
  Mountain, Bath, Car, Wifi, Flame, Monitor, Armchair,
  Snowflake, Cable, Dumbbell, Lock, WashingMachine, Building
} from "lucide-react";

const features = [
  { icon: Mountain, label: "Panoramic Caucasus views" },
  { icon: Cable, label: "200m from gondola / ski-in ski-out" },
  { icon: Flame, label: "Wood fireplace (unlimited supply)" },
  { icon: Bath, label: "3 private bathrooms (1 with tub)" },
  { icon: Armchair, label: "Double-height living space" },
  { icon: Snowflake, label: "Ski season: Dec–Apr" },
  { icon: Monitor, label: "Smart TV & Hi-Fi system" },
  { icon: Wifi, label: "Starlink WiFi" },
  { icon: Dumbbell, label: "SPA in basement (fee)" },
  { icon: Car, label: "Free parking" },
  { icon: Lock, label: "Self check-in 24/7" },
  { icon: WashingMachine, label: "Washer" },
  { icon: Building, label: "Elevator" },
];

const GeorgiaContent = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="mb-6">
          <p className="font-body font-light text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Collection</Link>
            {" > "}Georgia{" > "}Greater Caucasus{" > "}Gudauri
          </p>
        </nav>

        {/* Title block */}
        <div className="mb-8">
          <h2 className="font-display text-3xl text-foreground mb-1">Maison Georgia</h2>
          <p className="font-body font-light text-[hsl(0,0%,40%)] text-sm mb-1">Gudauri, Greater Caucasus, Georgia</p>
          <p className="font-body font-light text-muted-foreground text-sm">
            6 guests · 2 bedrooms · 3 beds · 3 bathrooms · 100m² duplex · 200m from gondola
          </p>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
            Mountain duplex at the crossroads of Europe and Asia. 100m² spread across 
            two levels in New Gudauri, just 200m from the gondola. Double-height windows 
            frame the Caucasus peaks, flooding the space with light and offering breathtaking 
            sunrise views.
          </p>
          <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
            Two private bedrooms sleeping 6, three bathrooms including one with a bathtub. 
            A wood-burning fireplace with unlimited supply creates the perfect atmosphere 
            after a day on the slopes. Equipped kitchen, panoramic balcony, fast Starlink WiFi 
            and Smart TV.
          </p>

          {expanded && (
            <div className="mt-4">
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
                Level 1: Open studio with sofa bed, kitchen, fireplace, bathroom with tub. 
                Level 2: Bedroom with queen bed, second bedroom with two singles, two private 
                bathrooms.
              </p>
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
                Why guests love it: Optimal ski location — literally 4 minutes walk to the gondola. 
                Panoramic double-height bay windows with sunrise over the peaks. Guaranteed comfort 
                even at −15°C. Three bathrooms means zero morning wait. Self check-in 24/7 via secure 
                lockbox. Ski lockers in basement, rental shop 50m away. SPA in basement available for 
                a fee. Free parking in front of building.
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

export default GeorgiaContent;
