"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signInAction, type FormActionState } from "./actions";

const initialState: FormActionState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full rounded-md bg-primary p-2">
      {pending ? "…" : label}
    </button>
  );
}

/**
 * Implements: UI/UX Specification, Authentication UI (06) — Sign In screen.
 * Centered, single-column, minimal chrome (§8 Wireframe Description): this
 * screen belongs to neither the public Website nor the Dashboard register.
 */
export default function LoginPage({ params }: { params: { locale: string } }) {
  const boundAction = signInAction.bind(null, params.locale);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-xl font-semibold">AHR Platform</h1>

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

        <div>
          <label htmlFor="password" className="block text-sm">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border p-2"
          />
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        ) : null}

        <SubmitButton label="Sign In" />

        <p className="text-center text-sm">
          <Link href={`/${params.locale}/login/reset`}>Forgot password?</Link>
        </p>
      </form>
    </main>
  );
}
