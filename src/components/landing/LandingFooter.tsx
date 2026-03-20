import { Instagram, Mail, MessageSquare } from "lucide-react";
import logoUpsalon from "@/assets/logo-upsalon.png";
import textUpsalon from "@/assets/text-upsalon.png";

const LandingFooter = () => {
  return (
    <footer className="border-t border-border py-10 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-8 items-start">
          {/* Logo */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src={logoUpsalon} alt="UpSalon" className="h-8 w-8 object-contain" />
              <img src={textUpsalon} alt="UpSalon" className="h-4 object-contain" />
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              A gestão inteligente para seu salão de beleza.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-foreground">Links</p>
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Funcionalidades
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Preços
            </a>
            <a
              href="#about"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Sobre nós
            </a>
          </div>

          {/* Contato */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-foreground">Contato & Redes</p>
            <a
              href="https://www.instagram.com/upsalon.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-accent transition-colors font-sans"
            >
              <Instagram className="h-4 w-4" />
              @upsalon.app
            </a>
            <a
              href="mailto:contato.upsalon@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
            >
              <Mail className="h-4 w-4" />
              contato.upsalon@gmail.com
            </a>
            <a
              href="https://wa.me/5517992018693?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20com%20o%20UpSalon"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-success transition-colors font-sans"
            >
              <MessageSquare className="h-4 w-4" />
              Suporte via WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground font-sans">
            © {new Date().getFullYear()} UpSalon. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
