import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Juliana Mendes",
    salon: "Studio Juliana Hair",
    text: "Minha agenda vivia uma bagunça. Com o UpSalon consegui organizar tudo e minhas clientes adoram agendar online!",
    stars: 5,
  },
  {
    name: "Roberto Alves",
    salon: "Barbearia RAStyle",
    text: "O controle financeiro me mostrou quanto eu realmente faturava. Aumentei meu lucro em 30% depois de entender meus números.",
    stars: 5,
  },
  {
    name: "Camila Torres",
    salon: "Espaço Beleza Pura",
    text: "Ter cada profissional com seu próprio acesso facilitou demais a gestão. Recomendo para qualquer salão!",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Quem usa, recomenda
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-sans">
            Veja o que nossos clientes dizem sobre o UpSalon.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground font-sans mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-foreground text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs font-sans">{t.salon}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
