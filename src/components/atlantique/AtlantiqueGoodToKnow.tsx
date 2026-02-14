import { Check } from "lucide-react";

const items = [
  "The property is fully private — no shared spaces or neighbors in view.",
  "Swimming pool available from late April to end of September only.",
  "House suitable for 4 adults or 2 adults + 2 children, with possibility of 1 extra child bed.",
  "Long-term stays welcome (28 days or more).",
  "Solar panels: eco-friendly initiative.",
  "Pellet stove (pellets provided in reasonable quantity).",
  "Exterior security cameras on entrance and rear facade — disabled upon guest arrival.",
  "Architecture by Anthropie (2020–2022): original stone masonry + Douglas fir extension with black pigmented cladding.",
  "Photography credits: my-linh tôn for anthropie architecture(s).",
];

const AtlantiqueGoodToKnow = () => {
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

export default AtlantiqueGoodToKnow;
