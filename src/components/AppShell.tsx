import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", to: "/" },
      { label: "Email Generator", to: "/email" },
      { label: "Meeting Summarizer", to: "/meetings" },
      { label: "Task Planner", to: "/tasks" },
    ],
  },
  {
    group: "Tools",
    items: [
      { label: "AI Assistant", to: "/assistant" },
      { label: "Settings", to: "/settings" },
    ],
  },
] as const;

export function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-24 -top-32 size-[46rem] rounded-full opacity-45 blur-3xl animate-[aurora_20s_var(--ease-aurora)_infinite]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute right-[-8rem] top-[12rem] size-[40rem] rounded-full opacity-40 blur-3xl animate-[aurora_26s_var(--ease-aurora)_infinite_reverse]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary-2) 50%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute left-[28%] bottom-[-10rem] size-[42rem] rounded-full opacity-25 blur-3xl animate-[aurora_30s_var(--ease-aurora)_infinite]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--amber) 40%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((section) => (
        <div key={section.group} className="mt-4 first:mt-0">
          <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-faint">
            {section.group}
          </p>
          {section.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              activeProps={{ className: "bg-foreground/10 font-medium text-foreground" }}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`size-1.5 rounded-full ${isActive ? "bg-primary" : "bg-foreground/20"}`}
                  />
                  {item.label}
                </>
              )}
            </Link>
          ))}
        </div>
      ))}
    </>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`font-mono text-[10px] leading-relaxed text-faint ${className}`}>
      AI-generated content may contain mistakes. Please review and verify important information
      before using it.
    </p>
  );
}

export function AppShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground antialiased">
      <Aurora />

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col px-4 py-6 lg:flex">
          <div className="flex items-center gap-2.5 px-2">
            <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-2 font-mono text-sm font-semibold text-background">
              V
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Vantage</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Workspace</p>
            </div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-1 text-sm">
            <NavLinks />
          </nav>

          <div className="glass mt-4 rounded-xl p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Pro plan</p>
            <p className="mt-1 text-sm font-medium">1,240 credits left</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-primary-2" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 lg:px-10 lg:py-8">
          <div className="animate-[rise_0.4s_var(--ease-aurora)_both]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Open navigation"
                  onClick={() => setOpen(true)}
                  className="glass grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground lg:hidden"
                >
                  <Menu className="size-4" />
                </button>
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
                    {eyebrow}
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                    {title}
                  </h1>
                </div>
              </div>
              <div className="glass hidden items-center gap-2 rounded-full px-3 py-2 sm:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs text-muted-foreground">AI engine online</span>
              </div>
            </div>
          </div>

          {children}

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <p className="font-mono text-[11px] text-faint">
              © 2026 Vantage · AI Workplace Productivity Assistant
            </p>
            <p className="font-mono text-[11px] text-faint">All systems operational · v2.1</p>
          </footer>
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="glass absolute inset-y-0 left-0 w-72 px-4 py-6">
            <div className="flex items-center justify-between px-2">
              <p className="text-sm font-semibold tracking-tight">Vantage</p>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-foreground/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1 text-sm">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
