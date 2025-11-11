import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCooking } from "@/contexts/CookingContext";

interface HeaderProps {
  onGlossaryClick: () => void;
}

const Header = ({ onGlossaryClick }: HeaderProps) => {
  const { user, signOut } = useCooking();
  const navigate = useNavigate();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <header className="bg-gradient-to-r from-secondary to-background shadow-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-lg">
              <i className="ri-restaurant-2-line text-primary-foreground text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-primary font-pacifico">
              Cozinheiro de Bolso
            </h1>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <button
                  onClick={() => scrollToSection("receitas")}
                  className="text-muted-foreground hover:text-primary transition-colors font-nunito"
                >
                  Receitas
                </button>
                <button
                  onClick={() => scrollToSection("como-funciona")}
                  className="text-muted-foreground hover:text-primary transition-colors font-nunito"
                >
                  Como Funciona
                </button>
                <button
                  onClick={onGlossaryClick}
                  className="text-muted-foreground hover:text-primary transition-colors font-nunito"
                >
                  Glossário
                </button>
                <button
                  onClick={() => scrollToSection("badges")}
                  className="text-muted-foreground hover:text-primary transition-colors font-nunito"
                >
                  Badges
                </button>
                <button
                  onClick={() => navigate("/plans")}
                  className="text-muted-foreground hover:text-primary transition-colors font-nunito"
                >
                  Planos
                </button>
              </>
            ) : null}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Button variant="outline" size="default" onClick={signOut}>
                <i className="ri-logout-box-line mr-2"></i>
                Sair
              </Button>
            ) : (
              <>
                <Button variant="outline" size="default" onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
                <Button variant="hero" size="default" onClick={() => navigate("/auth")}>
                  <i className="ri-rocket-line mr-2"></i>
                  Começar Grátis
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button className="text-primary hover:text-primary-glow transition-colors">
              <i className="ri-menu-line text-2xl"></i>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
