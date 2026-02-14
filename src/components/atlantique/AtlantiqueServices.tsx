import { Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const included = [
  "Fresh linen, towels & cotton bed linens",
  "Welcome basket with local products & coffee",
  "Heated pool 12×6m under enclosure (late April–September)",
  "Garden furniture, hammock & sun loungers",
  "Self check-in with digital keypad lock",
  "Dedicated contact throughout your stay",
  "Washer & dryer",
  "Dishwasher & fully equipped kitchen",
  "Pellet stove (pellets provided)",
  "TV, piano & children's toys",
  "Crib available on request",
  "Zip line, swing, basketball court & football area",
  "Free private parking (4 spaces)",
  "Fibre WiFi & dedicated workspace",
  "Solar panels — eco-friendly initiative",
];

const alaCarte = [
  "Private chef",
  "Grocery delivery",
  "Babysitter",
  "Boat excursion",
  "Guided tours (Gulf of Morbihan)",
  "Oyster tasting",
  "Massage at home",
  "Bike rental",
];

const AtlantiqueServices = () => {
  return (
    <div className="border-t border-border pt-10 mb-10">
      <Accordion type="multiple" defaultValue={["included"]}>
        <AccordionItem value="included" className="border-b-0">
          <AccordionTrigger className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium hover:no-underline py-0 pb-6">
            Included Services
          </AccordionTrigger>
          <AccordionContent>
            <p className="font-body font-light text-xs uppercase tracking-[0.1em] text-muted-foreground mb-4">
              In-home services & amenities
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {included.map((s) => (
                <div key={s} className="flex items-start gap-3">
                  <Check size={16} className="text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="alacarte" className="border-b-0 border-t border-border">
          <AccordionTrigger className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium hover:no-underline py-6">
            À la Carte Services
          </AccordionTrigger>
          <AccordionContent>
            <p className="font-body font-light text-sm text-[hsl(0,0%,27%)] mb-5">
              Tailor your stay with our services and local partners.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {alaCarte.map((s) => (
                <div key={s} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs mt-0.5">✦</span>
                  <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s}</span>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(0,0%,97%)] p-5">
              <p className="font-body font-light text-sm text-muted-foreground leading-relaxed">
                This is a glimpse of what's possible. Offerings vary by season
                and availability. Contact us and we'll craft your stay.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AtlantiqueServices;
