import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-accent/5 to-accent/10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-purple-accent/10 text-purple-accent text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-purple-accent" />
            A plataforma #1 para salões de beleza
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
            Reduza faltas, organize sua agenda e aumente seu faturamento com o{" "}
            <span className="text-primary">UpSalon</span>.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 font-sans max-w-2xl mx-auto">
            UpSalon é a gestão inteligente que transforma a rotina do seu salão. Agenda online, controle financeiro, comissões automáticas e muito mais — tudo em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg shadow-primary/25" onClick={() => navigate("/auth")}>
              Começar teste grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Ver funcionalidades
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 font-sans">5 dias grátis • Depois R$ 69/mês • Cancele quando quiser</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
