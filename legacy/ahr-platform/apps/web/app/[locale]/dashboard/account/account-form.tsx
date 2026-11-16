"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/cms";

/**
 * Implements: Decision Log item C2 — "My Account." Saves through the
 * exact same generic endpoint the Persons CMS list already uses
 * (`PATCH /api/cms/persons/{id}`) — no new backend code was needed, only
 * a friendlier, personal-feeling form around an already-working write
 * path. Photo upload reuses the existing Media Library upload flow
 * (`/dashboard/media/upload`) rather than duplicating it here — a person
 * can already be picked as the owner there.
 */
export function AccountForm({
  locale,
  person,
  photoUrl,
}: {
  locale: string;
  person: Record<string, unknown>;
  photoUrl: string | null;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [nameAr, setNameAr] = useState(String(person.name_ar ?? ""));
  const [nameEn, setNameEn] = useState(String(person.name_en ?? ""));
  const [bioAr, setBioAr] = useState(String(person.bio_ar ?? ""));
  const [bioEn, setBioEn] = useState(String(person.bio_en ?? ""));

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/cms/persons/${person.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_ar: nameAr || null,
          name_en: nameEn || null,
          bio_ar: bioAr || null,
          bio_en: bioEn || null,
        }),
      });
      const json = await response.json();
      if (json.error) {
        toast.show("error", json.error.message ?? "Could not save.");
        return;
      }
      toast.show("success", "Account saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt=""
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border text-xs text-neutral">
            No photo
          </div>
        )}
        <Link
          href={`/${locale}/dashboard/media/upload`}
          className="text-sm text-primary underline"
        >
          Upload a new photo →
        </Link>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral" htmlFor="account-name-en">
          Display name (English)
        </label>
        <input
          id="account-name-en"
          type="text"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-full rounded-md border p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral" htmlFor="account-name-ar">
          Display name (Arabic)
        </label>
        <input
          id="account-name-ar"
          type="text"
          dir="rtl"
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          className="w-full rounded-md border p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral" htmlFor="account-bio-en">
          Biography (English)
        </label>
        <textarea
          id="account-bio-en"
          value={bioEn}
          onChange={(e) => setBioEn(e.target.value)}
          rows={5}
          className="w-full rounded-md border p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral" htmlFor="account-bio-ar">
          Biography (Arabic)
        </label>
        <textarea
          id="account-bio-ar"
          dir="rtl"
          value={bioAr}
          onChange={(e) => setBioAr(e.target.value)}
          rows={5}
          className="w-full rounded-md border p-2 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
