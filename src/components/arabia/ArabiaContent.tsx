import { useState } from "react";
import { Link } from "react-router-dom";
import FadeIn from "@/components/FadeIn";
import {
  Leaf, Home, Users, Waves, Baby, Sun,
  TreePine, Bike, Dumbbell, Car, Wifi, ShieldCheck
} from "lucide-react";

const features = [
  { icon: Leaf, label: "Net-zero energy community" },
  { icon: Home, label: "3-level townhouse" },
  { icon: Users, label: "Live-in helper included" },
  { icon: Waves, label: "Community pool & kids' pool" },
  { icon: Baby, label: "Family-friendly, car-free streets" },
  { icon: Sun, label: "Rooftop terrace with solar panels" },
  { icon: TreePine, label: "Urban farms & 11 bio-domes" },
  { icon: Bike, label: "4 km jogging & cycling track" },
  { icon: Dumbbell, label: "Fitness center, tennis, football" },
  { icon: Car, label: "Free parking + EV charging" },
  { icon: Wifi, label: "Fast WiFi & dedicated workspace" },
  { icon: ShieldCheck, label: "Gated community, 24/7 security" },
];

const ArabiaContent = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <FadeIn>
        <nav className="mb-6">
          <p className="font-body font-light text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Collection</Link>
            {" > "}Dubai{" > "}The Sustainable City
          </p>
        </nav>

        <div className="mb-8">
          <h2 className="font-display text-3xl text-foreground mb-1">Maison Arabia</h2>
          <p className="font-body font-light text-[hsl(0,0%,40%)] text-sm mb-1">The Sustainable City, Dubai, UAE</p>
          <p className="font-body font-light text-muted-foreground text-sm">
            6 guests · 4 bedrooms · 3 bathrooms · 3 levels
          </p>
        </div>

        <div className="mb-4">
          <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
            A different way of living in Dubai. This townhouse sits inside The Sustainable City — the region's first net-zero energy community, a gated car-free village of 500 homes surrounded by a 30-metre tree belt, 11 bio-dome greenhouses, and urban farms. No glass towers. No highways. Just green streets where children play freely, families walk to the pool, and solar panels power every home.
          </p>
          <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
            Three levels of generous family space: an open-plan ground floor with living room, dining area, and fully equipped kitchen. Four bedrooms on the first floor — one queen, one double, and two singles — each with its own bathroom. On top, a rooftop terrace shaded by solar panels with a ping-pong table and sunset views over the community.
          </p>

          {expanded && (
            <div className="mt-4">
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8]">
                During your stay, you'll be assisted by Imelda, our dedicated live-in helper. Discreet and attentive, she ensures your stay runs effortlessly — from keeping the house impeccable to helping with whatever you need. This is a level of comfort rarely found in short-term stays.
              </p>
              <p className="font-body font-light text-[hsl(0,0%,27%)] text-[1.05rem] leading-[1.8] mt-4">
                The Sustainable City is 15 minutes from Mall of the Emirates, 10 minutes from Global Village, and 25 minutes from the coast. Within the compound: swimming pools (including a kids' pool), fitness center, a 4 km cycling and jogging track, four playgrounds, tennis court, football pitch, an equestrian center, a farm area with animals, restaurants, and a small supermarket. Everything you need is within walking distance — or a free electric buggy ride.
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

export default ArabiaContent;
