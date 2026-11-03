export class ClientApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[] | undefined> = {},
  ) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(url: string, init?: Omit<RequestInit, "body"> & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: init?.json === undefined ? undefined : JSON.stringify(init.json),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ClientApiError(res.status, data?.error ?? "Request failed", data?.fieldErrors);
  return data as T;
}
