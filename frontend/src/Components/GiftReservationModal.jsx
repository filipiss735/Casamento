import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api, apiError } from "@/lib/api";
import { storeLink } from "./ProductCarousel";

export default function GiftReservationModal({ product, onClose, onChanged }) {
  const [form, setForm] = useState({ guest_name: "", phone: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (form.guest_name.trim().split(/\s+/).length < 2) { setError("Informe seu nome completo."); return; }
    setSaving(true);
    try {
      await api.post(`/products/${product.id}/reserve`, form);
      setSuccess(true);
      onChanged();
    } catch (e) {
      setError(apiError(e));
      if (e.response?.status === 409) onChanged();
    } finally { setSaving(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
    <DialogContent data-lenis-prevent className="bg-[#FAF7F2] rounded-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">{success ? "Presente reservado!" : "meu presente é esse"}</DialogTitle>
        <DialogDescription>{product.title}</DialogDescription>
      </DialogHeader>
      {success ? <div className="space-y-4" role="status">
        <p>Este presente ficou reservado para você e indisponível para os outros convidados.</p>
        <p className="text-sm text-stone-600">{product.tier === "premium" ? "Combine os detalhes e a entrega com o casal. Este site registra apenas a reserva, sem compra ou pagamento." : "A reserva não realiza a compra. Finalize a compra na loja."} Se desistir, avise o casal para liberar o item.</p>
        {storeLink(product) && <a className="block text-center py-3 rounded-full bg-[#9E7B36] text-white" href={storeLink(product)} target="_blank" rel="noopener noreferrer">Comprar na loja</a>}
        <button className="w-full py-2 underline" onClick={onClose}>Concluir</button>
      </div> : <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-stone-600">O casal receberá seus dados para organizar os presentes. Telefone e mensagem não serão exibidos publicamente.</p>
        <label className="block text-sm">Nome completo
          <input autoComplete="name" required minLength={3} maxLength={120} value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} className="block w-full border rounded-xl p-3 mt-1" disabled={saving} />
        </label>
        <label className="block text-sm">Telefone com DDD
          <input type="tel" autoComplete="tel" required minLength={10} maxLength={25} placeholder="(85) 99999-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="block w-full border rounded-xl p-3 mt-1" disabled={saving} />
        </label>
        <label className="block text-sm">Mensagem (opcional)
          <textarea maxLength={1000} rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="block w-full border rounded-xl p-3 mt-1" disabled={saving} />
        </label>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        <button type="submit" disabled={saving} className="w-full py-3 rounded-full bg-[#9E7B36] text-white disabled:opacity-60">{saving ? "Reservando..." : "Confirmar meu presente"}</button>
      </form>}
    </DialogContent>
  </Dialog>;
}
