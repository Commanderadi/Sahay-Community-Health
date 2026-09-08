// Decode a JWT payload without verifying the signature (client-side only —
// the server is the source of truth). Returns null on any malformed input.
export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Milliseconds until the token expires. Negative or 0 means already expired.
// Returns Infinity when the token carries no `exp` claim.
export function msUntilExpiry(token) {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return Infinity;
  return payload.exp * 1000 - Date.now();
}

export function isExpired(token) {
  return msUntilExpiry(token) <= 0;
}
