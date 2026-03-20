/**
 * Traduz mensagens de erro do Supabase Auth para português brasileiro.
 */
const errorMap: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos",
  "Email not confirmed": "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
  "User already registered": "Já existe uma conta com este e-mail",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
  "Signup requires a valid password": "É necessário informar uma senha válida",
  "Unable to validate email address: invalid format": "Formato de e-mail inválido",
  "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "For security purposes, you can only request this after": "Por segurança, aguarde antes de tentar novamente.",
  "New password should be different from the old password": "A nova senha deve ser diferente da anterior",
  "User not found": "Usuário não encontrado",
  "Token has expired or is invalid": "Link expirado ou inválido. Solicite um novo.",
  "Auth session missing": "Sessão expirada. Faça login novamente.",
  "email address": "endereço de e-mail",
  "Signup failed": "Falha ao criar conta",
};

export function translateAuthError(message: string): string {
  // Direct match
  if (errorMap[message]) return errorMap[message];

  // Partial match
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Fallback — return original if no translation found
  return message;
}
