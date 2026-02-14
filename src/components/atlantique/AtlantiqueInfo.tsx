import { Calendar, Car, Check } from "lucide-react";

const AtlantiqueInfo = () => {
  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-6">
        Additional Information
      </h3>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Check-in</p>
            <p className="font-body font-light text-sm text-foreground mt-1">16:00</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Check-out</p>
            <p className="font-body font-light text-sm text-foreground mt-1">10:00</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Car size={18} className="text-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Parking</p>
            <p className="font-body font-light text-sm text-foreground mt-1">Free, on property</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {["Self check-in with smart lock", "Pets welcome on request", "Non-smoking property"].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <Check size={16} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtlantiqueInfo;
