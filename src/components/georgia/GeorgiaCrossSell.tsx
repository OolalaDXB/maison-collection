import { Link } from "react-router-dom";
import atlantiqueHero from "@/assets/atlantique-hero.png";

const GeorgiaCrossSell = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-[5%] py-16">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-8 text-center">
        Discover Our Other Properties
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Atlantique */}
        <Link to="/atlantique" className="group block">
          <div className="aspect-[4/3] bg-[hsl(0,0%,95%)] overflow-hidden mb-4">
            <img
              src={atlantiqueHero}
              alt="Maison Atlantique"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <p className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground mb-1">
            Quistinic · Brittany
          </p>
          <h4 className="font-display text-xl text-foreground mb-1">Maison Atlantique</h4>
          <p className="font-body font-light text-sm text-foreground">From 250€ / night</p>
        </Link>

        {/* Arabia */}
        <Link to="/arabia" className="group block">
          <div className="aspect-[4/3] bg-[#f5f3f0] overflow-hidden mb-4 flex items-center justify-center">
            <p className="font-display text-xl italic text-foreground/60">Maison Arabia</p>
          </div>
          <p className="font-body uppercase tracking-[0.1em] text-xs text-muted-foreground mb-1">
            The Sustainable City · Dubai
          </p>
          <h4 className="font-display text-xl text-foreground mb-1">Maison Arabia</h4>
          <p className="font-body font-light text-sm text-foreground">From 350€ / night</p>
        </Link>
      </div>
    </div>
  );
};

export default GeorgiaCrossSell;
