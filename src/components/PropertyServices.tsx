import { Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePropertyServices } from "@/hooks/usePropertyServices";

interface Props {
  propertyId: string;
}

const PropertyServices = ({ propertyId }: Props) => {
  const { data: services = [] } = usePropertyServices(propertyId);

  const included = services.filter((s) => s.category === "included");
  const alaCarte = services.filter((s) => s.category === "a_la_carte");

  if (included.length === 0 && alaCarte.length === 0) return null;

  return (
    <div className="border-t border-border pt-10 mb-10">
      <Accordion type="multiple" defaultValue={["included"]}>
        {included.length > 0 && (
          <AccordionItem value="included" className="border-b-0">
            <AccordionTrigger className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium hover:no-underline py-0 pb-6">
              Included Services
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {included.map((s) => (
                  <div key={s.id} className="flex items-start gap-3">
                    <Check size={16} className="text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s.label}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {alaCarte.length > 0 && (
          <AccordionItem value="alacarte" className="border-b-0 border-t border-border">
            <AccordionTrigger className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium hover:no-underline py-6">
              À la Carte Services
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {alaCarte.map((s) => (
                  <div key={s.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs mt-0.5">✦</span>
                    <span className="font-body font-light text-sm text-[hsl(0,0%,27%)]">{s.label}</span>
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
        )}
      </Accordion>
    </div>
  );
};

export default PropertyServices;
