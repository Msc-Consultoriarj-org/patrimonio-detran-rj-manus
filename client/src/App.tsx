import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import Patrimonios from "./pages/Patrimonios";
import Sugestoes from "./pages/Sugestoes";
import UploadImagem from "./pages/UploadImagem";
import Relatorios from "./pages/Relatorios";
import UploadCSV from "./pages/UploadCSV";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
