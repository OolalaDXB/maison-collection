import { Calendar, Car, Lock, Ban } from "lucide-react";
import type { PropertyData } from "@/hooks/useProperty";

const GeorgiaInfo = ({ property }: { property: PropertyData | null }) => {
  const checkIn = property?.check_in_time ?? "15:00";
  const checkOut = property?.check_out_time ?? "11:00";
  const parking = property?.parking_info ?? "Free, in front of building (non-reserved)";

  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-6">
        Additional Information
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">Check-in: {checkIn}</span>
        </div>
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">Check-out: {checkOut}</span>
        </div>
        <div className="flex items-start gap-3">
          <Car size={18} className="text-[hsl(0,0%,27%)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span className="font-body font-light text-sm text-[hsl(0,0%,27%)] whitespace-pre-wrap">Parking: {parking}</span>
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
