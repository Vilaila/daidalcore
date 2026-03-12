import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";

type AuthStep = "login" | "2fa-setup" | "2fa-verify" | "forgot-password";

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [totpQr, setTotpQr] = useState("");
  const [factorId, setFactorId] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [challengeId, setChallengeId] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Error al iniciar sesión", { description: error.message });
      setLoading(false);
      return;
    }

    // Check if MFA is enrolled
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.[0];

    if (totp) {
      // User has TOTP set up — challenge it
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (challengeErr) {
        toast.error("Error MFA", { description: challengeErr.message });
        setLoading(false);
        return;
      }
      setFactorId(totp.id);
      setChallengeId(challenge.id);
      setStep("2fa-verify");
    } else {
      // No MFA — prompt setup
      const { data: enroll, error: enrollErr } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "DaidalCore" });
      if (enrollErr) {
        toast.error("Error configurando 2FA", { description: enrollErr.message });
        setLoading(false);
        return;
      }
      setTotpUri(enroll.totp.uri);
      setTotpQr(enroll.totp.qr_code);
      setFactorId(enroll.id);
      setStep("2fa-setup");
    }
    setLoading(false);
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    // Challenge the newly enrolled factor
    const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) {
      toast.error("Error", { description: challengeErr.message });
      setLoading(false);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: totpCode,
    });

    if (verifyErr) {
      toast.error("Código incorrecto", { description: verifyErr.message });
      setLoading(false);
      return;
    }

    toast.success("2FA configurado correctamente");
    setLoading(false);
    // Session is now fully verified — AuthContext will pick it up
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: totpCode,
    });

    if (error) {
      toast.error("Código incorrecto", { description: error.message });
      setLoading(false);
      return;
    }

    toast.success("Sesión verificada");
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("Error", { description: error.message });
    } else {
      toast.success("Correo enviado", { description: "Revisa tu bandeja de entrada para restablecer la contraseña." });
      setStep("login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">DaidalCore</h1>
          <p className="text-sm text-muted-foreground mt-1">Acceso al ERP de Daidalonic UPV</p>
        </div>

        <div className="kpi-card !p-6 space-y-5">
          {/* ─── LOGIN ─── */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    className="pl-10"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("forgot-password")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {/* ─── 2FA SETUP ─── */}
          {step === "2fa-setup" && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Shield className="w-8 h-8 mx-auto" style={{ color: "#70D7C1" }} />
                <h2 className="text-lg font-semibold text-foreground">Configurar Doble Factor</h2>
                <p className="text-sm text-muted-foreground">
                  Escanea el código QR con tu app de autenticación (Google Authenticator, Authy, etc.)
                </p>
              </div>
              {totpQr && (
                <div className="flex justify-center">
                  <img src={totpQr} alt="QR Code" className="w-48 h-48 rounded-lg border border-border" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Código de verificación</Label>
                <Input
                  placeholder="000000"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button onClick={handleSetup2FA} className="w-full" disabled={loading || totpCode.length !== 6}>
                {loading ? "Verificando..." : "Verificar y activar 2FA"}
              </Button>
            </div>
          )}

          {/* ─── 2FA VERIFY ─── */}
          {step === "2fa-verify" && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Shield className="w-8 h-8 mx-auto" style={{ color: "#F9B825" }} />
                <h2 className="text-lg font-semibold text-foreground">Verificación 2FA</h2>
                <p className="text-sm text-muted-foreground">
                  Introduce el código de tu app de autenticación
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="000000"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button onClick={handleVerify2FA} className="w-full" disabled={loading || totpCode.length !== 6}>
                {loading ? "Verificando..." : "Verificar"}
              </Button>
              <button
                type="button"
                onClick={() => { setStep("login"); setTotpCode(""); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* ─── FORGOT PASSWORD ─── */}
          {step === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center space-y-2">
                <Mail className="w-8 h-8 mx-auto text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Recuperar contraseña</h2>
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un correo para restablecer tu contraseña
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar correo de recuperación"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-6">
          Acceso restringido · Solo usuarios invitados
        </p>
      </motion.div>
    </div>
  );
}
