import { useEffect, useState } from "react";

export type ActivityKind = "email" | "meeting" | "task" | "assistant";

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  text: string;
  time: string;
};

export type WorkspaceState = {
  tasksPlanned: number;
  emailsGenerated: number;
  meetingsSummarized: number;
  activity: ActivityEntry[];
};

const STORAGE_KEY = "vantage-workspace-v1";
const EVENT = "vantage-workspace-change";

export const SEED_STATE: WorkspaceState = {
  tasksPlanned: 148,
  emailsGenerated: 324,
  meetingsSummarized: 57,
  activity: [
    {
      id: "seed-1",
      kind: "email",
      text: "Drafted a persuasive renewal email to Northwind",
      time: "09:14",
    },
    {
      id: "seed-2",
      kind: "meeting",
      text: "Summarized the Q3 roadmap sync — 8 decisions logged",
      time: "08:47",
    },
    {
      id: "seed-3",
      kind: "task",
      text: "Replanned Tuesday — moved 3 items to focus blocks",
      time: "08:12",
    },
    {
      id: "seed-4",
      kind: "assistant",
      text: "Answered a scheduling conflict via AI Assistant",
      time: "07:58",
    },
  ],
};

function read(): WorkspaceState {
  if (typeof window === "undefined") return SEED_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_STATE;
    return { ...SEED_STATE, ...(JSON.parse(raw) as Partial<WorkspaceState>) } as WorkspaceState;
  } catch {
    return SEED_STATE;
  }
}

function write(state: WorkspaceState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT));
}

export function recordActivity(kind: ActivityKind, text: string, increment = 1) {
  const state = read();
  const next: WorkspaceState = {
    ...state,
    tasksPlanned: state.tasksPlanned + (kind === "task" ? increment : 0),
    emailsGenerated: state.emailsGenerated + (kind === "email" ? 1 : 0),
    meetingsSummarized: state.meetingsSummarized + (kind === "meeting" ? 1 : 0),
    activity: [
      {
        id: `${Date.now()}`,
        kind,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...state.activity,
    ].slice(0, 8),
  };
  write(next);
}

export function useWorkspace(): WorkspaceState {
  const [state, setState] = useState<WorkspaceState>(SEED_STATE);

  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
