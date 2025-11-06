import { useState } from "react";
import Header from "@/components/Header";
import RecipeCard from "@/components/RecipeCard";
import BadgeCard from "@/components/BadgeCard";
import GuidedModeCard from "@/components/GuidedModeCard";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-cooking.jpg";
import threeIngredientsImage from "@/assets/three-ingredients.jpg";
import badgeBronze from "@/assets/badge-bronze.png";
import badgeSilver from "@/assets/badge-silver.png";

const Index = () => {
  const [showGuidedMode, setShowGuidedMode] = useState(false);

  const recipes = [
    {
      title: "Pasta ao Tomate",
      ingredients: ["Massa", "Tomate", "Manjericão"],
      time: "15 min",
      difficulty: "Fácil"
    },
    {
      title: "Omelete Cremosa",
      ingredients: ["Ovos", "Queijo", "Manteiga"],
      time: "8 min",
      difficulty: "Fácil"
    },
    {
      title: "Salada Caprese",
      ingredients: ["Tomate", "Mussarela", "Manjericão"],
      time: "5 min",
      difficulty: "Muito Fácil"
    },
    {
      title: "Arroz de Alho",
      ingredients: ["Arroz", "Alho", "Azeite"],
      time: "20 min",
      difficulty: "Fácil"
    },
    {
      title: "Panqueca Simples",
      ingredients: ["Farinha", "Leite", "Ovo"],
      time: "12 min",
      difficulty: "Médio"
    },
    {
      title: "Bruschetta Italiana",
      ingredients: ["Pão", "Tomate", "Alho"],
      time: "10 min",
      difficulty: "Fácil"
    },
  ];

  const badges = [
    {
      title: "Iniciante",
      description: "Complete sua primeira receita",
      icon: "ri-star-line",
      unlocked: true,
      image: badgeBronze
    },
    {
      title: "Cozinheiro",
      description: "Complete 5 receitas",
      icon: "ri-fire-line",
      unlocked: true,
      image: badgeSilver
    },
    {
      title: "Chef",
      description: "Complete 10 receitas",
      icon: "ri-medal-line",
      unlocked: false
    },
    {
      title: "Mestre",
      description: "Complete 25 receitas",
      icon: "ri-trophy-line",
      unlocked: false
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-accent/10 rounded-full">
                  <i className="ri-sparkling-line text-accent mr-2"></i>
                  <span className="text-accent font-semibold text-sm font-nunito">Plano Gratuito Disponível</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  De <span className="text-accent">Ansioso</span> a <span className="text-primary font-pacifico">Confiante</span> na Cozinha
                </h1>
                
                <p className="text-xl text-muted-foreground font-nunito leading-relaxed">
                  Transforme sua experiência culinária com <strong className="text-foreground">receitas de 3 ingredientes</strong>, 
                  modo guiado passo a passo e timer integrado. Sem desperdício, sem ansiedade.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="lg" onClick={() => setShowGuidedMode(true)}>
                    <i className="ri-play-circle-line mr-2"></i>
                    Experimentar Modo Guiado
                  </Button>
                  <Button variant="outline" size="lg">
                    <i className="ri-book-open-line mr-2"></i>
                    Ver Receitas
                  </Button>
                </div>
                
                <div className="flex items-center space-x-8 pt-4">
                  <div>
                    <p className="text-3xl font-bold text-foreground font-poppins">200+</p>
                    <p className="text-muted-foreground font-nunito">Receitas Simples</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground font-poppins">15min</p>
                    <p className="text-muted-foreground font-nunito">Tempo Médio</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground font-poppins">3</p>
                    <p className="text-muted-foreground font-nunito">Ingredientes</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={heroImage} 
                    alt="Pessoa cozinhando com confiança" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-accent to-accent-light rounded-3xl opacity-20 blur-3xl"></div>
                <div className="absolute -top-6 -left-6 w-48 h-48 bg-gradient-to-br from-primary to-primary-glow rounded-3xl opacity-20 blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Guided Mode Section */}
        {showGuidedMode && (
          <section className="py-16 bg-secondary/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <GuidedModeCard />
            </div>
          </section>
        )}

        {/* How It Works */}
        <section id="como-funciona" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 font-poppins">
                Como Funciona?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-nunito">
                Três passos simples para você cozinhar com confiança
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-lg">
                  <i className="ri-file-list-3-line text-primary-foreground text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-foreground font-poppins">Escolha uma Receita</h3>
                <p className="text-muted-foreground font-nunito">
                  Navegue por receitas simples de 3 ingredientes
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center shadow-lg">
                  <i className="ri-guide-line text-accent-foreground text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-foreground font-poppins">Ative o Modo Guiado</h3>
                <p className="text-muted-foreground font-nunito">
                  Siga passo a passo com timer integrado
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center shadow-lg">
                  <i className="ri-restaurant-line text-success-foreground text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-foreground font-poppins">Cozinhe com Confiança</h3>
                <p className="text-muted-foreground font-nunito">
                  Ganhe badges e evolua suas habilidades
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recipes Section */}
        <section id="receitas" className="py-20 bg-gradient-to-b from-background to-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-4 font-poppins">
                  Receitas de 3 Ingredientes
                </h2>
                <p className="text-xl text-muted-foreground font-nunito">
                  Simples, rápidas e deliciosas
                </p>
              </div>
              
              <div className="relative">
                <img 
                  src={threeIngredientsImage} 
                  alt="3 ingredientes" 
                  className="w-32 h-32 rounded-2xl shadow-lg object-cover"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={index} {...recipe} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                <i className="ri-add-line mr-2"></i>
                Ver Todas as Receitas
              </Button>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section id="badges" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4 font-poppins">
                Níveis Culinários
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-nunito">
                Desbloqueie badges conforme você evolui na cozinha
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((badge, index) => (
                <BadgeCard key={index} {...badge} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-glow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-primary-foreground mb-6 font-poppins">
              Pronto para Cozinhar com Confiança?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 font-nunito">
              Comece gratuitamente agora e transforme sua experiência na cozinha
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0">
                <i className="ri-rocket-line mr-2"></i>
                Começar Grátis Agora
              </Button>
              <Button variant="ghost" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10">
                <i className="ri-question-line mr-2"></i>
                Saber Mais
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-primary-foreground/10 rounded-2xl flex items-center justify-center">
                  <i className="ri-restaurant-2-line text-primary-foreground text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold font-pacifico">Cozinheiro de Bolso</h3>
              </div>
              <p className="text-primary-foreground/80 leading-relaxed mb-6 font-nunito">
                Transformando o aprendizado culinário com receitas simples e modo guiado.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <i className="ri-facebook-fill"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <i className="ri-instagram-line"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <i className="ri-youtube-line"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 font-poppins">Recursos</h4>
              <ul className="space-y-2 font-nunito">
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Receitas</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Modo Guiado</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Glossário</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Badges</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 font-poppins">Suporte</h4>
              <ul className="space-y-2 font-nunito">
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Planos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/60 text-sm font-nunito">
            © 2024 Cozinheiro de Bolso. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
