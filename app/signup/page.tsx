"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Building2, ChevronDown, Eye, EyeOff, Lock, Mail, MapPin, PhoneCall, ShieldCheck, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { COUNTRY_DIAL_CODES, formatGatewayPhoneNumber } from "../../lib/phone";
import { apiFetch } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;
const SUCCESS_MESSAGE_VISIBLE_MS = 15000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_ART_URL = "/signup_art.png";

interface FormData {
  email: string;
  name: string;
  company: string;
  address: string;
  countryCode: string;
  mobile: string;
  password: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  email?: string;
  name?: string;
  company?: string;
  address?: string;
  countryCode?: string;
  mobile?: string;
  password?: string;
  agreeToTerms?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [activeDialIndex, setActiveDialIndex] = useState(0);
  const codeDropdownRef = useRef<HTMLDivElement | null>(null);
  const codePopoverRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    company: "",
    address: "",
    countryCode: "+91",
    mobile: "",
    password: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    if (!serverMessage) return;
    const timeoutId = window.setTimeout(() => setServerMessage(null), SUCCESS_MESSAGE_VISIBLE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [serverMessage]);

  const validateForm = (values: FormData) => {
    const nextErrors: FormErrors = {};
    const email = values.email.trim().toLowerCase();
    const name = values.name.trim();
    const company = values.company.trim();
    const address = values.address.trim();
    const mobile = values.mobile.trim();
    const password = values.password;

    if (!name) {
      nextErrors.name = "Name is required.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = "Invalid email address.";
    }

    if (!company) {
      nextErrors.company = "Company is required.";
    }

    if (!address) {
      nextErrors.address = "Address is required.";
    }

    if (!values.countryCode) {
      nextErrors.countryCode = "Code is required.";
    }

    if (!mobile) {
      nextErrors.mobile = "Phone is required.";
    } else {
      const normalized = formatGatewayPhoneNumber(values.countryCode, mobile);
      if (normalized === null) nextErrors.mobile = "Invalid mobile number.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!values.agreeToTerms) {
      nextErrors.agreeToTerms = "Please accept the terms and conditions.";
    }

    return nextErrors;
  };

  const errorIcon = (fieldError: string | undefined) => {
    if (!fieldError) return null;
    const isRequired = /required/i.test(fieldError);
    return (
      <span
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/60 p-1 text-red-300"
        title={isRequired ? "Required" : "Invalid"}
        aria-hidden="true"
      >
        <AlertTriangle className="h-4 w-4" />
      </span>
    );
  };

  const dialCodeOptions = useMemo(() => COUNTRY_DIAL_CODES, []);

