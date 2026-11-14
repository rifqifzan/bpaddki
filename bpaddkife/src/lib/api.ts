import type { Paginated } from "./types";

export class ApiError extends Error {
  status: number;
  details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(
  params: Record<string, QueryValue>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}`, {
      ...init,
      signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Tidak dapat menghubungi server. Pastikan backend sedang berjalan.",
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    let message = "Terjadi kesalahan pada server.";
    let details: string[] = [];

    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      if (Array.isArray(record.message)) {
        message = record.message.join(", ");
      } else if (typeof record.message === "string") {
        message = record.message;
      }
      if (Array.isArray(record.details)) {
        details = record.details.filter(
          (item): item is string => typeof item === "string",
        );
      }
      if (message === "Validasi gagal." && details.length > 0) {
        message = details[0];
      }
    } else if (typeof body === "string" && body.trim()) {
      message = body;
    }

    throw new ApiError(message, response.status, details);
  }

  return body as T;
}

export const api = {
  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return request<T>(path, { method: "GET" }, signal);
  },
  list<T>(
    path: string,
    params: Record<string, QueryValue> = {},
    signal?: AbortSignal,
  ): Promise<Paginated<T>> {
    return request<Paginated<T>>(
      `${path}${buildQuery(params)}`,
      { method: "GET" },
      signal,
    );
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  delete(path: string): Promise<void> {
    return request<void>(path, { method: "DELETE" });
  },
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.details.length > 0 && error.message === "Validasi gagal.") {
      return error.details.join(" ");
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan yang tidak diketahui.";
}

export function errorDetails(error: unknown): string[] {
  return error instanceof ApiError ? error.details : [];
}
