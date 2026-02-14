import { Calendar, Car, Lock, Ban } from "lucide-react";

const GeorgiaInfo = () => {
  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-6">
        Additional Information
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">Check-in: 15:00 (free early check-in if available)</span>
        </div>
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">Check-out: 11:00 (late checkout possible on request)</span>
        </div>
        <div className="flex items-start gap-3">
          <Car size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">Parking: Free, in front of building (non-reserved)</span>
        </div>
        <div className="flex items-start gap-3">
          <Lock size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">Self check-in 24/7 via secure lockbox</span>
        </div>
        <div className="flex items-start gap-3">
          <Ban size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">No smoking inside</span>
        </div>
        <div className="flex items-start gap-3">
          <Ban size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">Pets not allowed</span>
        </div>
      </div>
    </div>
  );
};

export default GeorgiaInfo;
