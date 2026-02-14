import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Collection", href: "/#collection" },
  { label: "Management", href: "/management" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-400 border-b border-border ${
          scrolled
            ? "bg-background/97 shadow-[0_1px_30px_rgba(0,0,0,0.04)]"
            : "bg-background/92"
        } backdrop-blur-xl`}
      >
        <div className="max-container flex items-center justify-between h-[72px] px-[5%]">
          <Link
            to="/"
            className="font-body text-foreground uppercase tracking-[0.05em] font-light text-lg"
          >
            MAISONS
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-body font-normal text-muted-foreground hover:text-primary transition-colors duration-300 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-foreground p-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-10"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="font-display text-3xl text-foreground hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
