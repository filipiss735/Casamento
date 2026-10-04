import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";

export default function RSVPSection() {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState(true);
  const [companions, setCompanions] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe seu nome");
      return;
    }
    setError("");
    setSending(true);
    try {
      await api.post("/rsvp", {
        name: name.trim(),
        attending,
        companions: attending ? Number(companions) : 0,
        message: message.trim(),
      });
      setSent(true);
      toast.success("Confirmação enviada! Obrigado.");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="confirmar" className="py-20 sm:py-28 bg-[#F3EFE6] texture-grain" data-testid="rsvp-section">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <p className="font-script text-3xl sm:text-4xl text-[#9E7B36] mb-2">Confirmação de presença</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight">Você vem brindar com a gente?</h2>
          <p className="text-stone-500 mt-3 text-sm sm:text-base">Confirme até 1º de dezembro de 2026 para prepararmos tudo com carinho.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-[2rem] border border-[#E4DDD3] p-8 sm:p-10 gold-frame"
        >
          {sent ? (
            <div role="status" className="text-center py-8" data-testid="rsvp-success-message">
              <CheckCircle2 size={48} className="mx-auto text-[#C5A059] mb-4" strokeWidth={1.5} />
              <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 mb-2">
                {attending ? "Presença confirmada!" : "Que pena!"}
              </h3>
              <p className="text-stone-500 text-sm sm:text-base">
                {attending
                  ? "Estamos contando os dias para celebrar com você, " + name.split(" ")[0] + "."
                  : "Você fará falta, " + name.split(" ")[0] + ". Obrigado por avisar!"}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              {error && <p role="alert" className="text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-stone-500 mb-2">Seu nome completo</label>
                <input
                  required minLength={3} maxLength={120}
                  data-testid="rsvp-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Maria Silva"
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-stone-500 mb-2">Você vai comparecer?</label>
                <div className="grid grid-cols-2 gap-3" data-testid="rsvp-attending-select">
                  <button
                    type="button"
                    onClick={() => setAttending(true)}
                    data-testid="rsvp-attending-yes"
                    className={`py-3.5 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
                      attending
                        ? "border-[#C5A059] bg-[#C5A059] text-white shadow-md"
                        : "border-[#E4DDD3] text-stone-500 hover:border-[#C5A059]/60"
                    }`}
                  >
                    Sim, estarei lá!
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttending(false)}
                    data-testid="rsvp-attending-no"
                    className={`py-3.5 rounded-2xl border text-sm font-semibold transition-all duration-300 ${
                      !attending
                        ? "border-stone-500 bg-stone-600 text-white shadow-md"
                        : "border-[#E4DDD3] text-stone-500 hover:border-stone-400"
                    }`}
                  >
                    Não poderei ir
                  </button>
                </div>
              </div>

              {attending && (
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-stone-500 mb-2">Acompanhantes (além de você)</label>
                  <input
                    data-testid="rsvp-companions-input"
                    type="number"
                    min="0"
                    max="10"
                    value={companions}
                    onChange={(e) => setCompanions(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-stone-500 mb-2">Recado para o casal (opcional)</label>
                <textarea
                  data-testid="rsvp-message-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Deixe uma mensagem carinhosa..."
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>

              <button
                data-testid="rsvp-submit-button"
                type="submit"
                disabled={sending}
                className="w-full py-4 rounded-full bg-[#9E7B36] text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#856728] hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Send size={15} /> {sending ? "Enviando..." : "Enviar Confirmação"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
