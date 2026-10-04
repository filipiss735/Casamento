import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import GiftReservationModal from "./GiftReservationModal";

export function storeLink(product) {
  if (product.tier === "premium" || product.tier === "pix") return "";
  try {
    const url = new URL(product.link_ml || product.link_magalu);
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

function merchant(product) {
  if (product.tier === "pix") return "Cota de presente em Pix";
  if (product.tier === "premium") return "Somente reserva";
  const url = storeLink(product);
  if (url.includes("shopee")) return "Shopee";
  if (url.includes("mercadolivre")) return "Mercado Livre";
  if (url.includes("magazineluiza") || url.includes("magalu")) return "Magalu";
  return "Loja do presente";
}

export default function ProductCarousel({ products, online, settings, onChanged, id = "presentes", title = "Escolha com carinho", subtitle = "Reserve seu presente antes de comprar. Preços e disponibilidade devem ser confirmados na loja." }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [selected, setSelected] = useState(null);
  return (
    <section id={id} className="py-16 sm:py-20 bg-[#F3EFE6]" data-testid={`${id}-section`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#9E7B36] mb-3">Lista de presentes</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">{title}</h2>
        <p className="text-stone-600 mt-3 max-w-xl text-sm">{subtitle}</p>
        {!online && <p role="status" className="mt-3 text-sm text-amber-900">Não foi possível consultar as reservas. Você pode abrir o formulário, mas a confirmação depende da conexão com o servidor. <button onClick={onChanged} className="underline font-semibold">Tentar novamente</button></p>}
        {id === "presentes-pix" && online && (!settings?.pix_key?.trim() || !settings?.pix_name?.trim()) && <p role="status" className="mt-3 text-sm text-amber-900">O casal ainda está configurando os dados do Pix.</p>}
        <div className="flex justify-end gap-3 my-6">
          <button aria-label={`Anterior — ${title}`} onClick={() => emblaApi?.scrollPrev()} className="p-3 rounded-full border border-[#C5A059] text-[#9E7B36]"><ChevronLeft /></button>
          <button aria-label={`Próximo — ${title}`} onClick={() => emblaApi?.scrollNext()} className="p-3 rounded-full border border-[#C5A059] text-[#9E7B36]"><ChevronRight /></button>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {products.map((p) => (
              <article key={p.id} data-testid={`product-card-${p.id}`} className={`shrink-0 basis-[86%] sm:basis-[46%] lg:basis-[31%] flex flex-col rounded-3xl overflow-hidden border border-[#E4DDD3] ${p.reserved ? "bg-stone-200 grayscale opacity-70" : "bg-white"}`}>
                {p.image ? <img src={p.image} alt={p.title} className="w-full aspect-[4/3] object-contain p-4" loading="lazy" /> : <div className="aspect-[4/3] flex items-center justify-center bg-stone-100 text-stone-400"><Gift size={64} aria-hidden="true" /></div>}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs uppercase tracking-widest text-[#9E7B36] mb-2">{p.placeholder ? "Exemplo para substituir" : merchant(p)}</p>
                  <h3 className="font-serif text-2xl text-stone-900 leading-snug mb-3">{p.title}</h3>
                  {p.tier === "pix" && <p className="text-sm text-stone-500 mb-2">{p.description}</p>}
                  {p.placeholder ? <p className="text-sm text-stone-500">Adicione a foto, o preço e o link do produto real para disponibilizar este presente.</p> : <>
                    {p.tier !== "premium" && <>
                      <p className="text-[#9E7B36] font-semibold">{p.price}</p>
                      {p.price_note && <p className="text-xs text-stone-500 mt-1">{p.price_note}</p>}
                      {p.checked_at && <p className="text-xs text-stone-500 mt-2">Preço consultado em {p.checked_at.split("-").reverse().join("/")}.</p>}
                    </>}
                  </>}
                  <div className="mt-auto pt-6">
                    {!p.reserved && !p.placeholder && storeLink(p) && <a href={storeLink(p)} target="_blank" rel="noopener noreferrer" className="block text-center underline text-sm text-stone-600 mb-3">Ver produto na loja</a>}
                    <button onClick={() => setSelected(p)} disabled={p.placeholder || p.reserved} className="w-full py-3 px-4 rounded-full bg-[#9E7B36] text-white text-sm font-semibold disabled:bg-stone-400 disabled:cursor-not-allowed">
                      {p.placeholder ? "Exemplo — ainda indisponível" : p.reserved ? "Indisponível — já escolhido" : "meu presente é esse"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      {selected && <GiftReservationModal product={selected} online={online} settings={settings} onClose={() => setSelected(null)} onChanged={onChanged} />}
    </section>
  );
}
