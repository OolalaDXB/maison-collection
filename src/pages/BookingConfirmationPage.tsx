import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Check } from "lucide-react";

interface BookingData {
  id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
  nights: number | null;
}

const BookingConfirmationPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);

  useEffect(() => {
    if (!bookingId) return;

    const load = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .maybeSingle();

      if (data) {
        const b = data as any;
        setBooking(b);

        // If card payment coming from Stripe success, update status
        if (b.payment_method === "card" && b.payment_status === "checkout_started") {
          await supabase
            .from("bookings")
            .update({ payment_status: "paid", paid_at: new Date().toISOString() } as any)
            .eq("id", bookingId);
        }

        // Load bank account if transfer
        if (b.payment_method === "bank_transfer") {
          const { data: bank } = await supabase
            .from("bank_accounts" as any)
            .select("*")
            .eq("currency", "EUR")
            .eq("is_default", true)
            .maybeSingle();
          if (bank) setBankAccount(bank);
        }

        // Load payment method config for crypto
        if (b.payment_method === "crypto") {
          const { data: pm } = await supabase
            .from("payment_methods" as any)
            .select("*")
            .eq("code", "crypto")
            .eq("active", true)
            .maybeSingle();
          if (pm) setPaymentMethod(pm);
        }
      }
    };
    load();
  }, [bookingId]);

  const refCode = booking
    ? `BOOK-${booking.id.slice(0, 8).toUpperCase()}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Booking Confirmation" description="" path={`/book/${slug}/confirmation`} noindex={true} />
      <Header />
      <div className="section-padding">
        <div className="max-container max-w-lg mx-auto text-center py-16">
          {!booking ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-primary" />
              </div>
              <h1 className="font-display text-3xl mb-4">Booking Confirmed</h1>
              <p className="text-muted-foreground mb-2">
                {booking.guest_name} · {booking.check_in} → {booking.check_out}
              </p>
              <p className="font-display text-xl mb-8">
                Total: €{booking.total_price}
              </p>

              {/* Bank transfer instructions */}
              {booking.payment_method === "bank_transfer" && bankAccount && (
                <div className="border border-border p-6 text-left text-sm space-y-2 mb-8">
                  <h3 className="font-display text-lg mb-3">Bank Transfer Details</h3>
                  <p>
                    <span className="text-muted-foreground">Bank:</span>{" "}
                    {bankAccount.bank_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">IBAN:</span>{" "}
                    <span className="font-mono">{bankAccount.iban}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">BIC:</span>{" "}
                    <span className="font-mono">{bankAccount.bic}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Reference:</span>{" "}
                    <span className="font-mono">{refCode}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Amount:</span> €
                    {booking.total_price}
                  </p>
                  <p className="text-xs text-muted-foreground pt-2">
                    Please complete the transfer within 48 hours. Your reservation
                    is held until payment is received.
                  </p>
                </div>
              )}

              {/* Crypto instructions */}
              {booking.payment_method === "crypto" && paymentMethod && (
                <div className="border border-border p-6 text-left text-sm space-y-2 mb-8">
                  <h3 className="font-display text-lg mb-3">Crypto Payment</h3>
                  <p>
                    <span className="text-muted-foreground">Network:</span>{" "}
                    {(paymentMethod.config as any)?.network || "Ethereum"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Token:</span> USDC
                    (preferred) or USDT
                  </p>
                  <p>
                    <span className="text-muted-foreground">Wallet:</span>{" "}
                    <span className="font-mono text-xs break-all">
                      {(paymentMethod.config as any)?.wallet_address || "—"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Reference:</span>{" "}
                    <span className="font-mono">{refCode}</span>
                  </p>
                  <p className="text-xs text-muted-foreground pt-2">
                    Send the exact amount with the reference in the transaction
                    memo. Your reservation is confirmed once payment is verified.
                  </p>
                </div>
              )}

              {/* Card payment - already paid */}
              {booking.payment_method === "card" && (
                <p className="text-sm text-muted-foreground mb-8">
                  Payment processed successfully via Stripe.
                </p>
              )}

              <Link
                to={`/${slug}`}
                className="text-primary text-sm hover:underline underline-offset-4"
              >
                ← Back to property
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
