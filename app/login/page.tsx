"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message || "Login failed. Please try again.");
        return;
      }

      setMessage(result.message || "Login successful.");
      router.push("/analyzer");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page min-h-screen bg-[#050814] text-slate-100">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-5">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#08101f]/90 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="mb-5 flex flex-col items-center">
            <Link href="/" className="mb-3 inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/15 text-3xl leading-none text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.22)]">
                👁
              </span>
              <span className="text-lg font-semibold tracking-wide">TRINETRA</span>
            </Link>
            <h1 className="text-xl font-bold">Log in to your account</h1>
            <p className="mt-1 text-sm text-white/70">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-cyan-300 transition hover:text-cyan-200">
                Sign Up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off" noValidate>
            {message ? (
              <div className="flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>{message}</span>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>
            ) : null}

            <div>
              <label htmlFor="email" className="text-xs text-white/80">
                Email ID (Username)
              </label>
              <div className="relative mt-1">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300/85"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email ID"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/4 py-2 pr-3 pl-8 text-sm text-white placeholder-white/50 transition focus:border-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-300"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs text-white/80">
                Password
              </label>
              <div className="relative mt-1">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300/85"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/4 py-2 pr-10 pl-8 text-sm text-white placeholder-white/50 transition focus:border-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 transition hover:text-cyan-200 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Eye aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right text-xs">
              <Link href="#" className="text-cyan-300 transition hover:text-cyan-200">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-linear-to-r from-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
