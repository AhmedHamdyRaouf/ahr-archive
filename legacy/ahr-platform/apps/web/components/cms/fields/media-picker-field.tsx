"use client";

import { useEffect, useState } from "react";
import type { MediaPickerAdapter } from "@ahr/cms-core";
import { RawIdMediaPickerAdapter } from "@ahr/cms-core";

/**
 * Implements: Milestone 4 — "Media Picker abstraction (without
 * implementing Media Library package)." Renders a raw media_asset id input
 * by default (RawIdMediaPickerAdapter) — a future Media Library package
 * supplies a real browsing/upload adapter via the `adapter` prop, without
 * this component's calling code changing.
 */
export function MediaPickerField({
  name,
  label,
  defaultValue,
  adapter = new RawIdMediaPickerAdapter(),
}: {
  name: string;
  label: string;
  defaultValue?: string;
  adapter?: MediaPickerAdapter;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setDescription(null);
      return;
    }
    let cancelled = false;
    adapter.describeSelection({ mediaAssetId: value }).then((result) => {
      if (!cancelled) setDescription(result.label);
    });
    return () => {
      cancelled = true;
    };
  }, [value, adapter]);

  return (
    <div>
      <label htmlFor={name} className="block text-sm">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="media_asset id"
        className="w-full rounded-md border p-2"
      />
      {description ? <p className="text-sm text-neutral">Selected: {description}</p> : null}
    </div>
  );
}
