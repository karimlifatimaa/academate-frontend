import Link from "next/link";
import { BookOpen } from "lucide-react";

interface AuthSplitProps {
  children: React.ReactNode;
  /** Content shown below the form (links, divider, oauth) */
  footer?: React.ReactNode;
  /** Left panel override for title/subtitle/description */
  panel?: {
    title?: React.ReactNode;
    subtitle?: string;
    description?: string;
  };
}

const DEFAULT_PANEL = {
  title: (
    <>
      Gələcəyinizi{" "}
      <span style={{ color: "#7BAE8A" }}>bizimlə qurun.</span>
    </>
  ),
  description:
    "Azərbaycanın ən qabaqcıl təhsil portalına qoşulun. Dərslərinizi izləyin, tapşırıqları yerinə yetirin və biliklərinizi artırın.",
};

export function AuthSplit({ children, footer, panel }: AuthSplitProps) {
  const p = { ...DEFAULT_PANEL, ...panel };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8F5F0]">
      {/* ── Left panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 text-white"
        style={{
          background:
            "linear-gradient(145deg, #4A6741 0%, #6B8F6E 35%, #8FAF88 65%, #B8CFAC 100%)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <BookOpen className="size-4 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Academate</span>
        </Link>

        {/* Headline */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              {p.title}
            </h1>
            <p className="text-white/75 text-base leading-relaxed max-w-xs">
              {p.description}
            </p>
          </div>

          {/* Social proof */}
          <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-5 space-y-3 max-w-xs">
            <div className="flex -space-x-2">
              {["FK", "AM", "LH", "RN"].map((initials, i) => (
                <span
                  key={i}
                  className="inline-flex size-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
                  style={{
                    background: `hsl(${140 + i * 25} 30% ${45 + i * 5}%)`,
                  }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <p className="text-sm text-white/90 font-medium">
              10,000+ şagird artıq bizimlə
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="text-white/50 text-xs">© 2024 Academate. Bütün hüquqlar qorunur.</p>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-10 overflow-y-auto">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4A6741]">
            <BookOpen className="size-3.5 text-white" />
          </span>
          <span className="text-base font-semibold">Academate</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {children}

          {footer && (
            <div className="mt-6 space-y-4">
              {footer}
            </div>
          )}
        </div>

        {/* Bottom footer links */}
        <div className="mt-10 hidden lg:flex gap-6 text-xs text-muted-foreground">
          {["Haqqımızda", "İstifadə Şərtləri", "Maxfilik", "Slaqa"].map((l) => (
            <span key={l} className="hover:text-foreground cursor-pointer transition-colors">
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Reusable form field ──────────────────────────────────── */
interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
  hint?: string;
}

export function Field({ label, error, children, optional, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A] select-none">
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">(ixtiyari)</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────── */
export function OrDivider() {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">VƏ YA</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ── OAuth buttons ───────────────────────────────────────── */
export function OAuthButtons() {
  return (
    <button
      type="button"
      className="flex w-full h-10 items-center justify-center gap-2.5 rounded-xl border border-input bg-white px-4 text-sm font-medium text-[#1A1A1A] hover:bg-muted/50 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Google ilə daxil ol
    </button>
  );
}

/* ── Password strength bar ───────────────────────────────── */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const requiredMet =
    checks.length && checks.upper && checks.lower && checks.digit;
  const passedRequired = [checks.length, checks.upper, checks.lower, checks.digit]
    .filter(Boolean).length;

  // Cap the visual score at "Orta" (3/4 bars) until ALL required rules are met.
  // Once all 4 required rules pass, show "Güclü" (4/4). With a special char too,
  // show "Çox güclü" (4/4 plus distinct color).
  let score: number;
  let label: string;
  let color: string;

  if (!requiredMet) {
    if (passedRequired <= 1) {
      score = 1;
      label = "Çox zəif";
      color = "bg-red-400";
    } else if (passedRequired === 2) {
      score = 2;
      label = "Zəif";
      color = "bg-orange-400";
    } else {
      score = 3;
      label = "Orta";
      color = "bg-yellow-400";
    }
  } else if (!checks.special) {
    score = 4;
    label = "Güclü";
    color = "bg-[#6B9E6B]";
  } else {
    score = 4;
    label = "Çox güclü";
    color = "bg-[#4A6741]";
  }

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label} şifrə</p>
    </div>
  );
}

/* ── Submit button ───────────────────────────────────────── */
export function SubmitButton({
  isSubmitting,
  label,
  loadingLabel,
}: {
  isSubmitting: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
      style={{ background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)" }}
    >
      {isSubmitting ? (
        <>
          <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
