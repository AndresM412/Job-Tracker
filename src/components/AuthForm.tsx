import React, { useState } from "react";
import { loginApi, registerApi } from "../services/authApi";

interface AuthFormProps {
  onSuccess: (token: string, email: string) => void;
  initialError?: string | null;
  initialMode?: "login" | "register";
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSuccess,
  initialError,
  initialMode = "login",
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await registerApi(email, password);
      }
      // Obtener el token de acceso mediante login
      const token = await loginApi(email, password);
      onSuccess(token, email);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 shadow-2xl relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-text mb-2">
            Job Tracker
          </h1>
          <p className="text-sm text-muted">
            {isRegister
              ? "Create an account to organize your applications"
              : "Sign in to manage your applications"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rejected/10 border border-rejected/30 rounded-md text-rejected text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-muted mb-1">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-muted mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="auth-confirm-password" className="block text-xs font-medium text-muted mb-1">
                Confirm Password
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field w-full"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="auth-submit-btn"
            className="btn-submit w-full mt-6 py-2.5"
          >
            {loading
              ? "Processing..."
              : isRegister
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-interview hover:underline cursor-pointer"
          >
            {isRegister
              ? "Already have an account? Sign in here"
              : "Don't have an account? Sign up here"}
          </button>
        </div>
      </div>
    </div>
  );
};
