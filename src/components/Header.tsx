import { Button } from "@/components/ui/button";

const Header = () => {
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
            <a href="#receitas" className="text-muted-foreground hover:text-primary transition-colors font-nunito">
              Receitas
            </a>
            <a href="#como-funciona" className="text-muted-foreground hover:text-primary transition-colors font-nunito">
              Como Funciona
            </a>
            <a href="#badges" className="text-muted-foreground hover:text-primary transition-colors font-nunito">
              Badges
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="default">
              Entrar
            </Button>
            <Button variant="hero" size="default">
              <i className="ri-rocket-line mr-2"></i>
              Começar Grátis
            </Button>
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
