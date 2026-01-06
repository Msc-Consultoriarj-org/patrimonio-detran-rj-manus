import { useEffect } from "react";

export default function OAuthCallback() {
  useEffect(() => {
    // Recuperar login DETRAN do localStorage
    const detranLogin = localStorage.getItem("detran_login_pending");
    
    if (detranLogin) {
      // Adicionar detranLogin à URL do callback
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("detran_login", detranLogin);
      
      // Limpar localStorage
      localStorage.removeItem("detran_login_pending");
      
      // Redirecionar para o callback real com o detranLogin
      window.location.href = currentUrl.toString();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0066CC] via-[#0088AA] to-[#00AA44]">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Finalizando autenticação...</p>
      </div>
    </div>
  );
}
