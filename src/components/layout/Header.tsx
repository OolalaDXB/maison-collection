import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Collection", href: "/#collection" },
  { label: "Management", href: "/management" },
  { label: "About", href: "/about" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isHomepage = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparentMode = isHomepage && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          transparentMode
            ? "bg-transparent border-b border-transparent"
            : "bg-[#ffffff] border-b border-[#eeeeee]"
        }`}
      >
        <div className="max-container flex items-center justify-between h-[72px] px-[5%]">
          {/* Logo */}
          <Link
            to="/"
            className={`font-display tracking-[0.15em] font-semibold text-xl md:text-2xl transition-colors duration-300 ${
              transparentMode ? "text-white" : "text-[#1a1a1a]"
            }`}
          >
            MAISONS
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-body font-normal uppercase tracking-wider transition-colors duration-300 ${
                  transparentMode ? "text-[rgba(255,255,255,0.85)] hover:text-white" : "text-[#666666] hover:text-[#1a1a1a]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="mailto:chez@maisons.co"
              className={`text-xs font-body font-normal uppercase tracking-wider px-4 py-1.5 border transition-colors duration-300 ${
                transparentMode
                  ? "border-[rgba(255,255,255,0.5)] text-white hover:bg-[rgba(255,255,255,0.1)]"
                  : "border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              Contact
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`md:hidden p-2 transition-colors duration-300 ${
              transparentMode ? "text-white" : "text-[#1a1a1a]"
            }`}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile side panel */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.4)]"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 left-0 bottom-0 z-[70] bg-white w-[85vw] max-w-[380px] flex flex-col"
            >
              {/* Close button */}
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-[#1a1a1a] p-1"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu items */}
              <nav className="flex flex-col px-8 mt-4">
                {[
                  { label: "Collection", href: "/#collection" },
                  { label: "Management", href: "/management" },
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "mailto:chez@maisons.co" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-body font-normal uppercase tracking-[0.15em] text-[1.1rem] text-[#1a1a1a] py-4 border-b border-[#f0f0f0] last:border-b-0"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Bottom info */}
              <div className="mt-auto px-8 pb-10">
                <div className="border-t border-[#eee] pt-6">
                  <a
                    href="mailto:chez@maisons.co"
                    className="block font-body font-light text-sm text-[#999999] mb-2"
                  >
                    chez@maisons.co
                  </a>
                  <p className="font-body font-light text-xs text-[#bbbbbb]">
                    Brittany · Georgia · Dubai
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
