import { Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const included = [
  "Fresh linen, towels & cotton bed linens",
  "Wood-burning fireplace with unlimited supply",
  "Starlink WiFi",
  "Smart TV & Hi-Fi system",
  "Fully equipped kitchen",
  "Washer",
  "Self check-in 24/7 via secure lockbox",
  "Dedicated contact throughout your stay",
  "Ski lockers in basement",
  "Free parking in front of building",
  "Elevator access",
  "Blackout blinds in bedrooms",
];

const alaCarte = [
  "Airport transfer (Tbilisi, 2h)",
  "Ski equipment rental (50m away)",
  "Ski instructor",
  "SPA access (basement, fee)",
  "Grocery delivery",
  "Private chef / catering",
  "Guided mountain tours",
  "Paragliding",
];

const GeorgiaServices = () => {
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

export default GeorgiaServices;
