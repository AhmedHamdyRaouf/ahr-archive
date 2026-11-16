"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/cms";
import { updateSettingAction } from "./actions";
import { getSettingShape, type FixedObjectField } from "@/lib/settings-shapes";

/**
 * Implements: Gap Analysis & Remaining Work Report item A4. Renders one
 * `platform_settings` row using a widget matched to that key's real shape
 * (see @/lib/settings-shapes.ts) instead of a single raw-JSON textarea.
 * Unknown keys (any setting introduced later by migration, not one of the
 * 12 named in Database Architecture §2.3) still get the original raw-JSON
 * editor — this preserves the "a new setting needs no UI change" property
 * platform_settings.sql was designed around, while giving the 12 known
 * keys a real, mistake-resistant form.
 *
 * Every widget below still ends in the same place: a JS value that gets
 * `JSON.stringify`-ed once, at Save time, and handed to the exact same
 * `updateSettingAction` (still parses + validates server-side) — so the
 * server contract from the original raw-JSON version is unchanged.
 */

type KeyValuePair = { key: string; value: string };

function toKeyValuePairs(value: unknown): KeyValuePair[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).map(([key, v]) => ({
      key,
      value: typeof v === "string" ? v : JSON.stringify(v),
    }));
  }
  return [];
}

function fromKeyValuePairs(pairs: KeyValuePair[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const { key, value } of pairs) {
    if (!key.trim()) continue;
    // Only "true"/"false" are coerced (for feature_flags). Everything else
    // stays a string — critically, this must NOT auto-convert
    // numeric-looking strings to numbers, since values like a phone number
    // ("01114004738") would silently lose their leading zero if treated as
    // a JS number.
    if (value === "true") result[key] = true;
    else if (value === "false") result[key] = false;
    else result[key] = value;
  }
  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function SettingRow({
  locale,
  settingKey,
  initialValue,
  description,
}: {
  locale: string;
  settingKey: string;
  initialValue: unknown;
  description: string | null;
}) {
  const { show } = useToast();
  const shape = getSettingShape(settingKey);
  const [saving, setSaving] = useState(false);

  const [rawValue, setRawValue] = useState(() => JSON.stringify(initialValue, null, 2));

  const [textValue, setTextValue] = useState(() =>
    typeof initialValue === "string" ? initialValue : "",
  );
  const [boolValue, setBoolValue] = useState(() => initialValue === true);
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => toKeyValuePairs(initialValue));
  const [fixedValues, setFixedValues] = useState<Record<string, string>>(() =>
    isPlainObject(initialValue)
      ? Object.fromEntries(
          Object.entries(initialValue).map(([k, v]) => [k, typeof v === "string" ? v : String(v)]),
        )
      : {},
  );

  const shapeMismatch = useMemo(() => {
    if (!shape) return false;
    if (shape.kind === "keyvalue" || shape.kind === "fixed-object") {
      return initialValue !== undefined && initialValue !== null && !isPlainObject(initialValue);
    }
    if (shape.kind === "text" || shape.kind === "textarea" || shape.kind === "select") {
      return initialValue !== undefined && initialValue !== null && typeof initialValue !== "string";
    }
    if (shape.kind === "boolean") {
      return initialValue !== undefined && initialValue !== null && typeof initialValue !== "boolean";
    }
    return false;
  }, [shape, initialValue]);

  const useTypedForm = Boolean(shape) && !shapeMismatch;

  async function handleSave() {
    setSaving(true);
    try {
      let valueToSend: string;

      if (!shape || !useTypedForm) {
        valueToSend = rawValue;
      } else {
        switch (shape.kind) {
          case "text":
          case "textarea":
          case "select":
            valueToSend = JSON.stringify(textValue);
            break;
          case "boolean":
            valueToSend = JSON.stringify(boolValue);
            break;
          case "keyvalue":
            valueToSend = JSON.stringify(fromKeyValuePairs(pairs));
            break;
          case "fixed-object":
            valueToSend = JSON.stringify(fixedValues);
            break;
          default:
            valueToSend = rawValue;
        }
      }

      const result = await updateSettingAction(locale, settingKey, valueToSend);
      if (result.error) {
        show("error", result.error);
        return;
      }
      show("success", `"${settingKey}" saved.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-md border p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold">{settingKey}</h3>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-primary px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {description ? <p className="mb-2 text-xs text-neutral">{description}</p> : null}
      {shape?.helpText ? <p className="mb-2 text-xs text-neutral">{shape.helpText}</p> : null}

      {shapeMismatch ? (
        <p role="alert" className="mb-2 text-xs text-danger">
          Stored value doesn&apos;t match this setting&apos;s expected shape — showing raw JSON so
          nothing is silently changed. Fix it here, or ask an engineer to check it.
        </p>
      ) : null}

      {!shape || shapeMismatch ? (
        <textarea
          value={rawValue}
          onChange={(event) => setRawValue(event.target.value)}
          rows={4}
          className="w-full rounded-md border p-2 font-mono text-xs"
          aria-label={`Value for ${settingKey}`}
        />
      ) : shape.kind === "text" ? (
        <input
          type="text"
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          className="w-full rounded-md border p-2 text-sm"
          aria-label={shape.label}
        />
      ) : shape.kind === "textarea" ? (
        <textarea
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          rows={3}
          className="w-full rounded-md border p-2 text-sm"
          aria-label={shape.label}
        />
      ) : shape.kind === "select" ? (
        <select
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          className="w-full rounded-md border p-2 text-sm"
          aria-label={shape.label}
        >
          {(shape.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : shape.kind === "boolean" ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={boolValue}
            onChange={(event) => setBoolValue(event.target.checked)}
            aria-label={shape.label}
          />
          {boolValue ? "On" : "Off"}
        </label>
      ) : shape.kind === "keyvalue" ? (
        <KeyValueEditor pairs={pairs} onChange={setPairs} suggestedKeys={shape.suggestedKeys} />
      ) : shape.kind === "fixed-object" ? (
        <FixedObjectEditor
          fields={shape.fields ?? []}
          values={fixedValues}
          onChange={setFixedValues}
        />
      ) : null}
    </div>
  );
}

function KeyValueEditor({
  pairs,
  onChange,
  suggestedKeys,
}: {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  suggestedKeys?: string[];
}) {
  function update(index: number, field: "key" | "value", newValue: string) {
    const next = pairs.slice();
    const current = next[index];
    if (!current) return;
    next[index] = field === "key" ? { ...current, key: newValue } : { ...current, value: newValue };
    onChange(next);
  }

  function remove(index: number) {
    onChange(pairs.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...pairs, { key: "", value: "" }]);
  }

  return (
    <div className="space-y-2">
      {pairs.length === 0 ? (
        <p className="text-xs text-neutral">
          No entries yet.
          {suggestedKeys?.length ? ` Common keys here: ${suggestedKeys.join(", ")}.` : ""}
        </p>
      ) : null}
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={pair.key}
            onChange={(event) => update(index, "key", event.target.value)}
            placeholder={suggestedKeys?.[index] ?? "key"}
            className="w-1/3 rounded-md border p-2 text-sm"
            aria-label={`Key ${index + 1}`}
          />
          <input
            type="text"
            value={pair.value}
            onChange={(event) => update(index, "value", event.target.value)}
            placeholder="value"
            className="flex-1 rounded-md border p-2 text-sm"
            aria-label={`Value ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-md border px-2 py-1 text-xs text-danger"
            aria-label={`Remove row ${index + 1}`}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="rounded-md border px-3 py-1 text-xs">
        + Add row
      </button>
    </div>
  );
}

function FixedObjectEditor({
  fields,
  values,
  onChange,
}: {
  fields: FixedObjectField[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  function update(name: string, value: string) {
    onChange({ ...values, [name]: value });
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="mb-1 block text-xs font-medium text-neutral" htmlFor={field.name}>
            {field.label}
            {field.required ? " *" : ""}
          </label>
          {field.kind === "textarea" ? (
            <textarea
              id={field.name}
              value={values[field.name] ?? ""}
              onChange={(event) => update(field.name, event.target.value)}
              placeholder={field.placeholder}
              rows={2}
              className="w-full rounded-md border p-2 text-sm"
            />
          ) : field.kind === "color" ? (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(values[field.name] ?? "") ? values[field.name] : "#c7a86b"
                }
                onChange={(event) => update(field.name, event.target.value)}
                className="h-9 w-12 rounded-md border p-0.5"
                aria-label={`${field.label} picker`}
              />
              <input
                type="text"
                value={values[field.name] ?? ""}
                onChange={(event) => update(field.name, event.target.value)}
                placeholder={field.placeholder}
                className="flex-1 rounded-md border p-2 text-sm"
                aria-label={field.label}
              />
            </div>
          ) : (
            <input
              type="text"
              id={field.name}
              value={values[field.name] ?? ""}
              onChange={(event) => update(field.name, event.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-md border p-2 text-sm"
            />
          )}
          {field.helpText ? <p className="mt-1 text-xs text-neutral">{field.helpText}</p> : null}
        </div>
      ))}
    </div>
  );
}
