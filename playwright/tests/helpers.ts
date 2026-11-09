import { APIRequestContext, expect } from '@playwright/test';

export const USERS = {
  admin: { username: 'admin', password: 'Admin#2026' },
  clerk: { username: 'clerk1', password: 'Clerk#2026' },
  auditor: { username: 'auditor1', password: 'Audit#2026' },
  ana: { username: 'ana', password: 'Ana#2026' },
  ben: { username: 'ben', password: 'Ben#2026' },
} as const;

export async function login(request: APIRequestContext, who: keyof typeof USERS): Promise<string> {
  const res = await request.post('/auth/login', { data: USERS[who] });
  expect(res.status()).toBe(200);
  return (await res.json()).token;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

/** Restore the seed data. Call it in beforeEach so tests do not depend on each other. */
export async function resetData(request: APIRequestContext) {
  const res = await request.post('/test/reset');
  expect(res.status()).toBe(200);
}
