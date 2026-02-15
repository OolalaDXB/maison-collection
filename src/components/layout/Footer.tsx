import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, Instagram, Facebook, Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { t } = useTranslation();

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (turnstileSiteKey && !turnstileToken) return;
    if (!email.trim()) return;

    setStatus("loading");
    const { error } = await supabase.from("inquiries").insert({
      name: email.split("@")[0],
      email: email.trim(),
      type: "newsletter",
      subject: "Newsletter signup",
      message: "Newsletter signup from footer",
    });

    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <footer className="bg-white border-t border-[#eeeeee] pt-16 pb-8 px-[5%]">
      <div className="max-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-8">
          {/* Column 1: Newsletter */}
          <div className="lg:col-span-2">
            <p className="font-body font-normal uppercase tracking-wider text-xs text-[#1a1a1a] mb-6">
              {t("footer.newsletter_title")}
            </p>
            {status === "success" ? (
              <p className="font-body font-light text-sm text-[#444444]">
                {t("footer.newsletter_thanks")}
              </p>
            ) : (
              <>
                <form onSubmit={handleSubscribe} className="flex gap-0 mb-3">
                  <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("footer.newsletter_placeholder")}
                    required
                    className="flex-1 border border-[#dddddd] bg-white text-[#1a1a1a] placeholder:text-[#999999] font-body font-light text-sm px-4 py-2.5 outline-none focus:border-[#999999] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading" || (!!turnstileSiteKey && !turnstileToken)}
                    className="bg-[#1a1a1a] text-white font-body font-normal uppercase text-xs tracking-wider px-5 py-2.5 hover:bg-[#333333] transition-colors disabled:opacity-50"
                  >
                    {t("footer.subscribe")}
                  </button>
                </form>
                {turnstileSiteKey && (
                  <Turnstile siteKey={turnstileSiteKey} onSuccess={(token) => setTurnstileToken(token)} onError={() => setTurnstileToken(null)} onExpire={() => setTurnstileToken(null)} options={{ theme: 'light', size: 'compact' }} />
                )}
                <p className="font-body font-light text-xs text-[#999999] leading-relaxed">
                  {t("footer.newsletter_desc")}
                </p>
              </>
            )}
          </div>

          {/* Column 2: Destinations */}
          <div>
            <p className="font-body font-normal uppercase tracking-wider text-xs text-[#999999] mb-4">
              {t("footer.destinations")}
            </p>
            <nav className="flex flex-col gap-2">
              <Link to="/georgia" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors">Georgia</Link>
              <Link to="/atlantique" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors">Brittany</Link>
              <Link to="/arabia" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors">Dubai</Link>
            </nav>
          </div>

          {/* Column 3: Maisons */}
          <div>
            <p className="font-body font-normal uppercase tracking-wider text-xs text-[#999999] mb-4">
              {t("footer.maisons")}
            </p>
            <nav className="flex flex-col gap-2">
              <a href="/#collection" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors">{t("footer.our_collection")}</a>
              <Link to="/management" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors">{t("nav.management")}</Link>
              <Link to="/about" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors">{t("footer.about_us")}</Link>
            </nav>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <p className="font-body font-normal uppercase tracking-wider text-xs text-[#999999] mb-4">
              {t("footer.contact_us")}
            </p>
            <nav className="flex flex-col gap-2">
              <a href="mailto:chez@maisons.co" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-2">
                <Mail size={14} className="text-[#666666]" />
                chez@maisons.co
              </a>
              <a href="mailto:chez@maisons.co" className="font-body font-light text-sm text-[#444444] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-2">
                <Send size={14} className="text-[#666666]" />
                {t("footer.send_message")}
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#eeeeee] mt-12 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-body font-light text-xs text-[#bbbbbb]">
            <Link
              to="/admin/login"
              className="no-underline hover:no-underline cursor-default"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              &copy;
            </Link>{" "}
            2026 Maisons. {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-1 text-xs">
            <a href="#" className="font-body font-light text-[#bbbbbb] hover:text-[#666666] transition-colors">{t("footer.privacy")}</a>
            <span className="text-[#bbbbbb]">·</span>
            <a href="#" className="font-body font-light text-[#bbbbbb] hover:text-[#666666] transition-colors">{t("footer.terms")}</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-[#999999] hover:text-[#1a1a1a] transition-colors"><Instagram size={18} /></a>
            <a href="#" className="text-[#999999] hover:text-[#1a1a1a] transition-colors"><Facebook size={18} /></a>
            <a href="#" className="text-[#999999] hover:text-[#1a1a1a] transition-colors"><Linkedin size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
