import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { token, action } = await req.json();

    if (!token || !action || !["confirm", "cancel"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Token e ação são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find appointment by token
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, status, start_time, clients(name), services(name), professionals(name), salons:salon_id(name)")
      .eq("confirmation_token", token)
      .single();

    if (fetchError || !appointment) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou agendamento não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already processed
    if (appointment.status === "confirmed" && action === "confirm") {
      return new Response(
        JSON.stringify({ success: true, message: "Presença já confirmada anteriormente", appointment }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (appointment.status === "cancelled" && action === "cancel") {
      return new Response(
        JSON.stringify({ success: true, message: "Agendamento já cancelado anteriormente", appointment }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow actions on scheduled appointments
    if (appointment.status !== "scheduled" && appointment.status !== "confirmed") {
      return new Response(
        JSON.stringify({
          error: `Não é possível ${action === "confirm" ? "confirmar" : "cancelar"} um agendamento com status "${appointment.status}"`,
          appointment,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "confirm") {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", appointment.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Presença confirmada com sucesso!", appointment }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "cancel") {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", appointment.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Agendamento cancelado com sucesso.", appointment }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
