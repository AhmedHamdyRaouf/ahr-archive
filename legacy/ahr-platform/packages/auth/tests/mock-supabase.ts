/**
 * A minimal mock of the subset of the Supabase client surface this
 * package's own code actually calls (`auth.getUser`, `auth.signOut`,
 * `auth.signInWithPassword`, `auth.resetPasswordForEmail`,
 * `auth.updateUser`, `from(...).select().eq().maybeSingle()`,
 * `from(...).insert(...)`). Not a full Supabase type — just enough surface
 * to test packages/auth's own logic without a live project (Build Manifest
 * item B4 — Supabase project not yet provisioned).
 */
import { vi } from "vitest";

export interface MockPlatformUserRow {
  id: string;
  person_id: string;
  role: string;
}

export function createMockSupabase(
  options: {
    authUser?: { id: string } | null;
    authError?: { message: string } | null;
    platformUserRow?: MockPlatformUserRow | null;
    platformUserError?: { message: string } | null;
    signInError?: { message: string } | null;
  } = {},
) {
  const insertedRows: Array<{ table: string; row: Record<string, unknown> }> = [];

  const maybeSingle = vi.fn().mockResolvedValue({
    data: options.platformUserRow ?? null,
    error: options.platformUserError ?? null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });

  const insert = vi.fn().mockImplementation((row: Record<string, unknown>) => {
    insertedRows.push({ table: "activity_log", row });
    return Promise.resolve({ data: null, error: null });
  });

  const from = vi.fn().mockReturnValue({ select, insert });

  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: options.authUser ?? null },
      error: options.authError ?? null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: options.signInError ? null : (options.authUser ?? { id: "auth-user-1" }) },
      error: options.signInError ?? null,
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
  };

  return { auth, from, __insertedRows: insertedRows } as any;
}
