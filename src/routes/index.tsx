import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell, Disclaimer } from "@/components/AppShell";
import { Panel, PanelHeading } from "@/components/kit";
import { useWorkspace, type ActivityKind } from "@/lib/activity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Vantage AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Track tasks planned, emails generated and meetings summarized in one AI workplace productivity dashboard.",
      },
      { property: "og:title", content: "Dashboard — Vantage AI Workplace Assistant" },
      {
        property: "og:description",
        content:
          "Track tasks planned, emails generated and meetings summarized in one AI workplace productivity dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const DOT: Record<ActivityKind, string> = {
  email: "bg-primary",
  meeting: "bg-primary-2",
  task: "bg-amber",
  assistant: "bg-foreground/25",
};

const QUICK = [
  {
    to: "/email",
    title: "Smart Email Generator",
    copy: "Describe the purpose, pick a tone, get an editable draft.",
  },
  {
    to: "/meetings",
    title: "Meeting Summarizer",
    copy: "Turn raw notes into key points, decisions, actions and deadlines.",
  },
  {
    to: "/tasks",
    title: "AI Task Planner",
    copy: "Prioritise your list into a daily or weekly schedule.",
  },
] as const;

function Dashboard() {
  const workspace = useWorkspace();

  const cards = [
    {
      label: "Tasks planned",
      value: workspace.tasksPlanned,
      delta: "+12%",
      deltaClass: "bg-primary/15 text-primary",
      sub: "across 6 workstreams this week",
    },
    {
      label: "Emails generated",
      value: workspace.emailsGenerated,
      delta: "+8%",
      deltaClass: "bg-primary-2/15 text-primary-2",
      sub: "avg. 4.2s to first draft",
    },
    {
      label: "Meetings summarized",
      value: workspace.meetingsSummarized,
      delta: "+19%",
      deltaClass: "bg-amber/15 text-amber",
      sub: "212 action items captured",
    },
  ];

  return (
    <AppShell eyebrow="Dashboard" title="Good morning, Elena">
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Panel key={card.label} delay={60 * (i + 1)}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] ${card.deltaClass}`}>
                {card.delta}
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs text-faint">{card.sub}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel delay={220} className="lg:col-span-3">
          <PanelHeading title="Recent activity" hint="last 24h" />
          <ul className="mt-4 divide-y divide-border">
            {workspace.activity.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 py-3">
                <span className={`mt-1 size-2 shrink-0 rounded-full ${DOT[entry.kind]}`} />
                <div className="min-w-0">
                  <p className="text-sm">{entry.text}</p>
                  <p className="font-mono text-[11px] text-faint">
                    {entry.kind === "email"
                      ? "Email Generator"
                      : entry.kind === "meeting"
                        ? "Meeting Summarizer"
                        : entry.kind === "task"
                          ? "Task Planner"
                          : "AI Assistant"}{" "}
                    · {entry.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel delay={280} className="lg:col-span-2">
          <PanelHeading title="Jump back in" hint="tools" />
          <div className="mt-4 flex flex-col gap-2">
            {QUICK.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-xl bg-background/40 p-3 ring-1 ring-border transition-colors hover:ring-primary/40"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-faint">{item.copy}</p>
              </Link>
            ))}
          </div>
          <Disclaimer className="mt-3" />
        </Panel>
      </div>
    </AppShell>
  );
}
