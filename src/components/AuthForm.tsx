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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-surface px-4 py-12 relative overflow-hidden">
      {/* Estilo local para micro-animaciones ultra-ligeras aceleradas por hardware */}
      <style>{`
        @keyframes authFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Glows ambientales sutiles con radial-gradient nativo (0 coste de CPU, sin filtros Gaussian Blur pesados) */}
      <div
        className="absolute w-[600px] h-[600px] pointer-events-none -top-24 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(129, 140, 248, 0.12) 0%, rgba(129, 140, 248, 0.04) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute w-[450px] h-[450px] pointer-events-none -bottom-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(78, 222, 163, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Tarjeta principal Command Center */}
      <div className="relative w-full max-w-[440px] bg-surface-container-low border border-outline-variant/30 rounded-2xl p-7 sm:p-9 shadow-2xl z-10">
        {/* Cabecera y emblema de marca */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center text-primary-container shadow-sm mb-4">
            <span className="material-symbols-outlined text-[26px]">
              work_history
            </span>
          </div>
          <h1 className="text-2xl font-bold font-sans text-on-surface tracking-tight mb-1.5">
            Job Tracker
          </h1>
          <p
            key={isRegister ? "register" : "login"}
            className="text-xs text-on-surface-variant font-sans"
            style={{ animation: "authFadeIn 180ms ease-out forwards" }}
          >
            {isRegister
              ? "Create an account to organize your applications"
              : "Sign in to manage your applications"}
          </p>
        </div>

        {/* Control de pestañas segmentadas con indicador elástico */}
        <div className="relative mt-6 p-1 bg-surface-container-lowest rounded-xl flex items-center border border-outline-variant/30">
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-surface-container-high rounded-lg shadow-sm border border-outline-variant/50 pointer-events-none transition-transform duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegister ? "translate-x-full" : "translate-x-0"
            }`}
          />
          <button
            type="button"
            data-testid="tab-login"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`relative z-10 flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer ${
              !isRegister
                ? "text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            data-testid="tab-register"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`relative z-10 flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer ${
              isRegister
                ? "text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 p-3 bg-rejected/10 border border-rejected/30 rounded-xl text-error text-xs text-center font-sans"
          >
            {error}
          </div>
        )}

        {/* Formulario de Autenticación */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div className="flex flex-col space-y-1.5">
            <label
              htmlFor="auth-email"
              className="text-xs font-medium text-on-surface-variant"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                alternate_email
              </span>
              <input
                id="auth-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-outline-variant/40 focus:border-primary-container focus:bg-surface-container transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-1.5">
            <label
              htmlFor="auth-password"
              className="text-xs font-medium text-on-surface-variant"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                lock
              </span>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-sm rounded-xl pl-10 pr-11 py-2.5 outline-none border border-outline-variant/40 focus:border-primary-container focus:bg-surface-container transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password (Expansión suave y elástica con grid) */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegister
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col space-y-1.5 pt-1">
                <label
                  htmlFor="auth-confirm-password"
                  className="text-xs font-medium text-on-surface-variant"
                >
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px] pointer-events-none">
                    verified_user
                  </span>
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required={isRegister}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-sm rounded-xl pl-10 pr-11 py-2.5 outline-none border border-outline-variant/40 focus:border-primary-container focus:bg-surface-container transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1 text-outline hover:text-on-surface transition-colors focus:outline-none cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={loading}
            data-testid="auth-submit-btn"
            className="w-full mt-4 py-3 px-4 rounded-xl bg-primary-container hover:brightness-110 text-on-primary-container font-semibold text-sm transition-all duration-200 shadow-md active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <span
              key={isRegister ? "create" : "login"}
              style={{ animation: "authFadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
            >
              {loading
                ? "Processing..."
                : isRegister
                  ? "Create Account"
                  : "Log In"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
