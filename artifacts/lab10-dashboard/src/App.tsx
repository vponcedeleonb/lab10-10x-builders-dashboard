import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import { getSessionCompany } from "@/lib/auth";

const queryClient = new QueryClient();

function ProtectedRoute({ company }: { company: string }) {
  const sessionCompany = getSessionCompany();
  if (!sessionCompany) return <Navigate to="/" replace />;
  if (sessionCompany !== company) return <Navigate to={`/${sessionCompany}`} replace />;
  return <Dashboard company={company} />;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/tributi" element={<ProtectedRoute company="tributi" />} />
          <Route path="/truora"  element={<ProtectedRoute company="truora" />} />
          <Route path="/mono"    element={<ProtectedRoute company="mono" />} />
          <Route path="/bacu"    element={<ProtectedRoute company="bacu" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
