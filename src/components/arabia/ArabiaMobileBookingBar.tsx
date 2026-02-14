import { useState } from "react";
import { X } from "lucide-react";
import ArabiaBookingSidebar from "./ArabiaBookingSidebar";

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

const ArabiaMobileBookingBar = (props: Props) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-4 py-3 flex items-center justify-between">
        <div>
          {props.nights > 0 ? (
            <p className="font-body text-sm text-foreground">
              <span className="font-medium">€{props.total.toLocaleString()}</span>
              <span className="font-light text-muted-foreground"> · {props.nights} night{props.nights > 1 ? "s" : ""}</span>
            </p>
          ) : (
            <p className="font-body text-sm text-foreground">
              From <span className="font-medium">{props.pricePerNight}€</span> / night
            </p>
          )}
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="bg-foreground text-background font-body uppercase text-xs tracking-[0.1em] px-5 py-2.5"
        >
          Book
        </button>
      </div>

      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-background max-h-[90vh] overflow-y-auto animate-slide-in-up">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="font-body uppercase tracking-[0.1em] text-sm font-medium">Book your stay</p>
              <button onClick={() => setSheetOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <ArabiaBookingSidebar {...props} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden h-16" />
    </>
  );
};

export default ArabiaMobileBookingBar;
