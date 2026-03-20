

# SmartSalon – Sistema SaaS para Salões de Beleza

## Visão Geral
Sistema completo de gestão para salões de beleza com agenda, autoagendamento público, lembretes WhatsApp, controle financeiro e comissões. Design elegante com paleta **bege, branco e toques dourados**.

---

## 🎨 Design & Layout
- **Paleta**: Branco, bege claro, toques dourados, tipografia escura
- **Sidebar fixa** com navegação principal e ícones minimalistas
- **Modo claro e escuro**
- Botões arredondados, sombras suaves, espaçamento generoso
- Experiência intuitiva para qualquer nível de usuário

---

## 🔐 Autenticação & Multi-tenant
- Login, cadastro e recuperação de senha via Supabase Auth
- Cada usuário pertence a um **Salon** (tenant)
- Controle de permissões: **Admin** e **Funcionário** (tabela de roles separada)
- Dados completamente isolados por salão via RLS

---

## 🗄️ Banco de Dados (Supabase Externo)
Tabelas normalizadas e relacionais:
- **salons** – dados do salão, slug para URL pública
- **profiles** – dados do usuário logado, ligado ao salon
- **user_roles** – roles (admin/employee) separadas do perfil
- **clients** – clientes do salão
- **professionals** – profissionais com % de comissão
- **services** – serviços com duração e preço
- **appointments** – agendamentos com status e booking_source
- **transactions** – pagamentos registrados
- **commissions** – comissões calculadas por atendimento
- **whatsapp_notifications** – registro de lembretes enviados
- **public_booking_settings** – configurações do autoagendamento

RLS em todas as tabelas filtrando por salon_id.

---

## 📊 Dashboard Principal
- Atendimentos de hoje
- Faturamento do dia
- Próximos horários
- Serviço mais vendido
- Profissional destaque
- Clientes inativos há 60+ dias
- Cards visuais com ícones e gráficos (Recharts)

---

## 📅 Funcionalidade 1 – Agenda Interna
- Calendário com visualização **diária** e **semanal** (estilo Google Calendar)
- Bloqueio automático de horários ocupados
- Criação rápida de agendamento via clique no horário
- Modal completo: cliente, serviço, profissional, valor, pagamento, status
- Edição e cancelamento de agendamentos
- Status: Agendado, Confirmado, Concluído, Cancelado, Não compareceu

---

## 🌐 Funcionalidade 2 – Autoagendamento Público
- Página pública acessível via `/salao/nome-do-salao`
- Fluxo step-by-step para o cliente:
  1. Escolher serviço
  2. Escolher profissional (ou "qualquer disponível")
  3. Escolher data e ver horários disponíveis em tempo real
  4. Informar nome e WhatsApp
  5. Confirmar agendamento
- Validação de conflitos e duração do serviço
- Appointment criado com `booking_source = "online"`
- Mensagem de sucesso ao finalizar

---

## 📲 Funcionalidade 3 – Lembretes WhatsApp
- Lista de lembretes pendentes (24h antes do atendimento)
- Botão para enviar via **link wa.me** (abre WhatsApp com mensagem pré-formatada)
- Mensagem: "Olá, [Nome]! Você tem horário amanhã às [Hora] no [Salão]..."
- Registro na tabela whatsapp_notifications (sent_at, status)
- Botão para marcar como "Confirmado" manualmente
- Estrutura preparada para integração futura com API oficial

---

## 💰 Funcionalidade 4 – Financeiro
- Dashboard financeiro: faturamento dia/semana/mês
- Ticket médio
- Receita por serviço (gráfico)
- Receita por profissional (gráfico)
- Tabela detalhada de transações com filtros
- Registro de pagamento ao concluir agendamento

---

## 👩‍🔬 Funcionalidade 5 – Profissionais & Comissões
- Cadastro de profissionais com % de comissão
- Lista de serviços realizados por profissional
- Total faturado e comissão calculada automaticamente
- Relatório de comissões por período

---

## 📋 Cadastros Complementares
- **Clientes**: nome, telefone, email, histórico de atendimentos
- **Serviços**: nome, duração, preço, categoria

---

## 🔮 Preparação para o Futuro
- Modelagem preparada para planos de assinatura (Stripe)
- Código modular e organizado para exportação
- Separação clara frontend/backend
- Estrutura escalável para app mobile e IA futura

