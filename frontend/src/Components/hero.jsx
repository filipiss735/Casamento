import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Countdown from "./Countdown";
import { scrollToId } from "@/lib/scroll";

const HERO_IMG =
  "https://images.unsplash.com/photo-1759774310887-1c62776ba950?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

const EASE = [0.22, 1, 0.36, 1];

const Masked = ({ children, delay = 0, className = "" }) => (
  <span className="block overflow-hidden pb-1">
    <motion.span
      className={`block ${className}`}
      initial={{ y: "115%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="inicio" ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img src={HERO_IMG} alt="Mesa elegante preparada para celebração" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1816]/55 via-[#1A1816]/35 to-[#FAF7F2]" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="relative z-10 text-center px-4 pt-24 pb-16">
        <Masked delay={0.15} className="font-script text-3xl sm:text-4xl lg:text-5xl text-[#E8D9B5] mb-2">
          Chá de Casa Nova
        </Masked>
        <Masked delay={0.35} className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-[1.05]">
          Filipi
        </Masked>
        <Masked delay={0.5} className="font-script text-4xl sm:text-5xl text-[#C5A059] -my-2">
          &
        </Masked>
        <Masked delay={0.62} className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-[1.05]">
          Larissa
        </Masked>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.05, ease: EASE }}
          className="mt-8 mb-6 mx-auto flex items-center justify-center gap-4"
        >
          <span className="h-px w-16 sm:w-24 bg-[#C5A059]/80" />
          <span className="font-cinzel text-[#E8D9B5] tracking-[0.4em] text-sm sm:text-base">28 · 11 · 2026 · 16h30</span>
          <span className="h-px w-16 sm:w-24 bg-[#C5A059]/80" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25, ease: EASE }}
        >
          <Countdown dark />
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              data-testid="hero-gifts-button"
              onClick={() => scrollToId("#presentes")}
              className="px-8 py-3.5 rounded-full bg-[#C5A059] text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#9E7B36] hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Ver Lista de Presentes
            </button>
            <button
              data-testid="hero-rsvp-button"
              onClick={() => scrollToId("#confirmar")}
              className="px-8 py-3.5 rounded-full border border-white/60 text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              Confirmar Presença
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
