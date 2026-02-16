import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Check, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

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

interface ContractData {
  contract_html: string;
  signature_url: string | null;
  accepted_at: string | null;
}

const BookingConfirmationPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [contract, setContract] = useState<ContractData | null>(null);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const load = async () => {
      const [bookingRes, contractRes] = await Promise.all([
        supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle(),
        supabase.from("booking_contracts").select("contract_html, signature_url, accepted_at").eq("booking_id", bookingId).maybeSingle(),
      ]);

      if (bookingRes.data) {
        const b = bookingRes.data as any;
        setBooking(b);

        if (b.payment_method === "card" && b.payment_status === "checkout_started") {
          await supabase
            .from("bookings")
            .update({ payment_status: "paid", paid_at: new Date().toISOString() } as any)
            .eq("id", bookingId);
        }

        if (b.payment_method === "bank_transfer") {
          const { data: bank } = await supabase
            .from("bank_accounts" as any)
            .select("*")
            .eq("currency", "EUR")
            .eq("is_default", true)
            .maybeSingle();
          if (bank) setBankAccount(bank);
        }

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

      if (contractRes.data) {
        setContract(contractRes.data as any);
      }
    };
    load();
  }, [bookingId]);

  const refCode = booking
    ? `BOOK-${booking.id.slice(0, 8).toUpperCase()}`
    : "";

  const downloadContractPdf = async () => {
    if (!contract || !booking) return;
    setGeneratingPdf(true);

    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Contrat de Location Saisonnière", margin, y);
      y += 10;

      // Reference
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Réf: ${refCode}`, margin, y);
      y += 4;
      if (contract.accepted_at) {
        pdf.text(`Signé le: ${new Date(contract.accepted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin, y);
      }
      y += 10;

      // Contract body (strip HTML tags for PDF)
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = contract.contract_html;
      const textContent = tempDiv.innerText || tempDiv.textContent || "";
      
      const lines = pdf.splitTextToSize(textContent, contentWidth);
      const lineHeight = 4.5;
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      }

      // Signature section
      y += 10;
      if (y + 60 > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Signature du locataire", margin, y);
      y += 6;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(booking.guest_name, margin, y);
      y += 8;

      // Embed signature image
      if (contract.signature_url) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = contract.signature_url!;
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const sigDataUrl = canvas.toDataURL("image/png");
            const sigWidth = Math.min(80, contentWidth);
            const sigHeight = (img.height / img.width) * sigWidth;
            pdf.addImage(sigDataUrl, "PNG", margin, y, sigWidth, sigHeight);
            y += sigHeight + 5;
          }
        } catch (e) {
          pdf.text("[Signature non disponible]", margin, y);
          y += 5;
        }
      }

      pdf.save(`contrat-${refCode}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setGeneratingPdf(false);
    }
  };

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

              {/* Contract PDF download */}
              {contract && (
                <div className="border border-border p-6 mb-8 space-y-3">
                  <h3 className="font-display text-lg">Contrat signé</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre contrat de location a été signé électroniquement.
                    {contract.accepted_at && (
                      <> Signé le {new Date(contract.accepted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.</>
                    )}
                  </p>
                  <Button variant="outline" onClick={downloadContractPdf} disabled={generatingPdf}>
                    {generatingPdf ? (
                      <><Loader2 size={14} className="animate-spin mr-2" /> Génération…</>
                    ) : (
                      <><Download size={14} className="mr-2" /> Télécharger le contrat PDF</>
                    )}
                  </Button>
                </div>
              )}

              {/* Bank transfer instructions */}
              {booking.payment_method === "bank_transfer" && bankAccount && (
                <div className="border border-border p-6 text-left text-sm space-y-2 mb-8">
                  <h3 className="font-display text-lg mb-3">Bank Transfer Details</h3>
                  <p><span className="text-muted-foreground">Bank:</span> {bankAccount.bank_name}</p>
                  <p><span className="text-muted-foreground">IBAN:</span> <span className="font-mono">{bankAccount.iban}</span></p>
                  <p><span className="text-muted-foreground">BIC:</span> <span className="font-mono">{bankAccount.bic}</span></p>
                  <p><span className="text-muted-foreground">Reference:</span> <span className="font-mono">{refCode}</span></p>
                  <p><span className="text-muted-foreground">Amount:</span> €{booking.total_price}</p>
                  <p className="text-xs text-muted-foreground pt-2">Please complete the transfer within 48 hours. Your reservation is held until payment is received.</p>
                </div>
              )}

              {/* Crypto instructions */}
              {booking.payment_method === "crypto" && paymentMethod && (
                <div className="border border-border p-6 text-left text-sm space-y-2 mb-8">
                  <h3 className="font-display text-lg mb-3">Crypto Payment</h3>
                  <p><span className="text-muted-foreground">Network:</span> {(paymentMethod.config as any)?.network || "Ethereum"}</p>
                  <p><span className="text-muted-foreground">Token:</span> USDC (preferred) or USDT</p>
                  <p><span className="text-muted-foreground">Wallet:</span> <span className="font-mono text-xs break-all">{(paymentMethod.config as any)?.wallet_address || "—"}</span></p>
                  <p><span className="text-muted-foreground">Reference:</span> <span className="font-mono">{refCode}</span></p>
                  <p className="text-xs text-muted-foreground pt-2">Send the exact amount with the reference in the transaction memo. Your reservation is confirmed once payment is verified.</p>
                </div>
              )}

              {/* Card payment - already paid */}
              {booking.payment_method === "card" && (
                <p className="text-sm text-muted-foreground mb-8">
                  Payment processed successfully via Stripe.
                </p>
              )}

              <Link to={`/${slug}`} className="text-primary text-sm hover:underline underline-offset-4">
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
