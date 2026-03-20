import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O UpSalon oferece período de teste gratuito?",
    answer:
      "Sim! Você pode testar todas as funcionalidades do UpSalon gratuitamente por 5 dias, sem precisar cadastrar cartão de crédito.",
  },
  {
    question: "Preciso instalar algum aplicativo?",
    answer:
      "Não. O UpSalon funciona diretamente no navegador do celular, tablet ou computador. Basta acessar e começar a usar.",
  },
  {
    question: "Quantos profissionais posso cadastrar?",
    answer:
      "Não há limite! Você pode adicionar quantos profissionais quiser, cada um com acesso individual à sua agenda e comissões.",
  },
  {
    question: "Meus clientes conseguem agendar sozinhos?",
    answer:
      "Sim. Você recebe um link exclusivo do seu salão que pode compartilhar com clientes. Eles escolhem o serviço, profissional, data e horário — tudo online, 24 horas por dia.",
  },
  {
    question: "Como funcionam as notificações automáticas?",
    answer:
      "O UpSalon envia lembretes automáticos via WhatsApp e e-mail para seus clientes antes do atendimento, reduzindo faltas e cancelamentos de última hora.",
  },
  {
    question: "Posso cancelar a assinatura a qualquer momento?",
    answer:
      "Sim, sem multas ou fidelidade. Você pode cancelar quando quiser diretamente pela plataforma.",
  },
  {
    question: "O UpSalon controla comissões automaticamente?",
    answer:
      "Sim! Ao concluir um atendimento, a comissão do profissional é calculada automaticamente com base na porcentagem configurada para cada um.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Utilizamos criptografia e infraestrutura de nível empresarial para garantir a segurança dos seus dados e dos seus clientes.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-sans">
            Tire suas dúvidas sobre o UpSalon.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
              <AccordionTrigger className="text-left text-sm sm:text-base text-foreground font-sans font-medium hover:no-underline hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-sans leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
