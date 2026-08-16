import { notifyToast } from "@shared/lib/toast";

export type {
  Allocation,
  Contract,
  Forecast,
  Movement,
  Owner,
  OwnerReport,
  OwnerTransfer,
  Property,
  Share,
  Summary,
  Tenant,
  Unit,
} from "./apiTypes";

const configuredApiUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const isPublicHost = !["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);
const API_URL =
  isPublicHost && configuredApiUrl.includes("localhost")
    ? "/api"
    : configuredApiUrl;

function notifyMutation(method?: string) {
  if (!method || method === "GET") return;
  const messages: Record<string, string> = {
    POST: "Elemento salvato",
    PUT: "Modifiche salvate",
    DELETE: "Elemento eliminato",
  };
  notifyToast(messages[method] ?? "Operazione completata");
}

async function errorMessage(response: Response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { detail?: unknown };
    if (typeof parsed.detail === "string") return parsed.detail;
  } catch {
    return text || "Operazione non riuscita";
  }
  return text || "Operazione non riuscita";
}

export async function api<T>(
  path: string,
  token?: string | null,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const message = await errorMessage(response);
    notifyToast(message, "error");
    throw new Error(message);
  }
  notifyMutation(init?.method);
  return response.json();
}
