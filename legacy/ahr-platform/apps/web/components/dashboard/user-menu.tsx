"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/[locale]/login/actions";

/**
 * Implements: UI/UX Specification, Dashboard UI (12) — "Account ▾ (Sign out)"
 * in the Top Bar.
 *
 * Updated 2026-07-21: added a "My Account" link (Decision Log item C2 —
 * confirmed in scope for v1.0) — previously the only way to change one's
 * own display name/bio was through the generic Persons CMS list, with no
 * dedicated, personal-feeling entry point.
 */
export function UserMenu({ locale, personId }: { locale: string; personId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Account ▾
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-md border bg-white p-2 shadow-md"
        >
          <p className="px-2 py-1 text-xs text-neutral">{personId}</p>
          <Link href={`/${locale}/dashboard/account`} className="block w-full rounded-md p-2 text-left">
            My Account
          </Link>
          <form action={signOutAction.bind(null, locale)}>
            <button type="submit" className="w-full rounded-md p-2 text-left">
              Sign Out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
