import { useState } from "react";
import { X, Calendar, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingModalProps {
  propertyId: string | null;
  propertyName: string;
  pricePerNight: number;
  onClose: () => void;
}

const BookingModal = ({ propertyId, propertyName, pricePerNight, onClose }: BookingModalProps) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0;

  const totalPrice = nights * pricePerNight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      toast.error("Property not found in database");
      return;
    }
    if (nights < 1) {
      toast.error("Please select valid dates");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      property_id: propertyId,
      check_in: checkIn,
      check_out: checkOut,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone || null,
      guests_count: guestsCount,
      special_requests: specialRequests || null,
      nights,
      base_price_per_night: pricePerNight,
      total_price: totalPrice,
      status: "pending",
      source: "direct",
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error("Booking failed: " + error.message);
    } else {
      setSubmitted(true);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-background border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl">Book {propertyName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">✓</p>
            <p className="font-display text-lg text-foreground mb-2">Booking Request Sent</p>
            <p className="text-sm text-muted-foreground mb-6">
              We'll confirm your reservation within 24 hours via email.
            </p>
            <button onClick={onClose} className="px-6 py-2 bg-primary text-primary-foreground text-sm uppercase tracking-wider">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Check-in</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Check-out</label>
                <input
                  type="date"
                  required
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="border border-border p-4 bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{nights} night{nights > 1 ? "s" : ""} × €{pricePerNight}</span>
                  <span className="font-display text-foreground">€{totalPrice}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Full Name</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Guests</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Special Requests (optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || nights < 1}
              className="w-full px-6 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Request Booking"}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              No payment required now. We'll confirm availability and send payment details.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
