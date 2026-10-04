import { useEffect, useState, useCallback } from "react";
import Lenis from "lenis";
import { api } from "@/lib/api";
import { featuredGifts } from "@/data/featuredGifts";
import Navbar from "@/Components/NavBar";
import Hero from "@/Components/hero";
import { premiumGifts } from "@/data/premiumGifts";
import { pixGifts } from "@/data/pixGifts";
import pixSettings from "@/data/pixSettings.json";
import PixGifts from "@/Components/PixGifts";
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
    const [productsResult, settingsResult] = await Promise.allSettled([
      api.get("/products"),
      api.get("/settings"),
    ]);

    if (productsResult.status !== "fulfilled" || !Array.isArray(productsResult.value.data)) {
      setOnline(false);
      return;
    }

    setProducts(productsResult.value.data);
    setSettings(
      settingsResult.status === "fulfilled" && settingsResult.value.data && typeof settingsResult.value.data === "object"
        ? settingsResult.value.data
        : pixSettings
    );
    setOnline(true);
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
      <ProductCarousel products={online ? products.filter(p => p.tier !== "premium" && p.tier !== "pix") : featuredGifts} online={online} onChanged={load} />
      <ProductCarousel id="presentes-especiais" title="Presentes especiais" subtitle="Escolha e reserve seu presente. Combine os detalhes e a entrega com o casal." products={[...(online ? products.filter(p => p.tier === "premium") : premiumGifts.filter(p => !p.placeholder).map(p => ({ ...p, tier: "premium" }))), ...premiumGifts.filter(p => p.placeholder)]} online={online} onChanged={load} />
      <PixGifts products={online ? products.filter(p => p.tier === "pix") : pixGifts} online={online} settings={settings} onChanged={load} />
      <EventDetails settings={settings} />
      <RSVPSection />
      <Footer />
    </main>
  );
}
