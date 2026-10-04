import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Copy, ExternalLink, Gift, QrCode, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ProductModal({ product, settings, open, onClose, onChanged }) {
  const [showPix, setShowPix] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setShowPix(false);
      setGuestName("");
    }
  }, [open, product?.id]);

  if (!product) return null;

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(settings?.pix_key || "");
      toast.success("Chave PIX copiada!");
    } catch {
      toast.error("Não foi possível copiar a chave");
    }
  };

  const reserve = async () => {
    if (!guestName.trim()) {
      toast.error("Escreva seu nome para marcar o presente");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/products/${product.id}/reserve`, { guest_name: guestName.trim() });
      toast.success("Obrigado! Presente marcado em seu nome.");
      onChanged();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Não foi possível marcar o presente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-3xl p-0 overflow-hidden bg-[#FAF7F2] border-[#E4DDD3] rounded-[1.5rem]"
        data-testid="product-detail-modal"
      >
        <DialogTitle className="sr-only">{product.title}</DialogTitle>
        <div className="grid sm:grid-cols-2 max-h-[85vh] overflow-y-auto">
          <div className="relative">
            <img src={product.image} alt={product.title} className="w-full h-56 sm:h-full object-cover" />
            {product.reserved && (
              <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white/90 text-[#9E7B36] text-xs uppercase tracking-[0.18em] font-semibold flex items-center gap-2">
                <Gift size={13} /> Presenteado
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-[#9E7B36]/80 mb-2">{product.category}</p>
            <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 leading-tight mb-3">{product.title}</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">{product.description}</p>
            <p className="font-serif text-2xl text-[#9E7B36] mb-6">{product.price}</p>

            <div className="space-y-3">
              {product.link_ml && (
                <a
                  href={product.link_ml}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`product-buy-mercadolivre-${product.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#9E7B36] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#856728] hover:-translate-y-0.5 transition-all duration-300 shadow-md"
                >
                  Comprar no Mercado Livre <ExternalLink size={14} />
                </a>
              )}
              {product.link_magalu && (
                <a
                  href={product.link_magalu}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`product-buy-magalu-${product.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-[#C5A059] text-[#9E7B36] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C5A059] hover:text-white hover:-translate-y-0.5 transition-all duration-300"
                >
                  Comprar na Magalu <ExternalLink size={14} />
                </a>
              )}

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-[#E4DDD3]" />
                <span className="text-xs text-stone-400 italic font-serif">ou prefira enviar o valor</span>
                <span className="h-px flex-1 bg-[#E4DDD3]" />
              </div>

              <button
                data-testid={`product-pix-button-${product.id}`}
                onClick={() => setShowPix(!showPix)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#1A1816] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-stone-700 hover:-translate-y-0.5 transition-all duration-300"
              >
                <QrCode size={15} /> Presentear via PIX
              </button>

              {showPix && (
                <div className="rounded-2xl border border-[#C5A059]/50 bg-white p-5 text-center" data-testid="pix-panel">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-1">Chave PIX</p>
                  <p className="font-semibold text-stone-800 break-all mb-1" data-testid="pix-key-text">{settings?.pix_key || "—"}</p>
                  <p className="text-xs text-stone-500 mb-3">{settings?.pix_name}</p>
                  <button
                    data-testid="pix-copy-button"
                    onClick={copyPix}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C5A059] text-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#9E7B36] transition-colors"
                  >
                    <Copy size={13} /> Copiar chave
                  </button>
                </div>
              )}

              {!product.reserved ? (
                <div className="pt-3 border-t border-[#E4DDD3]">
                  <p className="text-xs text-stone-500 mb-2">Já garantiu este presente? Marque para ninguém repetir:</p>
                  <div className="flex gap-2">
                    <input
                      data-testid="reserve-guest-name-input"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Seu nome"
                      className="flex-1 min-w-0 px-4 py-2.5 rounded-full border border-[#E4DDD3] bg-white text-sm focus:outline-none focus:border-[#C5A059]"
                    />
                    <button
                      data-testid={`product-mark-purchased-toggle-${product.id}`}
                      onClick={reserve}
                      disabled={saving}
                      className="px-5 py-2.5 rounded-full bg-[#C5A059] text-white text-xs uppercase tracking-[0.15em] font-semibold hover:bg-[#9E7B36] transition-colors disabled:opacity-60"
                    >
                      {saving ? "..." : "Marcar"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="pt-3 border-t border-[#E4DDD3] text-sm text-stone-500 italic">
                  Este presente já foi escolhido{product.reserved_by ? ` por ${product.reserved_by}` : ""}. Que tal olhar os outros?
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
