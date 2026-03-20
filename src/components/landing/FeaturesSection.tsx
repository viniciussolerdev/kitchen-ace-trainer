import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Users,
  DollarSign,
  Globe,
  MessageSquare,
  BarChart3,
  Shield,
  Scissors,
  Mail,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    desc: "Visualize e gerencie todos os agendamentos do seu salão em tempo real, com visão diária e semanal.",
  },
  {
    icon: Globe,
    title: "Agendamento Online",
    desc: "Seus clientes agendam direto pelo link exclusivo do seu salão, 24 horas por dia.",
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    desc: "Cadastro completo, histórico de visitas, anotações e última visita de cada cliente.",
  },
  {
    icon: DollarSign,
    title: "Financeiro Completo",
    desc: "Controle de receitas, comissões automáticas e relatórios financeiros detalhados.",
  },
  {
    icon: MessageSquare,
    title: "Notificações WhatsApp & E-mail",
    desc: "Lembretes automáticos via WhatsApp e e-mail para seus clientes, reduzindo faltas e cancelamentos.",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Relatórios",
    desc: "Painel com métricas do dia, faturamento, agendamentos e desempenho da equipe.",
  },
  {
    icon: Shield,
    title: "Multi-Profissionais",
    desc: "Cada profissional acessa sua própria agenda e comissões com login individual.",
  },
  {
    icon: Scissors,
    title: "Catálogo de Serviços",
    desc: "Cadastre serviços com preço, duração e categoria. Tudo organizado para seu cliente escolher.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 sm:py-20 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Tudo que seu salão precisa
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto font-sans">
            Funcionalidades pensadas para simplificar sua rotina e fazer seu negócio crescer.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/5"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm font-sans leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
