import { Check } from "lucide-react";

const items = [
  "New Gudauri complex — modern construction (2019), excellent insulation",
  "SPA in basement accessible for a fee (sauna, hammam, pool)",
  "Ski rental shop 50m from the building",
  "Restaurants, supermarket, pharmacy all within walking distance",
  "Snow season: December–mid-April. Summer hiking: June–September",
];

const GeorgiaGoodToKnow = () => {
  return (
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-6">
        Good to Know
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <Check size={16} className="text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
            <span className="font-body font-light text-sm text-[hsl(0,0%,27%)] leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeorgiaGoodToKnow;
