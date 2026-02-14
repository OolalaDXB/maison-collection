import { useState } from "react";
import { Star, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  checkIn?: Date;
  checkOut?: Date;
  setCheckIn: (d: Date | undefined) => void;
  setCheckOut: (d: Date | undefined) => void;
  guests: number;
  setGuests: (n: number) => void;
  disabledDates: Date[];
  pricePerNight: number;
  nights: number;
  total: number;
}

const AtlantiqueBookingSidebar = ({
  checkIn, checkOut, setCheckIn, setCheckOut,
  guests, setGuests, disabledDates,
  pricePerNight, nights, total,
}: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  const airbnbUrl = "https://www.airbnb.com/l/LEHC2J81";
  const bookSubject = checkIn && checkOut
    ? `Réservation Maison Atlantique — ${format(checkIn, "dd/MM/yyyy")} au ${format(checkOut, "dd/MM/yyyy")} — ${guests} guest${guests > 1 ? "s" : ""}`
    : "Réservation Maison Atlantique";
  const contactSubject = checkIn && checkOut
    ? `Maison Atlantique — ${format(checkIn, "dd/MM/yyyy")} to ${format(checkOut, "dd/MM/yyyy")}`
    : "Maison Atlantique";

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(undefined);
    } else {
      if (date > checkIn) {
        const diffDays = Math.ceil((date.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 2) return; // min 2 nights
        setCheckOut(date);
        setCalendarOpen(false);
      } else {
        setCheckIn(date);
        setCheckOut(undefined);
      }
    }
  };

  const clearDates = () => {
    setCheckIn(undefined);
    setCheckOut(undefined);
  };

  const gbp = (total * 0.86).toFixed(0);
  const usd = (total * 1.08).toFixed(0);

  return (
    <div className="border border-[hsl(0,0%,88%)] p-6">
      <p className="font-body uppercase tracking-[0.1em] text-sm font-medium text-foreground mb-1">
        Maison Atlantique
      </p>
      <div className="flex items-center gap-1.5 mb-5">
        <Star size={14} className="text-primary fill-primary" />
        <span className="font-body font-light text-sm text-muted-foreground">5.0 · 22 reviews · Superhost</span>
      </div>

      <div className="border-t border-[hsl(0,0%,88%)] pt-5 space-y-4">
        {/* Dates */}
        <div>
          <label className="font-body font-light text-muted-foreground text-xs uppercase tracking-[0.1em] block mb-2">
            Dates
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="w-full border border-[hsl(0,0%,88%)] px-4 py-3 text-left font-body text-sm flex items-center justify-between hover:border-[hsl(0,0%,70%)] transition-colors">
                <span className={cn("font-light", !checkIn && "text-muted-foreground")}>
                  {checkIn ? format(checkIn, "dd/MM/yyyy") : "dd/mm/yyyy"}
                  {" → "}
                  {checkOut ? format(checkOut, "dd/MM/yyyy") : "dd/mm/yyyy"}
                </span>
                {checkIn && (
                  <X size={14} className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={(e) => { e.stopPropagation(); clearDates(); }} />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut || checkIn}
                onSelect={handleDateSelect}
                disabled={[
                  { before: new Date() },
                  ...disabledDates.map(d => d),
                ]}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
                modifiers={checkIn && checkOut ? { range: { from: checkIn, to: checkOut } } : undefined}
                modifiersClassNames={checkIn && checkOut ? { range: "bg-[hsl(7,41%,56%)]/10" } : undefined}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div>
          <label className="font-body font-light text-muted-foreground text-xs uppercase tracking-[0.1em] block mb-2">
            Guests
          </label>
          <Popover open={guestOpen} onOpenChange={setGuestOpen}>
            <PopoverTrigger asChild>
              <button className="w-full border border-[hsl(0,0%,88%)] px-4 py-3 text-left font-body text-sm font-light flex items-center justify-between hover:border-[hsl(0,0%,70%)] transition-colors">
                <span>{guests} guest{guests > 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">▾</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 pointer-events-auto" align="start">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => { setGuests(n); setGuestOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm font-body font-light hover:bg-[hsl(0,0%,95%)] transition-colors",
                    guests === n && "font-medium"
                  )}
                >
                  {n} guest{n > 1 ? "s" : ""}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Price */}
      <div className="border-t border-[hsl(0,0%,88%)] mt-5 pt-5">
        {nights > 0 ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="font-body font-light text-sm text-foreground">
                Total — {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span className="font-body font-medium text-base text-foreground">€{total.toLocaleString()}</span>
            </div>
            <p className="font-body font-light text-xs text-muted-foreground mb-1">
              ~£{gbp} · ~${usd}
            </p>
            <p className="font-body font-light text-xs text-muted-foreground">
              Tourist tax not included.
            </p>
          </>
        ) : (
          <>
            <p className="font-body text-sm text-foreground mb-1">
              From <span className="font-medium">{pricePerNight}€</span> / night
            </p>
            <p className="font-body font-light text-xs text-muted-foreground">
              Select dates to see the total.
            </p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-[hsl(0,0%,88%)] mt-5 pt-5 space-y-3">
        <a
          href={`mailto:chez@maisons.co?subject=${encodeURIComponent(bookSubject)}`}
          className="block w-full bg-foreground text-background font-body uppercase text-xs tracking-[0.1em] py-3 text-center hover:opacity-90 transition-opacity"
        >
          Book with us
        </a>
        <div className="flex items-center gap-3">
          <a
            href={`mailto:chez@maisons.co?subject=${encodeURIComponent(contactSubject)}`}
            className="flex-1 border border-[hsl(0,0%,88%)] text-foreground font-body uppercase text-xs tracking-[0.1em] py-2.5 text-center hover:border-foreground transition-colors"
          >
            Contact us
          </a>
          <a
            href={airbnbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-[hsl(0,0%,88%)] text-muted-foreground font-body uppercase text-xs tracking-[0.1em] py-2.5 text-center hover:border-foreground hover:text-foreground transition-colors"
          >
            Book on Airbnb
          </a>
        </div>
      </div>
      <p className="font-body font-light text-xs text-muted-foreground mt-3 text-center">
        chez@maisons.co
      </p>
    </div>
  );
};

export default AtlantiqueBookingSidebar;
