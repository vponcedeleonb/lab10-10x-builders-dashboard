import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompaniesForEmail, setSession } from "@/lib/auth";
import lab10Logo from "@assets/Asset_12_1774543506448.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const companies = getCompaniesForEmail(email.trim());

    setTimeout(() => {
      setLoading(false);
      if (companies.length > 0) {
        setSession(email.trim().toLowerCase());
        navigate(companies.length === 1 ? `/${companies[0]}` : "/select");
      } else {
        setError("Este correo no está autorizado para acceder al dashboard.");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={lab10Logo} alt="LAB10" className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-gray-900">10x Builders Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Ingresa tu correo para acceder al reporte de tu empresa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "'PT Mono', monospace" }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="tu@empresa.com"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verificando..." : "Acceder"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          LAB10 · 10x Builders Program
        </p>
      </div>
    </div>
  );
}
