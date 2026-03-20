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

  const now = new Date().toISOString();

  // Find appointments that have ended and are still scheduled/confirmed
  const { data: pastAppointments, error: fetchErr } = await supabase
    .from("appointments")
    .select("id, salon_id, service_id, professional_id, end_time, services(price, name), professionals(commission_rate)")
    .lte("end_time", now)
    .in("status", ["scheduled", "confirmed"]);

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let completed = 0;

  for (const apt of pastAppointments || []) {
    // Update status to completed
    await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", apt.id);

    const price = (apt as any).services?.price || 0;

    // Create transaction
    await supabase.from("transactions").insert({
      salon_id: apt.salon_id,
      appointment_id: apt.id,
      amount: price,
      description: `Serviço: ${(apt as any).services?.name || "N/A"}`,
      payment_method: "cash",
      transaction_date: apt.end_time,
    });

    // Create commission
    const commissionRate = (apt as any).professionals?.commission_rate || 0;
    if (commissionRate > 0) {
      await supabase.from("commissions").insert({
        salon_id: apt.salon_id,
        appointment_id: apt.id,
        professional_id: apt.professional_id,
        rate: commissionRate,
        amount: price * (commissionRate / 100),
      });
    }

    completed++;
  }

  return new Response(
    JSON.stringify({ message: `Completed ${completed} appointments` }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
