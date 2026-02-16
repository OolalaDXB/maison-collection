import { Calendar, Car, Check } from "lucide-react";
import type { PropertyData } from "@/hooks/useProperty";

const AtlantiqueInfo = ({ property }: { property: PropertyData | null }) => {
  const checkIn = property?.check_in_time ?? "15:00";
  const checkOut = property?.check_out_time ?? "11:00";
  const parking = property?.parking_info ?? "Free, 4 spaces";

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
            <p className="font-body font-light text-sm text-foreground mt-1">{checkIn}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Check-out</p>
            <p className="font-body font-light text-sm text-foreground mt-1">{checkOut}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Car size={18} className="text-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Parking</p>
            <p className="font-body font-light text-sm text-foreground mt-1">{parking}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          "Self check-in with digital keypad lock",
          "Luggage drop-off for early arrival / late departure",
          "Pets welcome on request",
          "Non-smoking property",
          "No air conditioning",
          "Welcome guide sent before arrival",
        ].map((item) => (
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
