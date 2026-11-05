export class ClientApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[] | undefined> = {},
  ) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(
  url: string,
  init?: Omit<RequestInit, "body"> & { body?: BodyInit; json?: unknown },
): Promise<T> {
  const { json, body, ...requestInit } = init ?? {};
  const headers = new Headers(requestInit.headers);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, {
    ...requestInit,
    headers,
    body: json === undefined ? body : JSON.stringify(json),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ClientApiError(res.status, data?.error ?? "Request failed", data?.fieldErrors);
  return data as T;
}
