import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import logoUpsalon from "@/assets/logo-upsalon.png";
import textUpsalon from "@/assets/text-upsalon.png";

const LandingHeader = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoUpsalon} alt="UpSalon" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
          <img src={textUpsalon} alt="UpSalon" className="h-4 sm:h-5 object-contain" />
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Entrar
          </Button>
          <Button onClick={() => navigate("/auth")}>
            Teste grátis <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Button variant="outline" className="w-full" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>
            Entrar
          </Button>
          <Button className="w-full" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>
            Teste grátis <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
