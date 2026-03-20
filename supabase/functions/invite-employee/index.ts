import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify the calling user is an admin
    const authHeader = req.headers.get("Authorization")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Apenas admins podem convidar" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, fullName, professionalId, salonId } = await req.json();

    if (!email || !password || !fullName || !professionalId || !salonId) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to create the auth user, or find existing one
    let newUserId: string;

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      // If user already exists, look them up
      if (createError.message.includes("already been registered")) {
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
          return new Response(JSON.stringify({ error: listError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const existingUser = listData.users.find((u: any) => u.email === email);
        if (!existingUser) {
          return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        newUserId = existingUser.id;

        // Update their password
        await supabaseAdmin.auth.admin.updateUserById(newUserId, { password });
      } else {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      newUserId = newUser.user.id;
    }

    // The handle_new_user trigger already created a profile with a NEW salon.
    // Get the auto-created profile and its orphan salon_id before updating.
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, salon_id")
      .eq("user_id", newUserId)
      .single();

    const orphanSalonId = existingProfile?.salon_id;

    // Update profile to point to the correct salon
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ salon_id: salonId, full_name: fullName })
      .eq("user_id", newUserId)
      .select("id")
      .single();

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean up the orphan salon and its related data created by the trigger
    if (orphanSalonId && orphanSalonId !== salonId) {
      await supabaseAdmin.from("public_booking_settings").delete().eq("salon_id", orphanSalonId);
      await supabaseAdmin.from("business_hours").delete().eq("salon_id", orphanSalonId);
      await supabaseAdmin.from("salons").delete().eq("id", orphanSalonId);
    }

    // The trigger created an 'admin' role — update it to 'employee'
    await supabaseAdmin
      .from("user_roles")
      .update({ role: "employee" })
      .eq("user_id", newUserId);

    // Link professional to this profile
    await supabaseAdmin
      .from("professionals")
      .update({ profile_id: profileData.id, email })
      .eq("id", professionalId);

    return new Response(
      JSON.stringify({ success: true, userId: newUserId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
