import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`glass animate-[rise_0.5s_var(--ease-aurora)_both] rounded-2xl p-5 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export function PanelHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {hint ? <span className="font-mono text-[11px] text-faint">{hint}</span> : null}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-faint">{children}</span>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`mt-1 w-full resize-y rounded-lg bg-background/40 px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-primary/60 ${props.className ?? ""}`}
    />
  );
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1 w-full rounded-lg bg-background/40 px-3 py-2 text-sm outline-none ring-1 ring-border focus:ring-primary/60 ${props.className ?? ""}`}
    />
  );
}

export function ChoiceGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={
            option === value
              ? "rounded-lg bg-primary/15 px-3 py-2 text-xs font-medium text-primary ring-1 ring-primary/40"
              : "rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-md bg-gradient-to-r from-primary to-primary-2 px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-md px-3 py-2 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function LoadingDots({ label = "Generating…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-1.5 animate-[dotpulse_1s_var(--ease-aurora)_infinite] rounded-full bg-primary" />
      <span className="size-1.5 animate-[dotpulse_1s_var(--ease-aurora)_infinite] rounded-full bg-primary [animation-delay:150ms]" />
      <span className="size-1.5 animate-[dotpulse_1s_var(--ease-aurora)_infinite] rounded-full bg-primary [animation-delay:300ms]" />
      <span className="ml-1 font-mono text-[11px] text-faint">{label}</span>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive ring-1 ring-destructive/30">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-faint">{children}</p>;
}
