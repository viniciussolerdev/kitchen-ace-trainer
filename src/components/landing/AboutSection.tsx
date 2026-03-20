import aboutSalon from "@/assets/about-salon.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-purple-accent/15 via-primary/10 to-transparent rounded-3xl blur-2xl" />
            <img
              src={aboutSalon}
              alt="Equipe de profissionais de beleza"
              className="relative rounded-2xl shadow-xl w-full object-cover aspect-[16/10]"
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-6">
              Sobre o <span className="text-primary">UpSalon</span>
            </h2>
            <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
              <p>
                O UpSalon nasceu com um objetivo simples: ajudar salões de beleza a se organizarem, reduzirem faltas de clientes e terem mais controle sobre o próprio negócio.
              </p>
              <p>
                Sabemos que muitos salões ainda enfrentam dificuldades com agendas no papel, mensagens perdidas no WhatsApp e falta de controle financeiro. Isso gera confusão nos horários, clientes esquecendo atendimentos e perda de faturamento.
              </p>
              <p>
                Foi pensando nisso que criamos o UpSalon. Nossa plataforma oferece uma maneira simples e moderna de gerenciar o dia a dia do salão. Com agenda online, confirmação automática de atendimentos e controle de clientes e faturamento, o UpSalon ajuda profissionais da beleza a economizar tempo, reduzir faltas e focar no que realmente importa: atender bem seus clientes e fazer o negócio crescer.
              </p>
              <p>
                Nosso compromisso é desenvolver uma ferramenta fácil de usar, acessível e que realmente faça diferença na rotina de quem trabalha na área da beleza.
              </p>
              <p className="font-medium text-foreground">
                O UpSalon foi criado para simplificar a gestão do salão e transformar organização em mais resultados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
