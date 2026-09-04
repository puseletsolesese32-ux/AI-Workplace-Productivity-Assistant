import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  ChoiceGroup,
  FieldLabel,
  GhostButton,
  Panel,
  PanelHeading,
  PrimaryButton,
  TextField,
} from "@/components/kit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Vantage" },
      {
        name: "description",
        content:
          "Manage your workspace profile, default email tone, working hours and responsible AI preferences.",
      },
      { property: "og:title", content: "Settings — Vantage" },
      {
        property: "og:description",
        content: "Workspace profile, default tone, working hours and responsible AI preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const HORIZONS = ["Daily", "Weekly"] as const;

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-background/40 p-3 ring-1 ring-border">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-faint">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-foreground/15"}`}
      >
        <span
          className={`block size-4 rounded-full bg-background transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

function SettingsPage() {
  const [name, setName] = useState("Elena Vermaak");
  const [email, setEmail] = useState("elena@vantage.work");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Friendly");
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>("Daily");
  const [hours, setHours] = useState("09:00 - 17:00");
  const [review, setReview] = useState(true);
  const [history, setHistory] = useState(true);

  return (
    <AppShell eyebrow="Settings" title="Workspace settings">
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel delay={60} className="lg:col-span-3">
          <PanelHeading title="Profile" hint="workspace" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Full name</FieldLabel>
              <TextField value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <FieldLabel>Work email</FieldLabel>
              <TextField value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>

          <div className="mt-5">
            <FieldLabel>Default email tone</FieldLabel>
            <ChoiceGroup options={TONES} value={tone} onChange={setTone} />
          </div>

          <div className="mt-5">
            <FieldLabel>Default planning horizon</FieldLabel>
            <ChoiceGroup options={HORIZONS} value={horizon} onChange={setHorizon} />
          </div>

          <label className="mt-5 block">
            <FieldLabel>Working hours</FieldLabel>
            <TextField value={hours} onChange={(e) => setHours(e.target.value)} />
          </label>

          <div className="mt-5 flex items-center gap-2">
            <PrimaryButton onClick={() => toast.success("Preferences saved")}>
              Save preferences
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                setTone("Friendly");
                setHorizon("Daily");
                setHours("09:00 - 17:00");
                toast.message("Preferences reset to defaults");
              }}
            >
              Reset
            </GhostButton>
          </div>
        </Panel>

        <Panel delay={140} className="lg:col-span-2">
          <PanelHeading title="Responsible AI" hint="policy" />
          <div className="mt-4 space-y-3">
            <Toggle
              label="Require review before sending"
              description="Generated content is always marked as a draft until you approve it."
              checked={review}
              onChange={setReview}
            />
            <Toggle
              label="Keep activity history"
              description="Store recent generations locally so your dashboard stays up to date."
              checked={history}
              onChange={setHistory}
            />
          </div>
          <Disclaimer className="mt-4" />
        </Panel>
      </div>
    </AppShell>
  );
}
