import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  ChoiceGroup,
  EmptyNote,
  ErrorNote,
  FieldLabel,
  LoadingDots,
  Panel,
  PanelHeading,
  PrimaryButton,
  TextArea,
  TextField,
} from "@/components/kit";
import { recordActivity } from "@/lib/activity";
import { planTasks, type PlannedTask, type TaskPlan } from "@/lib/ai.functions";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Vantage" },
      {
        name: "description",
        content:
          "Enter your tasks and get a prioritised daily or weekly schedule with suggested time slots.",
      },
      { property: "og:title", content: "AI Task Planner — Vantage" },
      {
        property: "og:description",
        content: "Turn a messy task list into a prioritised schedule with suggested time slots.",
      },
    ],
  }),
  component: TasksPage,
});

const HORIZONS = ["Daily", "Weekly"] as const;

const SAMPLE = `Finalise the Q3 launch deck
Review Meridian design specs and leave comments
Send onboarding invites to the beta cohort
Prep 1:1 with the design lead
Fix the failing checkout test
Write the release notes draft`;

const PRIORITY_STYLE: Record<PlannedTask["priority"], string> = {
  High: "bg-primary/15 text-primary",
  Medium: "bg-amber/15 text-amber",
  Low: "bg-foreground/10 text-muted-foreground",
};

function TasksPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState(SAMPLE);
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("Daily");
  const [hours, setHours] = useState("09:00 - 17:00, lunch at 13:00");
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPlan() {
    if (tasks.trim().length < 3) {
      setError("Add at least one task to plan.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await run({ data: { tasks, horizon, hours: hours || undefined } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPlan(result.data);
      recordActivity(
        "task",
        `Planned ${result.data.tasks.length} tasks into a ${horizon.toLowerCase()} schedule`,
        result.data.tasks.length,
      );
    } catch {
      setError("Could not reach the AI service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const days = plan
    ? Array.from(new Set(plan.tasks.map((t) => t.day || "Today"))).map((day) => ({
        day,
        items: plan.tasks.filter((t) => (t.day || "Today") === day),
      }))
    : [];

  return (
    <AppShell eyebrow="Task Planner" title="AI Task Planner">
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel delay={60} className="lg:col-span-2">
          <PanelHeading title="Your tasks" hint="input" />
          <label className="mt-4 block">
            <FieldLabel>One task per line</FieldLabel>
            <TextArea rows={12} value={tasks} onChange={(e) => setTasks(e.target.value)} />
          </label>

          <div className="mt-3">
            <FieldLabel>Schedule</FieldLabel>
            <ChoiceGroup options={HORIZONS} value={horizon} onChange={setHorizon} />
          </div>

          <label className="mt-3 block">
            <FieldLabel>Working hours & constraints</FieldLabel>
            <TextField value={hours} onChange={(e) => setHours(e.target.value)} />
          </label>

          <div className="mt-4">
            <PrimaryButton onClick={onPlan} disabled={loading}>
              {loading ? "Planning…" : "Organize my tasks"}
            </PrimaryButton>
          </div>
          {error ? <ErrorNote message={error} /> : null}
          <Disclaimer className="mt-3" />
        </Panel>

        <Panel delay={140} className="lg:col-span-3">
          <PanelHeading title="Suggested schedule" hint={loading ? "" : horizon.toLowerCase()} />
          {loading ? (
            <div className="mt-4">
              <LoadingDots label="Prioritising your tasks…" />
            </div>
          ) : plan ? (
            <div className="mt-4 space-y-5">
              <p className="rounded-xl bg-background/40 p-3 text-sm leading-relaxed ring-1 ring-border">
                {plan.summary}
              </p>
              {days.map((group) => (
                <div key={group.day}>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-faint">
                    {group.day}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {group.items.map((task, i) => (
                      <li
                        key={`${group.day}-${i}`}
                        className="rounded-xl bg-background/40 p-3 ring-1 ring-border"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium">{task.title}</p>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] ${PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.Low}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-faint">
                          {task.slot}
                          {task.rationale ? ` · ${task.rationale}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-background/40 py-14 text-center ring-1 ring-border">
              <EmptyNote>Your prioritised schedule will appear here.</EmptyNote>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
