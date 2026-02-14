import { Check } from "lucide-react";

const items = [
  "The Sustainable City is a gated community — visitors register at the gate",
  "Car-free residential streets — cars park at the perimeter, walk or use free electric buggies",
  "Live-in helper (Imelda) ensures the house is always clean and ready",
  "Community supermarket (Zoom) on site, larger malls 15–25 min by car",
  "The property is your private home — no shared spaces with neighbours",
  "Fire extinguisher and first aid kit provided",
];

const ArabiaGoodToKnow = () => {
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

export default ArabiaGoodToKnow;
