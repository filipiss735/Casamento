import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, RotateCcw, LogOut, ExternalLink, Users, Gift, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const EMPTY_FORM = { title: "", category: "", description: "", price: "", image: "", link_ml: "", link_magalu: "" };

function ProductForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const fields = [
    ["title", "Nome do presente", "Ex.: Jogo de Toalhas"],
    ["category", "Categoria", "Ex.: Cama & Banho"],
    ["price", "Preço aproximado", "Ex.: R$ 250,00"],
    ["image", "URL da foto", "https://..."],
    ["link_ml", "Link Mercado Livre", "https://www.mercadolivre.com.br/..."],
    ["link_magalu", "Link Magalu", "https://www.magazineluiza.com.br/..."],
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4 pt-2"
    >
      {fields.map(([key, label, ph]) => (
        <div key={key}>
          <label className="block text-xs uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">{label}</label>
          <input
            data-testid={`product-form-${key}-input`}
            value={form[key]}
            onChange={set(key)}
            placeholder={ph}
            required={key === "title"}
            className="w-full px-4 py-3 rounded-xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">Descrição</label>
        <textarea
          data-testid="product-form-description-input"
          value={form.description}
          onChange={set("description")}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059] resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full border border-[#E4DDD3] text-stone-500 text-xs uppercase tracking-[0.2em] font-semibold hover:border-stone-400 transition-colors">
          Cancelar
        </button>
        <button data-testid="product-form-save-button" type="submit" disabled={saving} className="flex-1 py-3 rounded-full bg-[#9E7B36] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#856728] transition-colors disabled:opacity-60">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("presentes");
  const [products, setProducts] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [settings, setSettings] = useState({ pix_key: "", pix_name: "", party_time: "", party_address: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem("cha_admin_token");
    navigate("/admin");
  }, [navigate]);

  const load = useCallback(async () => {
    try {
      const [p, r, s, reservationsResponse] = await Promise.all([api.get("/products"), api.get("/rsvp"), api.get("/settings"), api.get("/reservations")]);
      setReservations(reservationsResponse.data);
      setProducts(p.data);
      setRsvps(r.data);
      setSettings(s.data);
    } catch (e) {
      if (e.response?.status === 401) logout();
      else toast.error("Erro ao carregar dados");
    }
  }, [logout]);

  useEffect(() => {
    if (!sessionStorage.getItem("cha_admin_token")) {
      navigate("/admin");
      return;
    }
    load();
  }, [load, navigate]);

  const saveProduct = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, { ...editing, ...form });
        toast.success("Presente atualizado!");
      } else {
        await api.post("/products", form);
        toast.success("Presente adicionado!");
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (p) => {
    if (!window.confirm(`Remover "${p.title}"?`)) return;
    await api.delete(`/products/${p.id}`);
    toast.success("Presente removido");
    load();
  };

  const unreserve = async (p) => {
    await api.delete(`/products/${p.id}/reserve`);
    toast.success("Presente liberado novamente");
    load();
  };

  const removeRsvp = async (r) => {
    await api.delete(`/rsvp/${r.id}`);
    load();
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put("/settings", settings);
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  const attending = rsvps.filter((r) => r.attending);
  const totalPeople = attending.reduce((acc, r) => acc + 1 + (r.companions || 0), 0);

  const TABS = [
    ["presentes", "Presentes"],
    ["confirmacoes", "Confirmações"],
    ["reservas", "Reservas de presentes"],
    ["configuracoes", "Configurações"],
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] texture-grain" data-testid="admin-dashboard">
      <header className="bg-white border-b border-[#E4DDD3] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full border border-[#C5A059] flex items-center justify-center font-cinzel text-xs text-[#9E7B36]">F&L</span>
            <span className="font-serif text-lg text-stone-800">Painel do Casal</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} data-testid="admin-view-site-button" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E4DDD3] text-xs uppercase tracking-[0.15em] font-semibold text-stone-500 hover:border-[#C5A059] hover:text-[#9E7B36] transition-colors">
              <ExternalLink size={13} /> Ver site
            </button>
            <button onClick={logout} data-testid="admin-logout-button" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1A1816] text-white text-xs uppercase tracking-[0.15em] font-semibold hover:bg-stone-700 transition-colors">
              <LogOut size={13} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto" data-testid="admin-tabs">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              data-testid={`admin-tab-${key}`}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold whitespace-nowrap transition-all duration-300 ${
                tab === key ? "bg-[#9E7B36] text-white shadow-md" : "bg-white border border-[#E4DDD3] text-stone-500 hover:border-[#C5A059]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "presentes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-stone-500">{products.length} presente(s) na lista</p>
              <button
                data-testid="admin-add-product-button"
                onClick={() => { setEditing(null); setFormOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C5A059] text-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#9E7B36] hover:-translate-y-0.5 transition-all duration-300 shadow-md"
              >
                <Plus size={14} /> Adicionar presente
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-[#E4DDD3] overflow-hidden" data-testid={`admin-product-${p.id}`}>
                  <div className="relative">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-[#F3EFE6] flex items-center justify-center text-stone-300"><Gift size={32} /></div>
                    )}
                    {p.reserved && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-[#9E7B36] text-[10px] uppercase tracking-[0.15em] font-semibold">
                        Presenteado{p.reserved_by ? ` · ${p.reserved_by}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E7B36]/80 font-semibold">{p.category}</p>
                    <h3 className="font-serif text-lg text-stone-900 leading-snug">{p.title}</h3>
                    <p className="text-sm text-[#9E7B36] font-semibold mt-1">{p.price}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => { setEditing(p); setFormOpen(true); }} data-testid={`admin-edit-product-${p.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border border-[#E4DDD3] text-xs font-semibold text-stone-500 hover:border-[#C5A059] hover:text-[#9E7B36] transition-colors">
                        <Pencil size={12} /> Editar
                      </button>
                      {p.reserved && (
                        <button onClick={() => unreserve(p)} data-testid={`admin-unreserve-product-${p.id}`} title="Liberar presente" className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E4DDD3] text-stone-400 hover:border-[#C5A059] hover:text-[#9E7B36] transition-colors">
                          <RotateCcw size={13} />
                        </button>
                      )}
                      <button onClick={() => removeProduct(p)} data-testid={`admin-delete-product-${p.id}`} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E4DDD3] text-stone-400 hover:border-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "confirmacoes" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: CheckCircle2, label: "Confirmados", value: attending.length },
                { icon: Users, label: "Total de pessoas", value: totalPeople },
                { icon: Gift, label: "Presentes escolhidos", value: products.filter((p) => p.reserved).length },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-[#E4DDD3] p-6 text-center" data-testid={`admin-stat-${s.label.toLowerCase().replace(/ /g, "-")}`}>
                  <s.icon size={20} className="mx-auto text-[#C5A059] mb-2" />
                  <p className="font-serif text-3xl text-stone-900">{s.value}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3" data-testid="admin-rsvp-list">
              {rsvps.length === 0 && <p className="text-sm text-stone-400 text-center py-10">Nenhuma confirmação ainda.</p>}
              {rsvps.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-[#E4DDD3] px-5 py-4 flex items-center justify-between gap-4" data-testid={`admin-rsvp-${r.id}`}>
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800 text-sm">
                      {r.name}
                      <span className={`ml-3 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.12em] ${r.attending ? "bg-[#E8ECE6] text-green-800" : "bg-stone-100 text-stone-500"}`}>
                        {r.attending ? `Vai · +${r.companions || 0}` : "Não vai"}
                      </span>
                    </p>
                    {r.message && <p className="text-xs text-stone-400 italic mt-1 truncate">"{r.message}"</p>}
                  </div>
                  <button onClick={() => removeRsvp(r)} data-testid={`admin-delete-rsvp-${r.id}`} className="text-stone-300 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reservas" && <div className="space-y-4">
          <p className="text-sm text-stone-600">{reservations.length} reserva(s). Dados privados, visíveis apenas ao casal.</p>
          {reservations.map(r => <article key={r.product_id} className="p-6 bg-white rounded-2xl border border-[#E4DDD3]">
            <h2 className="font-serif text-xl">{r.title}</h2>
            <p className="mt-2 font-semibold">{r.name}</p>
            <p>Telefone: {r.phone || "Não informado"}</p>
            {r.message && <p className="mt-2 whitespace-pre-wrap break-words">{r.message}</p>}
          </article>)}
        </div>}

        {tab === "configuracoes" && (
          <div className="max-w-xl">
            <div className="bg-white rounded-2xl border border-[#E4DDD3] p-6 sm:p-8 space-y-5" data-testid="admin-settings-form">
              {[
                ["pix_key", "Chave PIX", "E-mail, CPF, telefone ou chave aleatória", "admin-pix-key-input"],
                ["pix_name", "Nome no PIX", "Ex.: Filipi & Larissa", "admin-pix-name-input"],
                ["party_time", "Horário da festa", "Ex.: 19h00", "admin-party-time-input"],
                ["party_address", "Endereço da festa", "Rua, número, bairro, cidade", "admin-party-address-input"],
              ].map(([key, label, ph, testid]) => (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-[0.18em] font-semibold text-stone-500 mb-1.5">{label}</label>
                  <input
                    data-testid={testid}
                    value={settings[key] || ""}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    placeholder={ph}
                    className="w-full px-4 py-3 rounded-xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              ))}
              <button
                data-testid="admin-save-settings-button"
                onClick={saveSettings}
                disabled={saving}
                className="w-full py-3.5 rounded-full bg-[#9E7B36] text-white text-xs uppercase tracking-[0.22em] font-semibold hover:bg-[#856728] transition-colors disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg bg-[#FAF7F2] border-[#E4DDD3] rounded-[1.5rem] max-h-[88vh] overflow-y-auto" data-testid="product-form-dialog">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-stone-900">{editing ? "Editar presente" : "Novo presente"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            initial={editing ? { title: editing.title, category: editing.category, description: editing.description, price: editing.price, image: editing.image, link_ml: editing.link_ml, link_magalu: editing.link_magalu } : EMPTY_FORM}
            onSave={saveProduct}
            onClose={() => { setFormOpen(false); setEditing(null); }}
            saving={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
