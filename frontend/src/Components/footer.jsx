import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#1A1816] text-stone-300 py-14" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex w-14 h-14 rounded-full border border-[#C5A059] items-center justify-center font-cinzel text-[#C5A059] tracking-widest mb-5">
          F&L
        </span>
        <p className="font-script text-3xl text-[#E8D9B5] mb-2">Filipi & Larissa</p>
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500 mb-6">10 · 12 · 2026 · 16h30 — Chá de Casa Nova</p>
        <div className="h-px w-24 bg-[#C5A059]/40 mx-auto mb-6" />
        <p className="text-xs text-stone-500">Feito com amor para celebrar nosso novo lar.</p>
        <Link to="/admin" data-testid="footer-admin-link" className="inline-block mt-4 text-xs text-stone-600 hover:text-[#C5A059] transition-colors uppercase tracking-[0.2em]">
          Área do Casal
        </Link>
      </div>
    </footer>
  );
}
