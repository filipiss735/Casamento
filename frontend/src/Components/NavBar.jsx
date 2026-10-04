import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { scrollToId } from "@/lib/scroll";

const LINKS = [
  { label: "Nossa História", href: "#historia" },
  { label: "Presentes", href: "#presentes", testid: "nav-gifts-link" },
  { label: "Detalhes", href: "#detalhes" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href) => {
    setOpen(false);
    scrollToId(href);
  };

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
        scrolled ? "bg-[#1A1816]/95 backdrop-blur-md border-b border-white/15 shadow-sm" : "bg-[#1A1816]/55 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        <button onClick={() => go("#inicio")} className="flex items-center gap-3" data-testid="nav-logo">
          <span className="w-10 h-10 rounded-full border border-[#C5A059] flex items-center justify-center font-cinzel text-sm text-[#9E7B36] tracking-widest bg-[#FAF7F2]">
            F&L
          </span>
          <span className="hidden sm:block font-serif text-lg tracking-wide text-white">Filipi & Larissa</span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <button
              key={l.href}
              data-testid={l.testid || `nav-link-${l.label.toLowerCase()}`}
              onClick={() => go(l.href)}
              className="text-xs uppercase tracking-[0.22em] font-semibold text-white hover:text-white/80 transition-colors duration-300"
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="nav-rsvp-link"
            onClick={() => go("#confirmar")}
            className="text-xs uppercase tracking-[0.22em] font-semibold px-5 py-2.5 rounded-full bg-[#9E7B36] text-white hover:bg-[#856728] hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Confirmar Presença
          </button>
          <Link to="/admin" data-testid="nav-admin-link" className="text-white hover:text-[#9E7B36] transition-colors" title="Área do casal">
            <Lock size={16} />
          </Link>
        </nav>

        <button aria-label="Abrir menu" aria-expanded={open} className="md:hidden text-white" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#1A1816]/95 backdrop-blur-md border-t border-[#E4DDD3] px-6 py-4 flex flex-col gap-4" data-testid="nav-mobile-menu">
          {LINKS.map((l) => (
            <button key={l.href} onClick={() => go(l.href)} className="text-left text-sm uppercase tracking-[0.2em] font-semibold text-white">
              {l.label}
            </button>
          ))}
          <button onClick={() => go("#confirmar")} className="text-left text-sm uppercase tracking-[0.2em] font-semibold text-white">
            Confirmar Presença
          </button>
          <Link to="/admin" className="text-left text-xs uppercase tracking-[0.2em] text-white">
            Área do Casal
          </Link>
        </div>
      )}
    </header>
  );
}
