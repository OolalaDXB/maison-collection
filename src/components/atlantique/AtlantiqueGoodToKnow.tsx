import { Check } from "lucide-react";

const items = [
  "The property is fully private — no shared spaces or neighbors in view.",
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
