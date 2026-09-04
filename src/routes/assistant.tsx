import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AppShell, Disclaimer } from "@/components/AppShell";
import {
  ErrorNote,
  GhostButton,
  LoadingDots,
  Panel,
  PanelHeading,
  PrimaryButton,
  TextArea,
} from "@/components/kit";
import { recordActivity } from "@/lib/activity";
import { askAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Vantage" },
      {
        name: "description",
        content:
          "Ask the workplace AI assistant for help with prioritisation, writing, follow-ups and scheduling.",
      },
      { property: "og:title", content: "AI Assistant — Vantage" },
      {
        property: "og:description",
        content: "A workplace AI assistant for prioritisation, writing, follow-ups and scheduling.",
      },
    ],
  }),
  component: AssistantPage,
});

type Message = { role: "user" | "assistant"; content: string };

const PROMPTS = [
  "Help me prioritise a day with 3 deadlines and 2 meetings.",
  "Draft a polite nudge for an overdue design review.",
  "Turn these notes into a status update for my manager.",
];

function AssistantPage() {
  const run = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi Elena — I can help you plan your day, tighten up a message, or turn meeting notes into next steps. What are we working on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setError(null);
    setInput("");
    const history = messages.slice(-10);
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    try {
      const result = await run({ data: { message, history } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: result.data.reply }]);
      recordActivity("assistant", `Asked the AI assistant — ${message.slice(0, 60)}`);
    } catch {
      setError("Could not reach the AI service. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell eyebrow="AI Assistant" title="Ask Vantage">
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Panel delay={60} className="lg:col-span-3">
          <PanelHeading title="Conversation" hint="live" />
          <div className="mt-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-xl bg-primary/15 px-3 py-2 text-sm ring-1 ring-primary/30"
                    : "max-w-[90%] rounded-xl bg-background/40 px-3 py-2 text-sm leading-relaxed whitespace-pre-line ring-1 ring-border"
                }
              >
                {m.content}
              </div>
            ))}
            {loading ? <LoadingDots label="Thinking…" /> : null}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <TextArea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask anything about your work day…"
            />
            <div className="mt-3 flex items-center gap-2">
              <PrimaryButton onClick={() => void send(input)} disabled={loading || !input.trim()}>
                {loading ? "Sending…" : "Send"}
              </PrimaryButton>
              <GhostButton
                onClick={() => setMessages(messages.slice(0, 1))}
                disabled={loading || messages.length < 2}
              >
                Clear chat
              </GhostButton>
            </div>
            {error ? <ErrorNote message={error} /> : null}
          </div>
        </Panel>

        <Panel delay={140} className="lg:col-span-2">
          <PanelHeading title="Try asking" hint="prompts" />
          <div className="mt-4 flex flex-col gap-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void send(prompt)}
                disabled={loading}
                className="rounded-xl bg-background/40 p-3 text-left text-sm text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-primary/40 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <Disclaimer className="mt-4" />
        </Panel>
      </div>
    </AppShell>
  );
}
