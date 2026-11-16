"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { requestPasswordResetAction, type FormActionState } from "../actions";

const initialState: FormActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-md bg-primary p-2">
      {pending ? "…" : "Send Reset Link"}
    </button>
  );
}

/**
 * Implements: UI/UX Specification, Authentication UI (06) — Password Reset
 * Request screen. Always shows the same confirmation regardless of whether
 * the email exists (Packages Specification Package 01 §15/§19).
 */
export default function ResetRequestPage({ params }: { params: { locale: string } }) {
  const [state, formAction] = useFormState(requestPasswordResetAction, initialState);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form
        action={async (formData) => {
          await formAction(formData);
          setSubmitted(true);
        }}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-center text-xl font-semibold">Reset your password</h1>

        {submitted ? (
          <p className="text-sm">
            If an account exists for that email, a reset link has been sent.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="block text-sm">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border p-2"
              />
            </div>

            {state.error ? (
              <p role="alert" className="text-sm text-danger">
                {state.error}
              </p>
            ) : null}

            <SubmitButton />
          </>
        )}

        <p className="text-center text-sm">
          <Link href={`/${params.locale}/login`}>Back to sign in</Link>
        </p>
      </form>
    </main>
  );
}
