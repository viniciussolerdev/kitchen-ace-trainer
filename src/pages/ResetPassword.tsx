import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/auth-errors";
import logoUpsalon from "@/assets/logo-upsalon.png";
import textUpsalon from "@/assets/text-upsalon.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const isPasswordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("A senha não atende aos requisitos mínimos de segurança.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(translateAuthError(error.message) || "Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-lg">
          <CardContent className="p-8 text-center">
            <img src={logoUpsalon} alt="UpSalon" className="h-16 w-16 object-contain mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Verificando link...</h2>
            <p className="text-muted-foreground mb-4">
              Se você chegou aqui por um link de redefinição de senha, aguarde um momento.
            </p>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logoUpsalon} alt="UpSalon" className="h-16 w-16 object-contain mb-4" />
          <img src={textUpsalon} alt="UpSalon" className="h-6 object-contain" />
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>Digite sua nova senha abaixo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                {password.length > 0 && (
                  <ul className="text-xs space-y-1 mt-1">
                    <li className={password.length >= 8 ? "text-green-600" : "text-muted-foreground"}>
                      {password.length >= 8 ? "✅" : "○"} Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                      {/[A-Z]/.test(password) ? "✅" : "○"} Uma letra maiúscula
                    </li>
                    <li className={/[a-z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                      {/[a-z]/.test(password) ? "✅" : "○"} Uma letra minúscula
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                      {/[0-9]/.test(password) ? "✅" : "○"} Um número
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                      {/[^A-Za-z0-9]/.test(password) ? "✅" : "○"} Um caractere especial
                    </li>
                  </ul>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
