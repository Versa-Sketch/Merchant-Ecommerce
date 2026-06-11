// Resolves the authenticated shop owner's shop_id, needed for /inventory/{shop_id}/… URLs.
// The API spec has no dedicated "my shop" endpoint, so we look in the places the
// backend exposes it: JWT claims first, then the onboarding status payload.

import { SHOP_ENDPOINTS } from '../../Auth/Constants/api';
import { decodeJwtPayload } from './jwt';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHOP_ID_KEYS = ['shop_id', 'shopId', 'shop_uuid', 'shop'];

function findShopId(node: unknown, depth = 0): string | null {
  if (!node || typeof node !== 'object' || depth > 4) return null;
  const obj = node as Record<string, unknown>;
  for (const key of SHOP_ID_KEYS) {
    const value = obj[key];
    if (typeof value === 'string' && UUID_RE.test(value)) return value;
    if (value && typeof value === 'object') {
      const inner = (value as Record<string, unknown>).id;
      if (typeof inner === 'string' && UUID_RE.test(inner)) return inner;
    }
  }
  for (const value of Object.values(obj)) {
    const found = findShopId(value, depth + 1);
    if (found) return found;
  }
  return null;
}

export async function resolveShopId(accessToken: string | null): Promise<string | null> {
  if (!accessToken) return null;

  const claims = decodeJwtPayload(accessToken);
  const fromToken = findShopId(claims);
  if (fromToken) return fromToken;

  try {
    const res = await fetch(SHOP_ENDPOINTS.ONBOARDING_STATUS, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as unknown;
    return findShopId(body);
  } catch {
    return null;
  }
}
