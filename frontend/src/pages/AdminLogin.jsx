import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      sessionStorage.setItem("cha_admin_token", data.token);
      navigate("/admin/painel");
    } catch (err) {
      toast.error(err.response?.data?.detail || "E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] texture-grain flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-[#E4DDD3] p-8 sm:p-10 gold-frame">
        <div className="text-center mb-8">
          <span className="inline-flex w-14 h-14 rounded-full border border-[#C5A059] items-center justify-center font-cinzel text-[#9E7B36] tracking-widest mb-4">
            F&L
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-stone-900">Área do Casal</h1>
          <p className="text-sm text-stone-500 mt-1">Gerencie presentes, confirmações e a chave PIX</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-stone-500 mb-2">E-mail</label>
            <input
              data-testid="admin-login-username-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-stone-500 mb-2">Senha</label>
            <input
              data-testid="admin-login-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-[#E4DDD3] bg-[#FAF7F2] text-sm focus:outline-none focus:border-[#C5A059]"
            />
          </div>
          <button
            data-testid="admin-login-submit-button"
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#9E7B36] text-white text-xs uppercase tracking-[0.25em] font-semibold hover:bg-[#856728] transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <button onClick={() => navigate("/")} className="mt-6 w-full text-center text-xs text-stone-400 hover:text-[#9E7B36] transition-colors uppercase tracking-[0.2em]" data-testid="admin-back-home-link">
          Voltar ao site
        </button>
      </div>
    </div>
  );
}
