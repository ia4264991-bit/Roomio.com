import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthUser";

type Mode = "login" | "signup" | "reset";

const Login = () => {
  const { user, isAuthLoading, signInWithPassword, signUpWithPassword, sendPasswordReset, completePasswordReset } = useAuthUser();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  if (!isAuthLoading && user) {
    return <Navigate to="/" replace />;
  }

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    const { error } = await signInWithPassword(email, password);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  };

  const onSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");

    setBusy(true);
    const { error } = await signUpWithPassword(email, password, displayName);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created and signed in.");
  };

  const onRequestResetOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await sendPasswordReset(email);
    setBusy(false);
    if (error) return toast.error(error.message);
    setOtpRequested(true);
    toast.success("OTP sent. Check your email.");
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim() || !password) return;
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords do not match.");

    setBusy(true);
    const { error } = await completePasswordReset({ email, otp, newPassword: password });
    setBusy(false);
    if (error) return toast.error(error.message);

    toast.success("Password reset successful. You can now log in.");
    setMode("login");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setOtpRequested(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <Link to="/" className="text-sm font-heading font-semibold text-primary hover:underline">
          ← Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card/80 p-6 shadow-card">
          <div className="text-center space-y-1">
            <h1 className="font-heading text-2xl font-bold">Roomio</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" && "Log in with your account credentials."}
              {mode === "signup" && "Create an account in a few seconds."}
              {mode === "reset" && "Reset your password with the OTP sent to your email."}
            </p>
            <p className="text-xs text-muted-foreground">Admin access is automatic when you sign in with the configured admin email.</p>
          </div>

          {mode !== "reset" && (
            <div className="flex rounded-xl bg-secondary p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  mode === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  mode === "signup" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Sign up
              </button>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={onLogin} className="space-y-4">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
              />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
              />
              <button type="submit" disabled={busy} className="w-full rounded-xl gradient-primary text-primary-foreground font-semibold py-3 text-sm">
                {busy ? "Please wait..." : "Log in"}
              </button>
              <button type="button" onClick={() => setMode("reset")} className="w-full text-center text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={onSignup} className="space-y-4">
              <input
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
              />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
              />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
              />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
              />
              <button type="submit" disabled={busy} className="w-full rounded-xl gradient-primary text-primary-foreground font-semibold py-3 text-sm">
                {busy ? "Please wait..." : "Create account"}
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={otpRequested ? onReset : onRequestResetOtp} className="space-y-4">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
              />

              {otpRequested && (
                <>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
                  />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
                  />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"
                  />
                </>
              )}

              <button type="submit" disabled={busy} className="w-full rounded-xl gradient-primary text-primary-foreground font-semibold py-3 text-sm">
                {busy ? "Please wait..." : otpRequested ? "Reset password" : "Send OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setOtpRequested(false);
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-primary"
              >
                Back to log in
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
