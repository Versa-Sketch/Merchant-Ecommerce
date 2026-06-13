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

// Standard DRF-style pagination envelope nested inside `data`.
export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

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

async function performRequest(
  url: string,
  { method = 'GET', token, body }: RequestOptions = {},
): Promise<{ res: Response; parsed: Record<string, unknown> | null } | ApiErr> {
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
    return { res, parsed };
  }

  const message =
    (parsed?.message as string) ??
    (parsed?.detail as string) ??
    (res.status >= 500
      ? 'Server error. Please try again later.'
      : 'Something went wrong. Please try again.');

  return { ok: false, status: res.status, message };
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const result = await performRequest(url, options);
  if ('ok' in result) return result;

  const { res, parsed } = result;
  return {
    ok: true,
    status: res.status,
    data: (parsed?.data ?? null) as T,
    message: (parsed?.message as string) ?? null,
  };
}

// For endpoints using the backend's list pagination envelope:
// `{ status, count, page, page_size, total_pages, data: [...] }`
// (pagination fields are siblings of `data`, and `data` is the results array itself).
export async function apiRequestPaginated<T>(
  url: string,
  options: RequestOptions = {},
): Promise<ApiResult<PaginatedResult<T>>> {
  const result = await performRequest(url, options);
  if ('ok' in result) return result;

  const { res, parsed } = result;
  const results = (parsed?.data ?? []) as T[];
  const page = (parsed?.page as number) ?? 1;
  const totalPages = (parsed?.total_pages as number) ?? 1;
  const count = (parsed?.count as number) ?? results.length;

  return {
    ok: true,
    status: res.status,
    data: {
      count,
      next: page < totalPages ? String(page + 1) : null,
      previous: page > 1 ? String(page - 1) : null,
      results,
    },
    message: (parsed?.message as string) ?? null,
  };
}

export function buildQuery(params: Record<string, string | boolean | undefined | null>): string {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}