  const selectedDialCodeLabel = useMemo(() => {
    const match = COUNTRY_DIAL_CODES.find((option) => option.dialCode === formData.countryCode);
    if (!match) return formData.countryCode || "Select code";
    return match.dialCode;
  }, [formData.countryCode]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!isCodeOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (codeDropdownRef.current?.contains(target)) return;
      setIsCodeOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isCodeOpen]);

  useEffect(() => {
    if (!isCodeOpen) return;
    const id = window.setTimeout(() => codePopoverRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [isCodeOpen]);

  useEffect(() => {
    if (!isCodeOpen) return;
    const selectedIndex = dialCodeOptions.findIndex((option) => option.dialCode === formData.countryCode);
    setActiveDialIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [dialCodeOptions, formData.countryCode, isCodeOpen]);

  useEffect(() => {
    if (!isCodeOpen) return;
    const option = dialCodeOptions[activeDialIndex];
    if (!option) return;
    const id = `dial-opt-${option.iso2}-${option.dialCode.replace("+", "")}`;
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeDialIndex, dialCodeOptions, isCodeOpen]);

  const moveDialIndex = (delta: number) => {
    if (!dialCodeOptions.length) return;
    setActiveDialIndex((prev) => {
      const next = (prev + delta + dialCodeOptions.length) % dialCodeOptions.length;
      return next;
    });
  };

  const selectActiveDialCode = () => {
    const option = dialCodeOptions[activeDialIndex];
    if (!option) return;
    setFormData((prev) => ({ ...prev, countryCode: option.dialCode }));
    setFieldErrors((prev) => {
      if (!("countryCode" in prev)) return prev;
      const next = { ...prev };
      delete next.countryCode;
      return next;
    });
    setIsCodeOpen(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      let nextValue = value;
      if (name === "mobile") nextValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: nextValue }));
    }

    setFieldErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name as keyof FormErrors];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setServerMessage(null);
    setServerError(null);

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiFetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          name: formData.name,
          company: formData.company,
          address: formData.address,
          password: formData.password,
          countryCode: formData.countryCode,
          mobile: formData.mobile,
          agreeToTerms: formData.agreeToTerms,
        }),
      });

      const result = (await response.json()) as { message?: string; detail?: { message?: string } };
      const responseMessage = result.message ?? result.detail?.message;

      if (!response.ok) {
        setServerError(responseMessage || "Registration failed. Please try again.");
        return;
      }

      setServerMessage(responseMessage || "Registration successful.");
      setFormData({
        email: "",
        name: "",
        company: "",
        address: "",
        countryCode: "+91",
        mobile: "",
        password: "",
        agreeToTerms: false,
      });
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page relative isolate min-h-screen overflow-hidden bg-[#030b1e] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,210,48,0.15),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(29,107,255,0.18),transparent_35%),linear-gradient(180deg,#020817_0%,#030b1e_100%)]" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#ffd230]/10 blur-3xl" />
      <div className="absolute right-0 top-40 h-112 w-md rounded-full bg-[#1d6bff]/10 blur-3xl" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
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
          <div className="w-full max-w-xl">
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
              <span aria-hidden="true">←</span>
              Back
            </button>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <p className="mt-1 text-sm text-slate-300/80">Sign up to start analyzing.</p>
            </div>

            <div className="mb-6 rounded-full border border-white/10 bg-white/5 p-1">
              <div className="grid grid-cols-2">
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-center text-sm font-semibold text-slate-200/80 transition hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  aria-current="page"
                  className="rounded-full bg-linear-to-r from-[#ffd230] to-[#ffb703] px-4 py-2 text-center text-sm font-semibold text-[#071127] shadow-sm transition hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
              noValidate
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsCodeOpen(false);
              }}
            >
              {serverMessage ? (
                <div className="flex items-center gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{serverMessage}</span>
                </div>
              ) : null}

              {serverError ? (
                <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{serverError}</p>
              ) : null}

              <div>
                <label htmlFor="name" className="text-xs font-medium text-slate-200">
                  Name
                </label>
                <div className="relative mt-1">
                  <User
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="off"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={fieldErrors.name ? fieldErrors.name : "Full name"}
                    required
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={`w-full rounded-full border bg-slate-900/70 py-2.5 pr-10 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                      fieldErrors.name
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                        : "border-white/10 focus:border-indigo-400/60 focus:ring-indigo-400/20"
                    }`}
                  />
                  {errorIcon(fieldErrors.name)}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                    {errorIcon(fieldErrors.email)}
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
                      placeholder={fieldErrors.password ? fieldErrors.password : "Create a password"}
                      required
                      aria-invalid={Boolean(fieldErrors.password)}
                      className={`w-full rounded-full border bg-slate-900/70 py-2.5 pr-20 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
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
                      {showPassword ? (
                        <EyeOff aria-hidden="true" className="h-4 w-4" />
                      ) : (
                        <Eye aria-hidden="true" className="h-4 w-4" />
                      )}
                    </button>
                    {fieldErrors.password ? (
                      <span
                        className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-red-300"
                        title={fieldErrors.password}
                        aria-hidden="true"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="text-xs font-medium text-slate-200">
                  Phone
                </label>
                <div className="mt-1 grid grid-cols-[minmax(0,5.75rem)_minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)]">
                  <div className="relative" ref={codeDropdownRef}>
                    <button
                      id="countryCode"
                      type="button"
                      onClick={() => setIsCodeOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isCodeOpen}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setIsCodeOpen(true);
                          moveDialIndex(1);
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setIsCodeOpen(true);
                          moveDialIndex(-1);
                        } else if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsCodeOpen((prev) => !prev);
                        } else if (e.key === "Escape") {
                          setIsCodeOpen(false);
                        }
                      }}
                      className={`flex h-11 w-full items-center justify-between gap-2 rounded-full border bg-slate-900/70 px-3 text-left text-sm font-semibold text-slate-100 shadow-sm transition focus:outline-none focus:ring-2 ${
                        fieldErrors.countryCode
                          ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                          : "border-white/10 focus:border-indigo-400/60 focus:ring-indigo-400/20"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{selectedDialCodeLabel}</span>
                      <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                    {fieldErrors.countryCode ? (
                      <span className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-red-300" title="Required" aria-hidden="true">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    ) : null}

                    {isCodeOpen ? (
                      <div
                        ref={codePopoverRef}
                        tabIndex={-1}
                        className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_30px_70px_-45px_rgba(0,0,0,0.85)] backdrop-blur"
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            moveDialIndex(1);
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            moveDialIndex(-1);
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            selectActiveDialCode();
                          } else if (e.key === " " || e.key === "Spacebar") {
                            e.preventDefault();
                            selectActiveDialCode();
                          } else if (e.key === "Escape") {
                            setIsCodeOpen(false);
                          }
                        }}
                      >
                        <ul
                          role="listbox"
                          aria-activedescendant={
                            dialCodeOptions[activeDialIndex]
                              ? `dial-opt-${dialCodeOptions[activeDialIndex].iso2}-${dialCodeOptions[activeDialIndex].dialCode.replace("+", "")}`
                              : undefined
                          }
                          className="max-h-56 overflow-auto py-1 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
                        >
                          {dialCodeOptions.length ? (
                            dialCodeOptions.map((option) => {
                              const isSelected = option.dialCode === formData.countryCode;
                              const isActive =
                                dialCodeOptions[activeDialIndex]?.iso2 === option.iso2 &&
                                dialCodeOptions[activeDialIndex]?.dialCode === option.dialCode;
                              return (
                                <li
                                  key={`${option.iso2}-${option.dialCode}`}
                                  id={`dial-opt-${option.iso2}-${option.dialCode.replace("+", "")}`}
                                  role="option"
                                  aria-selected={isSelected}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({ ...prev, countryCode: option.dialCode }));
                                      setFieldErrors((prev) => {
                                        if (!("countryCode" in prev)) return prev;
                                        const next = { ...prev };
                                        delete next.countryCode;
                                        return next;
                                      });
                                      setIsCodeOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition ${
                                      isActive
                                        ? "bg-indigo-500/20 text-slate-50"
                                        : isSelected
                                          ? "bg-indigo-500/15 text-slate-50"
                                          : "text-slate-100 hover:bg-white/5"
                                    }`}
                                  >
                                    <span className="min-w-0 flex-1 truncate">{option.iso2}</span>
                                    <span className="shrink-0 text-slate-300/90">{option.dialCode}</span>
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-3 py-2 text-slate-300/80">No results</li>
                          )}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative">
                    <PhoneCall
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      autoComplete="off"
                      inputMode="numeric"
                      placeholder={fieldErrors.mobile ? fieldErrors.mobile : "Phone number"}
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      aria-invalid={Boolean(fieldErrors.mobile)}
                      className={`h-11 w-full rounded-full border bg-slate-900/70 py-2.5 pr-10 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                        fieldErrors.mobile
                          ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                          : "border-white/10 focus:border-indigo-400/60 focus:ring-indigo-400/20"
                      }`}
                    />
                    {errorIcon(fieldErrors.mobile)}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="company" className="text-xs font-medium text-slate-200">
                    Company
                  </label>
                  <div className="relative mt-1">
                    <Building2
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="company"
                      name="company"
                      type="text"
                      autoComplete="off"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={fieldErrors.company ? fieldErrors.company : "Company name"}
                      required
                      aria-invalid={Boolean(fieldErrors.company)}
                      className={`w-full rounded-full border bg-slate-900/70 py-2.5 pr-10 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                        fieldErrors.company
                          ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                          : "border-white/10 focus:border-indigo-400/60 focus:ring-indigo-400/20"
                      }`}
                    />
                    {errorIcon(fieldErrors.company)}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="text-xs font-medium text-slate-200">
                    Address
                  </label>
                  <div className="relative mt-1">
                    <MapPin
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="off"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={fieldErrors.address ? fieldErrors.address : "Street address"}
                      required
                      aria-invalid={Boolean(fieldErrors.address)}
                      className={`w-full rounded-full border bg-slate-900/70 py-2.5 pr-10 pl-10 text-sm text-slate-100 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                        fieldErrors.address
                          ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                          : "border-white/10 focus:border-indigo-400/60 focus:ring-indigo-400/20"
                      }`}
                    />
                    {errorIcon(fieldErrors.address)}
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-300/90">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900/60 text-indigo-400 focus:ring-indigo-400/20"
                  aria-invalid={Boolean(fieldErrors.agreeToTerms)}
                  aria-describedby={fieldErrors.agreeToTerms ? "terms-error" : undefined}
                />
                <span>
                  I accept the{" "}
                  <Link href="#" className="font-medium text-indigo-300 hover:text-indigo-200">
                    Terms and Conditions
                  </Link>
                  .
                </span>
              </label>
              {fieldErrors.agreeToTerms ? (
                <p id="terms-error" className="-mt-2 text-xs text-red-300">
                  {fieldErrors.agreeToTerms}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!formData.agreeToTerms || isSubmitting}
                className="w-full rounded-full bg-linear-to-r from-[#ffd230] to-[#ffb703] px-4 py-3 text-sm font-semibold text-[#071127] shadow-sm transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Registering..." : "Sign Up"}
              </button>
            </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
