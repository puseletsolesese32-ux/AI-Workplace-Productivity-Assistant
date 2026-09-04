import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  ChoiceGroup,
  EmptyNote,
  ErrorNote,
  FieldLabel,
  GhostButton,
  LoadingDots,
  Panel,
  PanelHeading,
  PrimaryButton,
  TextArea,
  TextField,
} from "@/components/kit";
import { recordActivity } from "@/lib/activity";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Vantage" },
      {
        name: "description",
        content:
          "Describe the purpose of your email, choose a formal, friendly or persuasive tone, and get an editable AI draft.",
      },
      { property: "og:title", content: "Smart Email Generator — Vantage" },
      {
        property: "og:description",
        content: "Generate professional workplace emails in the tone you need, then edit and copy.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState(
    "Follow up with the Meridian design team on the revised Q3 launch timeline",
  );
  const [tone, setTone] = useState<(typeof TONES)[number]>("Friendly");
  const [recipient, setRecipient] = useState("Priya Naidoo, Design Lead");
  const [sender, setSender] = useState("Elena");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    if (purpose.trim().length < 3) {
      setError("Please describe what the email should be about.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await run({
        data: { purpose, tone, recipient: recipient || undefined, sender: sender || undefined },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft(result.data.email);
      recordActivity("email", `Drafted a ${tone.toLowerCase()} email — ${purpose.slice(0, 60)}`);
    } catch {
      setError("Could not reach the AI service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success("Email copied to clipboard");
    } catch {
      toast.error("Copying is blocked in this browser");
    }
  }

  return (
    <AppShell eyebrow="Email Generator" title="Smart Email Generator">
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel delay={60} className="lg:col-span-2">
          <PanelHeading title="Compose brief" hint="input" />

          <label className="mt-4 block">
            <FieldLabel>Purpose</FieldLabel>
            <TextArea
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Ask the vendor for an updated quote before Friday"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Recipient</FieldLabel>
              <TextField value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </label>
            <label className="block">
              <FieldLabel>Sign-off name</FieldLabel>
              <TextField value={sender} onChange={(e) => setSender(e.target.value)} />
            </label>
          </div>

          <div className="mt-3">
            <FieldLabel>Tone</FieldLabel>
            <ChoiceGroup options={TONES} value={tone} onChange={setTone} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <PrimaryButton onClick={onGenerate} disabled={loading}>
              {loading ? "Generating…" : "Generate email"}
            </PrimaryButton>
            <GhostButton onClick={() => setDraft("")} disabled={!draft || loading}>
              Clear draft
            </GhostButton>
          </div>

          {error ? <ErrorNote message={error} /> : null}
          <Disclaimer className="mt-3" />
        </Panel>

        <Panel delay={140} className="lg:col-span-3">
          <PanelHeading title="Draft" hint="editable" />
          <div className="mt-4 rounded-xl bg-background/40 p-3 ring-1 ring-border">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
              {loading ? (
                <LoadingDots />
              ) : (
                <span className="font-mono text-[11px] text-faint">
                  {draft ? `${tone} tone · ${draft.split(/\s+/).length} words` : "No draft yet"}
                </span>
              )}
              <PrimaryButton onClick={onCopy} disabled={!draft} className="px-3 py-1.5">
                Copy
              </PrimaryButton>
            </div>

            {draft ? (
              <TextArea
                rows={18}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="mt-2 bg-transparent leading-relaxed ring-0 focus:ring-0"
              />
            ) : (
              <div className="py-10 text-center">
                <EmptyNote>
                  Describe the email on the left and generate a draft you can edit here.
                </EmptyNote>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
