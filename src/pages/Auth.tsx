import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { translateAuthError } from "@/lib/auth-errors";
import logoUpsalon from "@/assets/logo-upsalon.png";
import textUpsalon from "@/assets/text-upsalon.png";

const Auth = () => {
  const { signIn, signUp, session, subscriptionLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [salonName, setSalonName] = useState("");

  // If user is already logged in, redirect to dashboard
  // (ProtectedRoute will handle subscription check and show SubscriptionGate if needed)
  useEffect(() => {
    if (session && !subscriptionLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, subscriptionLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      toast.error(translateAuthError(error.message) || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast.error("Digite seu e-mail no campo acima para redefinir a senha.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      toast.error(translateAuthError(error.message) || "Erro ao enviar e-mail de redefinição.");
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = useMemo(() => {
    return signupPassword.length >= 8 &&
      /[A-Z]/.test(signupPassword) &&
      /[a-z]/.test(signupPassword) &&
      /[0-9]/.test(signupPassword) &&
      /[^A-Za-z0-9]/.test(signupPassword);
  }, [signupPassword]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("A senha não atende aos requisitos mínimos de segurança.");
      return;
    }
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName, salonName);
      toast.success("Conta criada! Redirecionando para pagamento...");
      // Wait for session to propagate, then redirect to Stripe checkout
      setTimeout(async () => {
        try {
          const { data, error } = await supabase.functions.invoke("create-checkout");
          if (error) throw error;
          if (data?.url) {
            window.location.href = data.url;
          }
        } catch (err) {
          toast.error("Erro ao redirecionar para pagamento. Tente pelo painel.");
          navigate("/dashboard", { replace: true });
        }
      }, 1500);
    } catch (error: any) {
      toast.error(translateAuthError(error.message) || "Erro ao criar conta");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logoUpsalon} alt="UpSalon" className="h-16 w-16 object-contain mb-4" />
          <img src={textUpsalon} alt="UpSalon" className="h-6 object-contain" />
          <p className="text-muted-foreground mt-2">Gestão inteligente para seu salão</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <Tabs defaultValue="login">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={handleForgotPassword}
                        disabled={loading}
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                  </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Seu nome</Label>
                    <Input
                      id="signup-name"
                      placeholder="Maria Silva"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salon-name">Nome do Salão</Label>
                    <Input
                      id="salon-name"
                      placeholder="Salão Beleza Pura"
                      value={salonName}
                      onChange={(e) => setSalonName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    {signupPassword.length > 0 && (
                      <ul className="text-xs space-y-1 mt-1">
                        <li className={signupPassword.length >= 8 ? "text-green-600" : "text-muted-foreground"}>
                          {signupPassword.length >= 8 ? "✅" : "○"} Mínimo 8 caracteres
                        </li>
                        <li className={/[A-Z]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}>
                          {/[A-Z]/.test(signupPassword) ? "✅" : "○"} Uma letra maiúscula
                        </li>
                        <li className={/[a-z]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}>
                          {/[a-z]/.test(signupPassword) ? "✅" : "○"} Uma letra minúscula
                        </li>
                        <li className={/[0-9]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}>
                          {/[0-9]/.test(signupPassword) ? "✅" : "○"} Um número
                        </li>
                        <li className={/[^A-Za-z0-9]/.test(signupPassword) ? "text-green-600" : "text-muted-foreground"}>
                          {/[^A-Za-z0-9]/.test(signupPassword) ? "✅" : "○"} Um caractere especial (!@#$...)
                        </li>
                      </ul>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
