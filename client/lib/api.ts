const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  { method = "GET", body, token }: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}). Please try again.`);
    }
    throw new Error("Unexpected response from server.");
  }

  if (!res.ok) {
    const msg = (data && typeof data === "object" && "message" in data)
      ? (data as { message: string }).message
      : "Something went wrong";
    throw new Error(msg);
  }

  return data as T;
}

// Raw request that returns response data without throwing on non-ok status
export async function apiRequestRaw<T = unknown>(
  endpoint: string,
  { method = "GET", body, token }: ApiOptions = {}
): Promise<T & { _status: number }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = { message: `Request failed (${res.status})` };
  }

  return { ...(data as object), _status: res.status } as T & { _status: number };
}
