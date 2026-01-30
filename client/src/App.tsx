import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Patrimonios from "./pages/Patrimonios";
import Sugestoes from "./pages/Sugestoes";
import UploadImagem from "./pages/UploadImagem";
import Relatorios from "./pages/Relatorios";
import UploadCSV from "./pages/UploadCSV";
import Levantamento from "./pages/Levantamento";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#005A92] to-[#00A651]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Usuário autenticado, renderiza componente
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/patrimonios">
        <ProtectedRoute component={Patrimonios} />
      </Route>
      <Route path="/levantamento">
        <ProtectedRoute component={Levantamento} />
      </Route>
      <Route path="/sugestoes">
        <ProtectedRoute component={Sugestoes} />
      </Route>
      <Route path="/upload-imagem">
        <ProtectedRoute component={UploadImagem} />
      </Route>
      <Route path="/relatorios">
        <ProtectedRoute component={Relatorios} />
      </Route>
      <Route path="/upload-csv">
        <ProtectedRoute component={UploadCSV} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
