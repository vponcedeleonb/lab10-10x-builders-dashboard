import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import CompanySelectPage from "@/pages/CompanySelectPage";
import { canAccessCompany, getSessionCompanies } from "@/lib/auth";

const queryClient = new QueryClient();

function ProtectedRoute({ company }: { company: string }) {
  const companies = getSessionCompanies();
  if (companies.length === 0) return <Navigate to="/" replace />;
  if (!canAccessCompany(company)) {
    return companies.length === 1
      ? <Navigate to={`/${companies[0]}`} replace />
      : <Navigate to="/select" replace />;
  }
  return <Dashboard company={company} />;
}

function SelectRoute() {
  const companies = getSessionCompanies();
  if (companies.length === 0) return <Navigate to="/" replace />;
  if (companies.length === 1) return <Navigate to={`/${companies[0]}`} replace />;
  return <CompanySelectPage />;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route path="/"        element={<LoginPage />} />
          <Route path="/select"  element={<SelectRoute />} />
          <Route path="/tributi" element={<ProtectedRoute company="tributi" />} />
          <Route path="/truora"  element={<ProtectedRoute company="truora" />} />
          <Route path="/mono"    element={<ProtectedRoute company="mono" />} />
          <Route path="/bacu"    element={<ProtectedRoute company="bacu" />} />
          <Route path="/skalo"   element={<ProtectedRoute company="skalo" />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
