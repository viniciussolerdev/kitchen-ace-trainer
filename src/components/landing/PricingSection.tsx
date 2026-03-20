import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const planBenefits = [
  "Agenda ilimitada",
  "Agendamento online para clientes",
  "Gestão financeira completa",
  "Controle de comissões automático",
  "Profissionais ilimitados",
  "Dashboard com métricas em tempo real",
  "Notificações via WhatsApp e E-mail",
  "Suporte dedicado",
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Preço especial de lançamento
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Um plano. Tudo incluso.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-sans max-w-xl mx-auto">
            Sem surpresas, sem taxas escondidas. Acesso total a todas as funcionalidades.
          </p>
        </div>

        <div className="max-w-lg mx-auto px-2 sm:px-0">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-purple-accent/40 to-primary/40 rounded-3xl blur-xl opacity-60" />

            <div className="relative bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-2xl">
              {/* Top gradient bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-purple-accent to-primary" />

              {/* Popular badge */}
              <div className="flex justify-center -mb-3 pt-5 sm:pt-6">
                <span className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 sm:px-5 py-1.5 rounded-full shadow-lg shadow-primary/30">
                  Mais popular
                </span>
              </div>

              <div className="p-5 sm:p-8 pt-5 sm:pt-6">
                {/* Price */}
                <div className="text-center mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider font-sans mb-3 sm:mb-4">
                    Plano Profissional
                  </p>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-base sm:text-lg text-muted-foreground font-sans line-through">R$ 99</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-foreground font-sans font-medium">R$</span>
                    <span className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">69</span>
                    <span className="text-muted-foreground font-sans">/mês</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                    <Zap className="h-3.5 w-3.5 text-success" />
                    <span className="text-[10px] sm:text-xs font-bold text-success uppercase tracking-wider">5 dias grátis para testar</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                  {planBenefits.map((b) => (
                    <div key={b} className="flex items-center gap-2.5 sm:gap-3">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground font-sans">{b}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  className="w-full text-base sm:text-lg py-5 sm:py-6 shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  size="lg"
                  onClick={() => navigate("/auth")}
                >
                  Começar meu teste grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-5 text-[10px] sm:text-xs text-muted-foreground font-sans flex-wrap">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Cancele quando quiser
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Sem fidelidade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
