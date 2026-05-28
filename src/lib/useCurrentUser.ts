import { useEffect, useState } from 'react';
import { TS_HOST } from './thoughtspot';

export interface CurrentUser {
  displayName: string;
  userName: string;
  initials: string;
  email?: string;
}

function deriveInitials(displayName: string, userName: string): string {
  const source = (displayName || userName || '').trim();
  if (!source) return '—';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

async function fetchFromV2(): Promise<CurrentUser | null> {
  const res = await fetch(`${TS_HOST}/api/rest/2.0/auth/session/user`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const displayName = data.display_name || data.displayName || data.name || data.user_name || '';
  const userName = data.user_name || data.userName || data.name || '';
  return {
    displayName: displayName || userName,
    userName,
    initials: deriveInitials(displayName, userName),
    email: data.email,
  };
}

async function fetchFromV1(): Promise<CurrentUser | null> {
  const res = await fetch(`${TS_HOST}/callosum/v1/session/info`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const userInfo = data.userInfo || data.user || data;
  const displayName = userInfo.displayName || userInfo.userDisplayName || userInfo.name || '';
  const userName = userInfo.userName || userInfo.name || '';
  return {
    displayName: displayName || userName,
    userName,
    initials: deriveInitials(displayName, userName),
    email: userInfo.mail || userInfo.email,
  };
}

export function useCurrentUser(): { user: CurrentUser | null; loading: boolean } {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let result = await fetchFromV2().catch(() => null);
        if (!result) result = await fetchFromV1().catch(() => null);
        if (!cancelled) {
          setUser(result);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { user, loading };
}
