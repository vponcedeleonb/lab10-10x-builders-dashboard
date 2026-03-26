import { useNavigate } from "react-router-dom";
import { getSessionCompanies, clearSession } from "@/lib/auth";
import { LogOut } from "lucide-react";
import lab10Logo from "@assets/Asset_12_1774543506448.png";

const COMPANY_LABELS: Record<string, string> = {
  tributi: "Tributi",
  truora:  "Truora",
  mono:    "Mono",
  bacu:    "Bacu",
};

const COMPANY_COLORS: Record<string, string> = {
  tributi: "#EDF25F",
  truora:  "#A9A0EC",
  mono:    "#D9E3E3",
  bacu:    "#000000",
};

const COMPANY_TEXT: Record<string, string> = {
  tributi: "#000000",
  truora:  "#000000",
  mono:    "#000000",
  bacu:    "#ffffff",
};

export default function CompanySelectPage() {
  const navigate = useNavigate();
  const companies = getSessionCompanies();

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  if (companies.length === 0) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={lab10Logo} alt="LAB10" className="h-10 w-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-gray-900">Selecciona una empresa</h1>
            <p className="text-sm text-gray-400 mt-1">
              Tienes acceso al dashboard de las siguientes empresas.
            </p>
          </div>

          <div className="space-y-2">
            {companies.map((slug) => {
              const label = COMPANY_LABELS[slug] ?? slug;
              const bg = COMPANY_COLORS[slug] ?? "#EDF25F";
              const color = COMPANY_TEXT[slug] ?? "#000000";
              return (
                <button
                  key={slug}
                  onClick={() => navigate(`/${slug}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: bg, color, fontFamily: "'PT Mono', monospace" }}
                  >
                    {label.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-medium text-gray-900">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center gap-1.5 text-sm text-gray-300 hover:text-gray-500 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
