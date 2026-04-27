"use client";

import Link from "next/link";
import { formatValidPhoneNumber } from "../../lib/phone";
import {
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";

const MIN_PASSWORD_LENGTH = 8;
const SUCCESS_MESSAGE_VISIBLE_MS = 15000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z\s]+$/;

interface FormData {
  email: string;
  name: string;
  company: string;
  countryCode: string;
  mobile: string;
  password: string;
  address: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  email?: string;
  name?: string;
  company?: string;
  countryCode?: string;
  mobile?: string;
  password?: string;
  address?: string;
  agreeToTerms?: string;
}

const COUNTRY_CODES = [
  { value: "+91", code: "+91", label: "India (+91)" },
  { value: "+1", code: "+1", label: "United States / Canada (+1)" },
  { value: "+20", code: "+20", label: "Egypt (+20)" },
  { value: "+27", code: "+27", label: "South Africa (+27)" },
  { value: "+30", code: "+30", label: "Greece (+30)" },
  { value: "+31", code: "+31", label: "Netherlands (+31)" },
  { value: "+32", code: "+32", label: "Belgium (+32)" },
  { value: "+33", code: "+33", label: "France (+33)" },
  { value: "+34", code: "+34", label: "Spain (+34)" },
  { value: "+36", code: "+36", label: "Hungary (+36)" },
  { value: "+39", code: "+39", label: "Italy (+39)" },
  { value: "+41", code: "+41", label: "Switzerland (+41)" },
  { value: "+43", code: "+43", label: "Austria (+43)" },
  { value: "+44", code: "+44", label: "United Kingdom (+44)" },
  { value: "+45", code: "+45", label: "Denmark (+45)" },
  { value: "+46", code: "+46", label: "Sweden (+46)" },
  { value: "+47", code: "+47", label: "Norway (+47)" },
  { value: "+48", code: "+48", label: "Poland (+48)" },
  { value: "+49", code: "+49", label: "Germany (+49)" },
  { value: "+52", code: "+52", label: "Mexico (+52)" },
  { value: "+54", code: "+54", label: "Argentina (+54)" },
  { value: "+55", code: "+55", label: "Brazil (+55)" },
  { value: "+61", code: "+61", label: "Australia (+61)" },
  { value: "+62", code: "+62", label: "Indonesia (+62)" },
  { value: "+63", code: "+63", label: "Philippines (+63)" },
  { value: "+64", code: "+64", label: "New Zealand (+64)" },
  { value: "+65", code: "+65", label: "Singapore (+65)" },
  { value: "+66", code: "+66", label: "Thailand (+66)" },
  { value: "+81", code: "+81", label: "Japan (+81)" },
  { value: "+82", code: "+82", label: "South Korea (+82)" },
  { value: "+84", code: "+84", label: "Vietnam (+84)" },
  { value: "+86", code: "+86", label: "China (+86)" },
  { value: "+90", code: "+90", label: "Turkey (+90)" },
  { value: "+92", code: "+92", label: "Pakistan (+92)" },
  { value: "+93", code: "+93", label: "Afghanistan (+93)" },
  { value: "+94", code: "+94", label: "Sri Lanka (+94)" },
  { value: "+95", code: "+95", label: "Myanmar (+95)" },
  { value: "+961", code: "+961", label: "Lebanon (+961)" },
  { value: "+971", code: "+971", label: "United Arab Emirates (+971)" },
  { value: "+966", code: "+966", label: "Saudi Arabia (+966)" },
  { value: "+972", code: "+972", label: "Israel (+972)" },
];

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
  const [highlightedCountryIndex, setHighlightedCountryIndex] = useState(0);
  const countryCodeRef = useRef<HTMLDivElement | null>(null);
  const countryOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    company: "",
    countryCode: "+91",
    mobile: "",
    password: "",
    address: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    if (!serverMessage) return;

    const timeoutId = window.setTimeout(() => {
      setServerMessage(null);
    }, SUCCESS_MESSAGE_VISIBLE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [serverMessage]);

  const validateForm = (values: FormData) => {
    const nextErrors: FormErrors = {};
    const email = values.email.trim().toLowerCase();
    const name = values.name.trim();
    const company = values.company.trim();
    const countryCode = values.countryCode.trim();
    const mobile = values.mobile.trim();
    const password = values.password;
    const address = values.address.trim();

    if (!name) {
      nextErrors.name = "Name is required.";
    } else if (!NAME_REGEX.test(name)) {
      nextErrors.name = "Name must contain only alphabets.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!mobile) {
      nextErrors.mobile = "Mobile number is required.";
    } else if (!formatValidPhoneNumber(countryCode, mobile)) {
      nextErrors.mobile = "Please enter a valid phone number.";
    }
    if (!company) nextErrors.company = "Company is required.";
    if (!countryCode) nextErrors.countryCode = "Country code is required.";

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!address) nextErrors.address = "Address is required.";

    if (!values.agreeToTerms) {
      nextErrors.agreeToTerms = "You must accept the Terms and Privacy Policy.";
    }

    return nextErrors;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof FormErrors;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      let nextValue = value;

      if (name === "name") {
        nextValue = value.replace(/[^A-Za-z\s]/g, "");
      }

      if (name === "mobile") {
        nextValue = value.replace(/\D/g, "");
      }

      setFormData((prev) => ({ ...prev, [name]: nextValue }));
    }

    setFieldErrors((prev) => {
      if (!(fieldName in prev)) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[fieldName];
      return nextErrors;
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
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setServerError(result.message || "Registration failed. Please try again.");
        return;
      }

      setServerMessage(result.message || "Registration successful.");
      setFormData({
        email: "",
        name: "",
        company: "",
        countryCode: "+91",
        mobile: "",
        password: "",
        address: "",
        agreeToTerms: false,
      });
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!countryCodeRef.current) return;
      if (!countryCodeRef.current.contains(event.target as Node)) {
        setIsCountryCodeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountryCodeSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, countryCode: value }));
    setIsCountryCodeOpen(false);

    setFieldErrors((prev) => {
      if (!prev.countryCode) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors.countryCode;
      return nextErrors;
    });
  };

  const selectedCountry =
    COUNTRY_CODES.find((country) => country.value === formData.countryCode) ?? COUNTRY_CODES[0];

  const selectedCountryIndex = COUNTRY_CODES.findIndex(
    (country) => country.value === formData.countryCode
  );

  const openCountryCodeList = () => {
    setHighlightedCountryIndex(selectedCountryIndex >= 0 ? selectedCountryIndex : 0);
    setIsCountryCodeOpen(true);
  };

  useEffect(() => {
    if (!isCountryCodeOpen) return;
    countryOptionRefs.current[highlightedCountryIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedCountryIndex, isCountryCodeOpen]);

  const handleCountryCodeKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const lastIndex = COUNTRY_CODES.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isCountryCodeOpen) {
        openCountryCodeList();
        return;
      }
      setHighlightedCountryIndex((prev) => (prev >= lastIndex ? lastIndex : prev + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isCountryCodeOpen) {
        openCountryCodeList();
        return;
      }
      setHighlightedCountryIndex((prev) => (prev <= 0 ? 0 : prev - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (!isCountryCodeOpen) {
        openCountryCodeList();
        return;
      }
      const highlightedCountry = COUNTRY_CODES[highlightedCountryIndex];
      if (highlightedCountry) {
        handleCountryCodeSelect(highlightedCountry.value);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsCountryCodeOpen(false);
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
            <h1 className="text-xl font-bold">Create an account</h1>
            <p className="mt-1 text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-300 transition hover:text-cyan-200">
                Log In
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off" noValidate>
            {serverMessage ? (
              <div className="relative overflow-hidden rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{serverMessage}</span>
                </div>
                <span
                  aria-hidden="true"
                  className="signup-success-timer absolute bottom-0 left-0 h-0.5 w-full origin-left bg-emerald-300/80"
                />
              </div>
            ) : null}

            {serverError ? (
              <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {serverError}
              </p>
            ) : null}

            <div>
              <label htmlFor="name" className="text-xs text-white/80">
                Name
              </label>
              <div className="relative mt-1">
                <User
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300/85"
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  inputMode="text"
                  pattern="[A-Za-z\\s]+"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={`w-full rounded-lg border bg-white/4 py-2 pr-3 pl-8 text-sm text-white placeholder-white/50 transition focus:outline-none focus:ring-1 ${
                    fieldErrors.name
                      ? "border-red-400/70 focus:border-red-400 focus:ring-red-400"
                      : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300"
                  }`}
                />
              </div>
              {fieldErrors.name ? (
                <p id="name-error" className="mt-1 text-xs text-red-300">
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

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
                  placeholder="Email ID"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`w-full rounded-lg border bg-white/4 py-2 pr-3 pl-8 text-sm text-white placeholder-white/50 transition focus:outline-none focus:ring-1 ${
                    fieldErrors.email
                      ? "border-red-400/70 focus:border-red-400 focus:ring-red-400"
                      : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300"
                  }`}
                />
              </div>
              {fieldErrors.email ? (
                <p id="email-error" className="mt-1 text-xs text-red-300">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="mobile" className="text-xs text-white/80">
                Phone Number
              </label>
              <div className="mt-1 grid grid-cols-[140px_minmax(0,1fr)] gap-2">
                <div ref={countryCodeRef} className="relative">
                  <Globe2
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300/85"
                  />
                  <button
                    type="button"
                    id="countryCode"
                    aria-describedby={fieldErrors.countryCode ? "country-code-error" : undefined}
                    aria-haspopup="listbox"
                    aria-expanded={isCountryCodeOpen}
                    onClick={() => {
                      if (isCountryCodeOpen) {
                        setIsCountryCodeOpen(false);
                        return;
                      }

                      openCountryCodeList();
                    }}
                    onKeyDown={handleCountryCodeKeyDown}
                    className={`w-full rounded-lg border bg-white/4 py-2 pr-10 pl-8 text-left text-sm font-medium text-white transition focus:outline-none focus:ring-1 ${
                      fieldErrors.countryCode
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300"
                    }`}
                  >
                    {selectedCountry.code}
                  </button>
                  <ChevronDown
                    aria-hidden="true"
                    className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55 transition-transform ${
                      isCountryCodeOpen ? "rotate-180" : ""
                    }`}
                  />

                  {isCountryCodeOpen ? (
                    <div
                      role="listbox"
                      aria-labelledby="countryCode"
                      className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(8,16,31,0.96),rgba(6,12,24,0.98))] ring-1 ring-cyan-300/20 backdrop-blur-xl shadow-[0_20px_45px_-22px_rgba(2,6,23,0.95)]"
                    >
                      <div className="no-scrollbar max-h-60 overflow-y-auto overscroll-contain py-2">
                        {COUNTRY_CODES.map((country, index) => (
                          <button
                            key={country.value}
                            type="button"
                            role="option"
                            aria-selected={formData.countryCode === country.value}
                            ref={(el) => {
                              countryOptionRefs.current[index] = el;
                            }}
                            onMouseEnter={() => setHighlightedCountryIndex(index)}
                            onClick={() => handleCountryCodeSelect(country.value)}
                            className={`mx-2 my-1 flex w-[calc(100%-1rem)] items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm tracking-[0.01em] transition ${
                              highlightedCountryIndex === index
                                ? "border-cyan-300/55 bg-cyan-300/8 text-cyan-100"
                                : "border-transparent text-white/90 hover:border-cyan-300/25 hover:bg-transparent"
                            }`}
                          >
                            <span className="font-medium">{country.label}</span>
                            <span className="ml-3 text-xs font-semibold text-white/60">{country.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="relative">
                  <PhoneCall
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300/85"
                  />
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Phone number"
                    value={formData.mobile}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.mobile)}
                    aria-describedby={
                      fieldErrors.countryCode || fieldErrors.mobile
                        ? "country-code-error mobile-error"
                        : undefined
                    }
                    className={`w-full rounded-lg border bg-white/4 py-2 pr-3 pl-8 text-sm text-white placeholder-white/45 transition focus:outline-none focus:ring-1 ${
                      fieldErrors.mobile
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300"
                    }`}
                  />
                </div>
              </div>
              {fieldErrors.countryCode ? (
                <p id="country-code-error" className="mt-1 text-xs text-red-300">
                  {fieldErrors.countryCode}
                </p>
              ) : null}
              {fieldErrors.mobile ? (
                <p id="mobile-error" className="mt-1 text-xs text-red-300">
                  {fieldErrors.mobile}
                </p>
              ) : null}
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
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className={`w-full rounded-lg border bg-white/4 py-2 pr-10 pl-8 text-sm text-white placeholder-white/50 transition focus:outline-none focus:ring-1 ${
                    fieldErrors.password
                      ? "border-red-400/70 focus:border-red-400 focus:ring-red-400"
                      : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300"
                  }`}
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
              {fieldErrors.password ? (
                <p id="password-error" className="mt-1 text-xs text-red-300">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="company" className="text-xs text-white/80">
                  Company Working
                </label>
                <div className="relative mt-1">
                  <Building2
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300/85"
                  />
                  <input
                    id="company"
                    name="company"
                    type="text"
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.company)}
                    aria-describedby={fieldErrors.company ? "company-error" : undefined}
                    className={`w-full rounded-lg border bg-white/4 py-2 pr-3 pl-8 text-sm text-white placeholder-white/50 transition focus:outline-none focus:ring-1 ${
                      fieldErrors.company
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300"
                    }`}
                  />
                </div>
                {fieldErrors.company ? (
                  <p id="company-error" className="mt-1 text-xs text-red-300">
                    {fieldErrors.company}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="address" className="text-xs text-white/80">
                  Address
                </label>
                <div className="relative mt-1">
                  <MapPin
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300/85"
                  />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleChange}
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={fieldErrors.address ? "address-error" : undefined}
                    className={`w-full rounded-lg border bg-white/4 py-2 pr-3 pl-8 text-sm text-white placeholder-white/50 transition focus:outline-none focus:ring-1 ${
                      fieldErrors.address
                        ? "border-red-400/70 focus:border-red-400 focus:ring-red-400"
                        : "border-white/10 focus:border-cyan-300 focus:ring-cyan-300"
                    }`}
                  />
                </div>
                {fieldErrors.address ? (
                  <p id="address-error" className="mt-1 text-xs text-red-300">
                    {fieldErrors.address}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-3.5 w-3.5 shrink-0 rounded border-white/30 bg-white/10 text-cyan-300 focus:ring-cyan-300"
                aria-invalid={Boolean(fieldErrors.agreeToTerms)}
                aria-describedby={fieldErrors.agreeToTerms ? "terms-error" : undefined}
              />
              <div className="min-w-0">
                <label
                  htmlFor="agreeToTerms"
                  className="inline-flex flex-wrap items-center gap-1 text-xs leading-4 text-white/80"
                >
                  I agree to the following: {" "}
                  <Link href="#" className="text-cyan-300 transition hover:text-cyan-200">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-cyan-300 transition hover:text-cyan-200">
                    Privacy Policy
                  </Link>
                </label>
                {fieldErrors.agreeToTerms ? (
                  <p id="terms-error" className="mt-1 text-xs text-red-300">
                    {fieldErrors.agreeToTerms}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.agreeToTerms || isSubmitting}
              className="w-full rounded-lg bg-linear-to-r from-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
