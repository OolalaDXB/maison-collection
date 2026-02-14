import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    const { error } = await supabase.from("inquiries").insert({
      name: "Newsletter subscriber",
      email: email.trim(),
      type: "newsletter",
      subject: "Newsletter signup",
    });

    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#1a1a1a] py-16 md:py-20">
      <div className="max-container px-[5%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {/* Column 1: Newsletter */}
          <div className="lg:col-span-1">
            <p className="font-body font-normal uppercase tracking-wider text-sm text-white mb-4">
              Stay Inspired
            </p>
            {status === "success" ? (
              <p className="font-body font-light text-sm text-[rgba(255,255,255,0.7)]">
                Thank you — you're in.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0 mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 bg-transparent border-b border-[rgba(255,255,255,0.3)] text-white placeholder:text-[rgba(255,255,255,0.4)] font-body font-light text-sm py-2 outline-none focus:border-[rgba(255,255,255,0.6)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-white text-[#1a1a1a] font-body font-normal uppercase text-xs tracking-wider px-5 py-2 hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="font-body font-light text-xs text-[rgba(255,255,255,0.4)] leading-relaxed">
              A few emails per year. Travel stories, new properties, and insider tips.
            </p>
          </div>

          {/* Column 2: Destinations */}
          <div>
            <p className="font-body font-normal uppercase tracking-wider text-xs text-[rgba(255,255,255,0.6)] mb-4">
              Destinations
            </p>
            <nav className="flex flex-col gap-3">
              <Link to="/georgia" className="font-body font-light text-sm text-[rgba(255,255,255,0.8)] hover:text-white transition-colors">Georgia</Link>
              <Link to="/atlantique" className="font-body font-light text-sm text-[rgba(255,255,255,0.8)] hover:text-white transition-colors">Brittany</Link>
              <Link to="/arabia" className="font-body font-light text-sm text-[rgba(255,255,255,0.8)] hover:text-white transition-colors">Dubai</Link>
            </nav>
          </div>

          {/* Column 3: Maisons */}
          <div>
            <p className="font-body font-normal uppercase tracking-wider text-xs text-[rgba(255,255,255,0.6)] mb-4">
              Maisons
            </p>
            <nav className="flex flex-col gap-3">
              <Link to="/management" className="font-body font-light text-sm text-[rgba(255,255,255,0.8)] hover:text-white transition-colors">Management</Link>
              <Link to="/about" className="font-body font-light text-sm text-[rgba(255,255,255,0.8)] hover:text-white transition-colors">About us</Link>
              <Link to="/about" className="font-body font-light text-sm text-[rgba(255,255,255,0.8)] hover:text-white transition-colors">Our story</Link>
            </nav>
          </div>

          {/* Column 4: Contact */}
          <div>
            <p className="font-body font-normal uppercase tracking-wider text-xs text-[rgba(255,255,255,0.6)] mb-4">
              Contact
            </p>
            <nav className="flex flex-col gap-3">
              <a href="mailto:chez@maisons.co" className="font-body font-light text-sm text-[rgba(255,255,255,0.8)] hover:text-white transition-colors">chez@maisons.co</a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(255,255,255,0.1)] mt-16 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="font-body font-light text-xs text-[rgba(255,255,255,0.4)]">
            <Link
              to="/admin/login"
              className="no-underline hover:no-underline cursor-text"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              &copy;
            </Link>{" "}
            2026 Maisons.
          </p>
          <p className="font-body font-light text-xs text-[rgba(255,255,255,0.3)]">
            Made by The Studio MT
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
