// Shared HTTP helper for the backend's `{ status, message, data }` envelope.

export interface ApiOk<T> {
  ok: true;
  status: number;
  data: T;
  message: string | null;
}

export interface ApiErr {
  ok: false;
  status: number; // 0 = network failure
  message: string;
}

export type ApiResult<T> = ApiOk<T> | ApiErr;

export const NETWORK_ERROR_MESSAGE =
  'Unable to connect. Please check your internet connection and try again.';

async function parseJSON(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
}

export async function apiRequest<T>(
  url: string,
  { method = 'GET', token, body }: RequestOptions = {},
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    return { ok: false, status: 0, message: NETWORK_ERROR_MESSAGE };
  }

  const parsed = await parseJSON(res);

  if (res.ok) {
    return {
      ok: true,
      status: res.status,
      data: (parsed?.data ?? null) as T,
      message: (parsed?.message as string) ?? null,
    };
  }

  const message =
    (parsed?.message as string) ??
    (parsed?.detail as string) ??
    (res.status >= 500
      ? 'Server error. Please try again later.'
      : 'Something went wrong. Please try again.');

  return { ok: false, status: res.status, message };
}

export function buildQuery(params: Record<string, string | boolean | undefined | null>): string {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}
