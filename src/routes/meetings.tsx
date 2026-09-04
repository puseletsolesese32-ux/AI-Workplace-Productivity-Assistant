import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  EmptyNote,
  ErrorNote,
  FieldLabel,
  GhostButton,
  LoadingDots,
  Panel,
  PanelHeading,
  PrimaryButton,
  TextArea,
} from "@/components/kit";
import { recordActivity } from "@/lib/activity";
import { summarizeMeeting, type MeetingSummary } from "@/lib/ai.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Vantage" },
      {
        name: "description",
        content:
          "Paste long meeting notes and get key points, decisions, action items and deadlines in clear sections.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Vantage" },
      {
        property: "og:description",
        content: "Turn raw meeting notes into key points, decisions, action items and deadlines.",
      },
    ],
  }),
  component: MeetingsPage,
});

const SAMPLE = `Q3 roadmap sync — 14 May, 09:00
Attendees: Elena (PM), Priya (Design), Marcus (Eng), Sam (Marketing)

Marcus flagged that the migration work is two days behind because of the auth refactor. We agreed to move the public launch from 5 Aug to 12 Aug so QA gets a full week.
Priya showed the new onboarding flow. Team liked it; she'll finalise the empty states by Friday.
Pricing: we decided to go with three tiers instead of two. Sam will update the pricing page copy before the 30 May press kit deadline.
Open question about whether the beta cohort gets grandfathered pricing — Elena to confirm with finance next week.
Marcus will land the beta bug fixes by 21 May when the beta window closes.`;

function List({ title, items, dot }: { title: string; items: string[]; dot: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-faint">{title}</p>
      {items.length ? (
        <ul className="mt-2 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dot}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-faint">None captured.</p>
      )}
    </div>
  );
}

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState(SAMPLE);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSummarize() {
    if (notes.trim().length < 20) {
      setError("Paste at least a few lines of meeting notes to summarize.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await run({ data: { notes } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSummary(result.data);
      recordActivity(
        "meeting",
        `Summarized meeting notes — ${result.data.decisions.length} decisions logged`,
      );
    } catch {
      setError("Could not reach the AI service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell eyebrow="Meeting Summarizer" title="Meeting Notes Summarizer">
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel delay={60} className="lg:col-span-2">
          <PanelHeading title="Raw notes" hint="input" />
          <label className="mt-4 block">
            <FieldLabel>Paste your meeting notes</FieldLabel>
            <TextArea rows={18} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="mt-4 flex items-center gap-2">
            <PrimaryButton onClick={onSummarize} disabled={loading}>
              {loading ? "Summarizing…" : "Summarize notes"}
            </PrimaryButton>
            <GhostButton onClick={() => setNotes(SAMPLE)} disabled={loading}>
              Load sample
            </GhostButton>
          </div>
          {error ? <ErrorNote message={error} /> : null}
          <Disclaimer className="mt-3" />
        </Panel>

        <Panel delay={140} className="lg:col-span-3">
          <PanelHeading title="Structured summary" hint={loading ? "" : "output"} />
          {loading ? (
            <div className="mt-4">
              <LoadingDots label="Reading your notes…" />
            </div>
          ) : summary ? (
            <div className="mt-4 space-y-5">
              <p className="rounded-xl bg-background/40 p-3 text-sm leading-relaxed ring-1 ring-border">
                {summary.overview}
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <List title="Key points" items={summary.keyPoints} dot="bg-primary" />
                <List title="Decisions" items={summary.decisions} dot="bg-primary-2" />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-faint">
                  Action items
                </p>
                {summary.actionItems.length ? (
                  <ul className="mt-2 space-y-2">
                    {summary.actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start justify-between gap-3 rounded-lg bg-background/40 px-3 py-2 text-sm ring-1 ring-border"
                      >
                        <span>{item.task}</span>
                        <span className="shrink-0 font-mono text-[11px] text-primary">
                          {item.owner}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-faint">None captured.</p>
                )}
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-faint">
                  Deadlines
                </p>
                {summary.deadlines.length ? (
                  <ul className="mt-2 space-y-2">
                    {summary.deadlines.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start justify-between gap-3 rounded-lg bg-background/40 px-3 py-2 text-sm ring-1 ring-border"
                      >
                        <span>{item.item}</span>
                        <span className="shrink-0 font-mono text-[11px] text-amber">
                          {item.due}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-faint">None captured.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-background/40 py-14 text-center ring-1 ring-border">
              <EmptyNote>Your summary sections will appear here.</EmptyNote>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
