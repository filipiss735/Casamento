import { useState } from "react";
import { Gift } from "lucide-react";
import GiftReservationModal from "./GiftReservationModal";

export default function PixGifts({ products, online, settings, onChanged }) {
  const [selected, setSelected] = useState(null);
  return <section id="presentes-pix" className="py-20 bg-[#FAF7F2]" data-testid="presentes-pix-section">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <p className="font-script text-3xl text-[#9E7B36] text-center">Um carinho para o nosso lar</p>
      <h2 className="font-serif text-4xl text-center mt-2">Presentes em Pix</h2>
      <p className="text-center text-stone-600 max-w-xl mx-auto mt-4">São 10 cotas de cada valor. Você pode reservar mais de uma, inclusive de valores diferentes. Cada reserva reduz uma cota disponível.</p>
      <p className="text-center text-sm text-stone-500 mt-2">Reservar não realiza nem confirma o pagamento. Após a reserva, transfira pelo aplicativo do seu banco.</p>
      <div className="grid sm:grid-cols-3 gap-6 mt-10">
        {[50, 100, 200].map(amount => {
          const quotas = products.filter(p => p.id.startsWith(`pix-${amount}-`));
          const available = quotas.filter(p => !p.reserved);
          const target = available[0];
          const exhausted = online && available.length === 0;
          return <article key={amount} data-testid={`pix-group-${amount}`} className={`rounded-3xl border border-[#E4DDD3] p-8 text-center ${exhausted ? "bg-stone-200 grayscale" : "bg-white"}`}>
            <Gift size={32} className="mx-auto text-[#9E7B36]" aria-hidden="true" />
            <h3 className="font-serif text-4xl mt-5">R$ {amount},00</h3>
            <p className="text-sm text-stone-600 my-4" aria-live="polite">{online ? `${available.length} de 10 cotas disponíveis` : "10 cotas no total — aguardando consulta"}</p>
            <button disabled={exhausted || !target} onClick={() => setSelected(target)} className="w-full rounded-full bg-[#9E7B36] text-white py-3 px-3 disabled:bg-stone-400 disabled:cursor-not-allowed">{exhausted ? "Todas as cotas reservadas" : `Presentear R$ ${amount}`}</button>
          </article>;
        })}
      </div>
    </div>
    {selected && <GiftReservationModal product={selected} online={online} settings={settings} onChanged={onChanged} onClose={() => setSelected(null)} />}
  </section>;
}
