"use client";

import { useEffect, useState } from "react";

/**
 * Implements: Wireframes/Media-Library.md ("Owner selection happens
 * before or alongside file selection, never as an afterthought — prevents
 * orphaned, unowned uploads") and MEDIA_OWNER_TYPES (@ahr/media) —
 * person | work | project | event.
 *
 * Reuses the existing, already-tested `/api/search/cms` endpoint (API
 * Specification 10 — CMS Search (Admin)) rather than inventing a new
 * lookup endpoint: this is exactly the "search within one entity type"
 * contract that endpoint already provides, just consumed from a new
 * client instead of a list-view search box.
 */

const OWNER_TYPE_OPTIONS: Array<{ value: OwnerType; label: string; searchEntityType: string }> = [
  { value: "person", label: "Person", searchEntityType: "persons" },
  { value: "work", label: "Work", searchEntityType: "works" },
  { value: "project", label: "Project", searchEntityType: "projects" },
  { value: "event", label: "Event", searchEntityType: "events" },
];

export type OwnerType = "person" | "work" | "project" | "event";

export interface OwnerSelection {
  ownerType: OwnerType;
  ownerId: string;
  label: string;
}

interface SearchResultItem {
  id: string;
  titleAr: string;
  titleEn: string;
  status: string;
}

export function OwnerPicker({
  value,
  onChange,
}: {
  value: OwnerSelection | null;
  onChange: (selection: OwnerSelection | null) => void;
}) {
  const [ownerType, setOwnerType] = useState<OwnerType>(value?.ownerType ?? "person");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const searchEntityType = OWNER_TYPE_OPTIONS.find(
      (o) => o.value === ownerType,
    )!.searchEntityType;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const handle = setTimeout(() => {
      fetch(`/api/search/cms?entityType=${searchEntityType}&q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((body) => {
          if (cancelled) return;
          if (body.error) {
            setError(body.error.message ?? "Could not search right now.");
            setResults([]);
          } else {
            setResults(body.data ?? []);
          }
        })
        .catch(() => {
          if (!cancelled) setError("Could not search right now.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, ownerType]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Owner</label>
      <div className="flex gap-2">
        <select
          value={ownerType}
          onChange={(e) => {
            setOwnerType(e.target.value as OwnerType);
            setQuery("");
            setResults([]);
            onChange(null);
          }}
          className="rounded-md border p-2 text-sm"
        >
          {OWNER_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={value ? value.label : query}
          onChange={(e) => {
            onChange(null);
            setQuery(e.target.value);
          }}
          placeholder={`Search ${OWNER_TYPE_OPTIONS.find((o) => o.value === ownerType)!.label.toLowerCase()}s by name…`}
          className="w-full rounded-md border p-2 text-sm"
        />
      </div>

      {loading ? <p className="text-xs text-neutral">Searching…</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}

      {!value && results.length > 0 ? (
        <ul className="max-h-48 divide-y overflow-y-auto rounded-md border">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onChange({ ownerType, ownerId: item.id, label: item.titleEn || item.titleAr });
                  setResults([]);
                  setQuery("");
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral/10"
              >
                {item.titleEn || item.titleAr}{" "}
                <span className="text-xs text-neutral">({item.status})</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!value && query.trim().length >= 2 && !loading && results.length === 0 && !error ? (
        <p className="text-xs text-neutral">No matching {ownerType} found.</p>
      ) : null}

      {value ? (
        <p className="text-sm">
          Selected: <span className="font-medium">{value.label}</span>{" "}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-primary underline"
          >
            Change
          </button>
        </p>
      ) : null}
    </div>
  );
}
