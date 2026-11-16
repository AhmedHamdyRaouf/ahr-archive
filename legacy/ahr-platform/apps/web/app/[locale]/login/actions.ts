"use server";

import { redirect } from "next/navigation";
import * as auth from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";

export interface FormActionState {
  error: string | null;
}

/** Implements: UI/UX Specification, Authentication UI (06), "Sign In" flow. */
export async function signInAction(
  locale: string,
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await auth.signIn(nextCookieAdapter(), { email, password });

  if (result.error) {
    return { error: result.error.message };
  }

  redirect(`/${locale}/dashboard`);
}

/** Implements: UI/UX Specification, Authentication UI (06), "Forgot Password" flow. */
export async function requestPasswordResetAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const email = String(formData.get("email") ?? "");
  const result = await auth.requestPasswordReset(nextCookieAdapter(), { email });

  // Always the same outcome shown to the user, per Packages Specification
  // Package 01 §15 — no error is ever returned here for "email not found."
  if (result.error) {
    return { error: "Something went wrong. Please try again." };
  }
  return { error: null };
}

/** Implements: UI/UX Specification, Authentication UI (06), "Logout" flow. */
export async function signOutAction(locale: string): Promise<void> {
  await auth.signOut(nextCookieAdapter());
  redirect(`/${locale}/login`);
}
