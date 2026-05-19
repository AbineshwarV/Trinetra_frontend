"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_ART_URL = "/login_art.png";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setFieldErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name as keyof LoginErrors];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setFieldErrors({});

    const nextErrors: LoginErrors = {};
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = "Invalid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = (await response.json()) as {
        message?: string;
        token?: string;
        detail?: { message?: string };
      };
      const responseMessage = result.message ?? result.detail?.message;

      if (!response.ok) {
        setError(responseMessage || "Login failed. Please try again.");
        return;
      }

      if (result.token) {
        setAccessToken(result.token);
      }
      setMessage(responseMessage || "Login successful.");
      router.push("/analyzer");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page relative isolate min-h-screen overflow-hidden bg-[#030b1e] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,210,48,0.15),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(29,107,255,0.18),transparent_35%),linear-gradient(180deg,#020817_0%,#030b1e_100%)]" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#ffd230]/10 blur-3xl" />
      <div className="absolute right-0 top-40 h-112 w-md rounded-full bg-[#1d6bff]/10 blur-3xl" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden bg-transparent px-6 py-10 sm:px-10 lg:block lg:pr-2">
          <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.65)]">
            <Image
              src={AUTH_ART_URL}
              alt="Trinetra auth artwork"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 0px"
            />
          </div>
        </section>

        <section className="flex items-center justify-center bg-transparent px-6 py-10 sm:px-10 lg:pl-2">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <span className="bg-linear-to-r from-fuchsia-400 via-indigo-300 to-sky-300 bg-clip-text text-lg font-semibold tracking-wide text-transparent">
                TRINETRA
              </span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.75)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200/90 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back
            </button>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back 🖖</h1>
              <p className="mt-1 text-sm text-slate-300/80">Log in to continue.</p>
            </div>

            <div className="mb-6 rounded-full border border-white/10 bg-white/5 p-1">
              <div className="grid grid-cols-2">
                <Link
                  href="/login"
                  aria-current="page"
                  className="rounded-full bg-linear-to-r from-[#ffd230] to-[#ffb703] px-4 py-2 text-center text-sm font-semibold text-[#071127] shadow-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-200/80 transition hover:text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
              {message ? (
                <div className="flex items-center gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{message}</span>
                </div>
              ) : null}

              {error ? (
                <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>
              ) : null}

              <div>
                <label htmlFor="email" className="text-xs font-medium text-slate-200">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={fieldErrors.email ? fieldErrors.email : "Enter your email"}
                    required
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`w-full rounded-full border bg-slate-900/70 py-2.5 pr-10 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                        : "border-white/10 focus:border-indigo-400/60 focus:ring-indigo-400/20"
                    }`}
                  />
                  {fieldErrors.email ? (
                    <span
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/60 p-1 text-red-300"
                      title="Required"
                      aria-hidden="true"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-medium text-slate-200">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={fieldErrors.password ? fieldErrors.password : "Enter your password"}
                    required
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`w-full rounded-full border bg-slate-900/70 py-2.5 pr-14 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                        : "border-white/10 focus:border-indigo-400/60 focus:ring-indigo-400/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                  {fieldErrors.password ? (
                    <span
                      className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/60 p-1 text-red-300"
                      title="Required"
                      aria-hidden="true"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-end text-xs">
                <Link href="#" className="text-indigo-300 transition hover:text-indigo-200">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-linear-to-r from-[#ffd230] to-[#ffb703] px-4 py-3 text-sm font-semibold text-[#071127] shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
