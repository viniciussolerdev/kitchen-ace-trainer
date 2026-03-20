import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface AppointmentWithDetails {
  id: string;
  start_time: string;
  end_time: string;
  confirmation_token: string;
  status: string;
  reminder_24h_sent: boolean;
  reminder_3h_sent: boolean;
  confirmed_at: string | null;
  clients: { name: string; email: string | null; phone: string | null };
  services: { name: string; price: number };
  professionals: { name: string };
  salons: { name: string; slug: string };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

function buildEmailHtml(apt: AppointmentWithDetails, baseUrl: string): string {
  const confirmUrl = `${baseUrl}/confirmar/${apt.confirmation_token}`;
  const cancelUrl = `${baseUrl}/cancelar/${apt.confirmation_token}`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#C8913B,#D4A24C);padding:32px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-family:Georgia,serif;">✂️ UpSalon</h1>
<p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Confirmação de Agendamento</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px;">
<p style="margin:0 0 20px;font-size:16px;color:#2D2A26;">Olá <strong>${apt.clients.name}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px;color:#5A5550;line-height:1.5;">Você tem um horário agendado. Por favor, confirme sua presença:</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;border-radius:12px;padding:20px;margin-bottom:24px;">
<tr><td style="padding:8px 20px;font-size:14px;color:#5A5550;">📅 <strong>Data:</strong> ${formatDate(apt.start_time)}</td></tr>
<tr><td style="padding:8px 20px;font-size:14px;color:#5A5550;">⏰ <strong>Horário:</strong> ${formatTime(apt.start_time)}</td></tr>
<tr><td style="padding:8px 20px;font-size:14px;color:#5A5550;">💇 <strong>Serviço:</strong> ${apt.services.name}</td></tr>
<tr><td style="padding:8px 20px;font-size:14px;color:#5A5550;">👤 <strong>Profissional:</strong> ${apt.professionals.name}</td></tr>
<tr><td style="padding:8px 20px;font-size:14px;color:#5A5550;">🏢 <strong>Salão:</strong> ${apt.salons.name}</td></tr>
</table>

<!-- Buttons -->
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:8px;">
<a href="${confirmUrl}" style="display:inline-block;background-color:#4CAF50;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">✅ Confirmar Presença</a>
</td>
</tr>
<tr>
<td align="center" style="padding:8px;">
<a href="${cancelUrl}" style="display:inline-block;background-color:#E53935;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">❌ Cancelar Agendamento</a>
</td>
</tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 32px;text-align:center;border-top:1px solid #EDE8E2;">
<p style="margin:0;font-size:12px;color:#9A9590;">Este email foi enviado automaticamente pelo UpSalon.<br>Caso não tenha feito este agendamento, por favor ignore.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UpSalon <agendamento@upsalon.com.br>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const now = new Date();
  const results = { reminders_24h: 0, reminders_3h: 0, errors: 0 };

  // Base URL for confirmation links
  const baseUrl = Deno.env.get("APP_BASE_URL") || "https://id-preview--135a6226-db42-4eb1-8be7-5dc6eb4f1148.lovable.app";

  // --- 24h Reminders ---
  // Send to any appointment within the next 24h that hasn't been reminded yet
  const to24h = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000);   // +24h10min

  const { data: apts24h } = await supabase
    .from("appointments")
    .select("id, start_time, end_time, confirmation_token, status, reminder_24h_sent, reminder_3h_sent, confirmed_at, clients(name, email, phone), services(name, price), professionals(name), salons:salon_id(name, slug)")
    .eq("status", "scheduled")
    .eq("reminder_24h_sent", false)
    .gte("start_time", now.toISOString())
    .lte("start_time", to24h.toISOString());

  for (const apt of (apts24h || []) as unknown as AppointmentWithDetails[]) {
    const email = apt.clients?.email;
    if (!email) continue;

    const sent = await sendEmail(
      email,
      `📅 Lembrete: Seu horário amanhã no ${apt.salons?.name || "UpSalon"}`,
      buildEmailHtml(apt, baseUrl)
    );

    if (sent) {
      await supabase.from("appointments").update({ reminder_24h_sent: true }).eq("id", apt.id);
      results.reminders_24h++;
    } else {
      results.errors++;
    }
  }

  // --- 3h Reminders ---
  // Send to any appointment within the next 3h that hasn't been reminded (3h)
  const to3h = new Date(now.getTime() + 3 * 60 * 60 * 1000 + 10 * 60 * 1000);   // +3h10min

  const { data: apts3h } = await supabase
    .from("appointments")
    .select("id, start_time, end_time, confirmation_token, status, reminder_24h_sent, reminder_3h_sent, confirmed_at, clients(name, email, phone), services(name, price), professionals(name), salons:salon_id(name, slug)")
    .eq("status", "scheduled")
    .eq("reminder_3h_sent", false)
    .is("confirmed_at", null)
    .gte("start_time", now.toISOString())
    .lte("start_time", to3h.toISOString());

  for (const apt of (apts3h || []) as unknown as AppointmentWithDetails[]) {
    const email = apt.clients?.email;
    if (!email) continue;

    const sent = await sendEmail(
      email,
      `⏰ Lembrete: Seu horário é daqui a 3 horas - ${apt.salons?.name || "UpSalon"}`,
      buildEmailHtml(apt, baseUrl)
    );

    if (sent) {
      await supabase.from("appointments").update({ reminder_3h_sent: true }).eq("id", apt.id);
      results.reminders_3h++;
    } else {
      results.errors++;
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
