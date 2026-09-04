import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { AiError, callAi, parseJsonResponse } from "./ai.server";

const DISCLAIMER_GUARD =
  "Never invent facts, names, figures or commitments that are not present in the user's input. If information is missing, use a clearly generic placeholder in square brackets.";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    const message =
      error instanceof AiError
        ? error.message
        : "Something went wrong while generating. Please try again.";
    console.error("AI request failed:", error);
    return { ok: false, error: message };
  }
}

/* -------------------------------------------------------------- Email --- */

const EmailInput = z.object({
  purpose: z.string().min(3).max(4000),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  recipient: z.string().max(200).optional(),
  sender: z.string().max(200).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) =>
    run(async () => {
      const system = [
        "You are a senior workplace communication assistant writing business email on behalf of a professional.",
        `Write in a ${data.tone.toLowerCase()} tone.`,
        "Formal = precise, respectful, no contractions. Friendly = warm, human, light contractions. Persuasive = confident, benefit-led, clear call to action.",
        "Output plain text only: a 'Subject: ...' line, a blank line, then the body with a greeting, 1-3 short paragraphs and a sign-off.",
        "Keep it under 200 words. No markdown, no commentary, no explanations.",
        DISCLAIMER_GUARD,
      ].join(" ");

      const user = [
        `Purpose of the email: ${data.purpose}`,
        data.recipient ? `Recipient: ${data.recipient}` : null,
        data.sender ? `Sender / sign-off name: ${data.sender}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return { email: await callAi(system, user) };
    }),
  );

/* ------------------------------------------------------------ Meeting --- */

export type MeetingSummary = {
  overview: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{ task: string; owner: string }>;
  deadlines: Array<{ item: string; due: string }>;
};

const MeetingInput = z.object({
  notes: z.string().min(20).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) =>
    run(async () => {
      const system = [
        "You are a meeting analyst. Read raw meeting notes and produce a structured summary.",
        "Respond with JSON only, no markdown fences, matching exactly:",
        '{"overview": string, "keyPoints": string[], "decisions": string[], "actionItems": [{"task": string, "owner": string}], "deadlines": [{"item": string, "due": string}]}',
        "overview is 1-2 sentences. Keep every list item short and specific. Use 'Unassigned' when no owner is named and 'Not specified' when no date is named. Return empty arrays where nothing applies.",
        DISCLAIMER_GUARD,
      ].join(" ");

      const raw = await callAi(system, `Meeting notes:\n\n${data.notes}`);
      const parsed = parseJsonResponse<MeetingSummary>(raw);
      return {
        overview: parsed.overview ?? "",
        keyPoints: parsed.keyPoints ?? [],
        decisions: parsed.decisions ?? [],
        actionItems: parsed.actionItems ?? [],
        deadlines: parsed.deadlines ?? [],
      } satisfies MeetingSummary;
    }),
  );

/* --------------------------------------------------------------- Plan --- */

export type PlannedTask = {
  title: string;
  priority: "High" | "Medium" | "Low";
  slot: string;
  day: string;
  rationale: string;
};

export type TaskPlan = {
  summary: string;
  tasks: PlannedTask[];
};

const PlanInput = z.object({
  tasks: z.string().min(3).max(8000),
  horizon: z.enum(["Daily", "Weekly"]),
  hours: z.string().max(120).optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) =>
    run(async () => {
      const system = [
        "You are a productivity planner. Organise a list of tasks into a realistic, prioritised schedule.",
        `Build a ${data.horizon.toLowerCase()} schedule.`,
        "Respond with JSON only, no markdown fences, matching exactly:",
        '{"summary": string, "tasks": [{"title": string, "priority": "High"|"Medium"|"Low", "slot": string, "day": string, "rationale": string}]}',
        data.horizon === "Daily"
          ? "Every task uses day 'Today' and slot as a time range like '09:00 - 10:30'."
          : "Spread tasks across weekdays (Monday..Friday) in the day field, with slot as a time range like '09:00 - 10:30'.",
        "Order tasks by priority then time. rationale is one short clause. summary is 1-2 sentences.",
        "Group deep-focus work in the morning and admin work in the afternoon where reasonable.",
        DISCLAIMER_GUARD,
      ].join(" ");

      const user = [
        `Tasks:\n${data.tasks}`,
        data.hours ? `Working hours / constraints: ${data.hours}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const parsed = parseJsonResponse<TaskPlan>(await callAi(system, user));
      return { summary: parsed.summary ?? "", tasks: parsed.tasks ?? [] } satisfies TaskPlan;
    }),
  );

/* ---------------------------------------------------------- Assistant --- */

const AssistantInput = z.object({
  message: z.string().min(1).max(6000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
    .max(20)
    .optional(),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AssistantInput.parse(input))
  .handler(async ({ data }) =>
    run(async () => {
      const system = [
        "You are Vantage, an AI workplace productivity assistant.",
        "Help with prioritisation, writing, meeting follow-ups, scheduling and workplace communication.",
        "Be concise and practical: short paragraphs or tight bullet lists, no filler preamble.",
        DISCLAIMER_GUARD,
      ].join(" ");

      const transcript = (data.history ?? [])
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");

      const user = transcript
        ? `Conversation so far:\n${transcript}\n\nUser: ${data.message}`
        : data.message;

      return { reply: await callAi(system, user) };
    }),
  );
