import { Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const included = [
  "Fresh linen and towels",
  "Wood-burning fireplace (unlimited wood supply)",
  "Fully equipped kitchen",
  "Fast WiFi & Smart TV",
  "Self check-in 24/7 via secure lockbox",
  "Ski lockers in basement",
  "Free parking in front of building",
  "Dedicated contact throughout your stay",
  "Balcony with mountain views",
  "Washing machine",
];

const alaCarte = [
  "Airport transfer (Tbilisi, 2h)",
  "Ski rental delivery",
  "Private ski instructor",
  "Grocery delivery",
  "Georgian wine tasting",
  "Paragliding",
  "Mountain guide & hiking",
  "Chef at home (Georgian cuisine)",
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
            <div className="grid grid-cols-2 gap-3 mb-6">
              {alaCarte.map((s) => (
                <div key={s} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-xs mt-0.5">✦</span>
                  <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s}</span>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(0,0%,97%)] p-4">
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
