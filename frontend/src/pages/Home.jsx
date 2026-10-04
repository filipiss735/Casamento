import { useEffect, useState, useCallback } from "react";
import Lenis from "lenis";
import { api } from "@/lib/api";
import { featuredGifts } from "@/data/featuredGifts";
import Navbar from "@/Components/NavBar";
import Hero from "@/Components/hero";
import { premiumGifts } from "@/data/premiumGifts";
import CoupleStory from "@/Components/CoupleStory";
import ProductCarousel from "@/Components/ProductCarousel";
import EventDetails from "@/Components/EventDetails";
import RSVPSection from "@/Components/RSVPSection";
import Footer from "@/Components/footer";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [online, setOnline] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([api.get("/products"), api.get("/settings")]);
      setProducts(p.data);
      setSettings(s.data);
      setOnline(true);
    } catch (e) {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09 });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    load();
    const refresh = setInterval(load, 10000);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(refresh);
      window.removeEventListener("focus", load);
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [load]);

  return (
    <main className="bg-[#FAF7F2] text-stone-900 font-sans overflow-x-clip" data-testid="home-page">
      <Navbar />
      <Hero />
      <CoupleStory />
      <ProductCarousel products={online ? products.filter(p => p.tier !== "premium") : featuredGifts} online={online} onChanged={load} />
      <ProductCarousel id="presentes-especiais" title="Presentes especiais" subtitle="Escolha e reserve seu presente. Combine os detalhes e a entrega com o casal." products={[...(online ? products.filter(p => p.tier === "premium") : premiumGifts.filter(p => !p.placeholder).map(p => ({ ...p, tier: "premium" }))), ...premiumGifts.filter(p => p.placeholder)]} online={online} onChanged={load} />
      <EventDetails settings={settings} />
      <RSVPSection />
      <Footer />
    </main>
  );
}
