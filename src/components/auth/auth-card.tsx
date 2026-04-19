import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <div className={cn("w-full max-w-[400px] space-y-6", className)}>
        {/* Logo */}
        <div className="text-center">
          <span className="inline-block text-2xl font-bold tracking-tight">
            academ<span className="text-primary">ate</span>
          </span>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-2 border-b border-border/60">
            <h1 className="text-lg font-semibold leading-snug">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="px-6 py-5">{children}</div>

          {footer && (
            <div className="px-6 py-4 bg-muted/50 border-t border-border/60 text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}

export function Field({ label, error, children, optional }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium leading-none select-none">
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">(ixtiyari)</span>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
