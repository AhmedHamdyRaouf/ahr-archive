/**
 * Implements: Gap Analysis & Remaining Work Report, item A4 — "Field-
 * structured Settings editor... typed forms matching each of the 12
 * `platform_settings` keys' actual shape." Replaces the raw-JSON-per-key
 * editor (still available as a fallback — see below) with a widget
 * matching each key's real, already-in-use shape:
 *   - `email_configuration` mirrors `@ahr/notifications`'
 *     `EmailConfiguration` interface exactly (packages/notifications/src/
 *     email-config.ts) — the only key with a strict parser elsewhere in
 *     the codebase.
 *   - `contact_information` / `social_media_links` / `seo_defaults` /
 *     `feature_flags` stay open-ended key-value records — `@ahr/site`'s
 *     `site-settings.ts` and the Database Architecture both treat these as
 *     `Record<string, unknown>`, not a fixed field set, specifically so an
 *     Administrator can add a new social platform or feature flag without
 *     a migration. A typed form for these is a key/value list editor, not
 *     a fixed set of named inputs.
 *   - `branding_assets` gets real fields now that Open Decision B10 is
 *     ratified (see docs/Program-Status/Decision-Log.md, 2026-07-21) —
 *     logo URL and the ratified color/font tokens.
 *   - `ai_configuration` has no shape anywhere in the codebase yet
 *     (packages/ai reads `OPENAI_API_KEY`/`OPENAI_MODEL` from the server
 *     environment directly, never from this setting) — kept as an
 *     open-ended key/value editor with a note, not invented fields.
 *
 * Any key NOT listed in `SETTING_SHAPES` (i.e. a future setting added by
 * migration, per platform_settings.sql's own extensibility rationale)
 * falls back to the original raw-JSON textarea — this preserves the "new
 * setting needs no UI change" property the original design called for,
 * while giving the 12 known keys a real form.
 */

export type SettingFieldKind =
  | "text"
  | "textarea"
  | "boolean"
  | "select"
  | "keyvalue"
  | "fixed-object";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FixedObjectField {
  name: string;
  label: string;
  kind: "text" | "textarea" | "color";
  placeholder?: string;
  helpText?: string;
  required?: boolean;
}

export interface SettingShape {
  kind: SettingFieldKind;
  label: string;
  helpText?: string;
  /** Only for kind: "select" */
  options?: SelectOption[];
  /** Only for kind: "fixed-object" */
  fields?: FixedObjectField[];
  /** Only for kind: "keyvalue" — suggested keys shown as placeholders, not enforced */
  suggestedKeys?: string[];
}

export const SETTING_SHAPES: Record<string, SettingShape> = {
  site_name: {
    kind: "text",
    label: "Site name",
    helpText: "Shown in the browser tab, page headers, and email footers.",
  },
  site_description: {
    kind: "textarea",
    label: "Site description",
    helpText: "Used as the default meta description where a page has none of its own.",
  },
  default_language: {
    kind: "select",
    label: "Default language",
    helpText: "Locale shown to a visitor with no stored language preference.",
    options: [
      { value: "ar", label: "Arabic (ar)" },
      { value: "en", label: "English (en)" },
    ],
  },
  default_time_zone: {
    kind: "text",
    label: "Default time zone",
    helpText: "An IANA time zone name (e.g. Africa/Cairo, Asia/Dubai, Europe/London).",
  },
  maintenance_mode: {
    kind: "boolean",
    label: "Maintenance mode",
    helpText: "When on, the public site shows a maintenance message instead of normal pages.",
  },
  contact_information: {
    kind: "keyvalue",
    label: "Contact information",
    helpText: "Public contact details. Add as many fields as needed (email, phone, address…).",
    suggestedKeys: ["email", "phone", "address"],
  },
  social_media_links: {
    kind: "keyvalue",
    label: "Social media links",
    helpText: "One row per platform. The key is the platform name, the value is the profile URL.",
    suggestedKeys: ["facebook", "instagram", "youtube", "spotify", "soundcloud"],
  },
  seo_defaults: {
    kind: "keyvalue",
    label: "SEO defaults",
    helpText: "Default meta values for pages that don't set their own.",
    suggestedKeys: ["title", "description"],
  },
  feature_flags: {
    kind: "keyvalue",
    label: "Feature flags",
    helpText: "One row per flag name. Each value is on/off — type true or false.",
  },
  branding_assets: {
    kind: "fixed-object",
    label: "Branding assets",
    helpText:
      "Ratified 2026-07-21 to mirror ahmedhamdyraouf.com — see docs/Program-Status/Decision-Log.md. No standalone logo file exists yet; logoUrl can stay empty until one is supplied.",
    fields: [
      { name: "logoUrl", label: "Logo URL", kind: "text", placeholder: "https://…" },
      {
        name: "primaryColor",
        label: "Primary color",
        kind: "color",
        placeholder: "#c7a86b",
        helpText: "Ratified brand gold.",
      },
      {
        name: "primaryColorHover",
        label: "Primary color (hover)",
        kind: "color",
        placeholder: "#d6b57a",
      },
      {
        name: "fontDisplay",
        label: "Display font family",
        kind: "text",
        placeholder: "Playfair Display, serif",
      },
      {
        name: "fontBody",
        label: "Body font family",
        kind: "text",
        placeholder: "Readex Pro, sans-serif",
      },
    ],
  },
  email_configuration: {
    kind: "fixed-object",
    label: "Email configuration",
    helpText:
      "Matches @ahr/notifications' EmailConfiguration exactly. The API key itself is never stored here — only the name of the server environment variable that holds it.",
    fields: [
      {
        name: "endpoint",
        label: "Provider endpoint",
        kind: "text",
        placeholder: "https://api.resend.com/emails",
        required: true,
      },
      {
        name: "apiKeyEnvVar",
        label: "API key environment variable name",
        kind: "text",
        placeholder: "RESEND_API_KEY",
        helpText: "The name of the variable, not the key's actual value.",
        required: true,
      },
      {
        name: "fromAddress",
        label: "From address",
        kind: "text",
        placeholder: "no-reply@ahmedhamdyraouf.com",
        required: true,
      },
      { name: "fromName", label: "From name", kind: "text", placeholder: "AHR Platform" },
    ],
  },
  ai_configuration: {
    kind: "keyvalue",
    label: "AI configuration",
    helpText:
      "Not yet read by @ahr/ai (which currently takes OPENAI_API_KEY/OPENAI_MODEL from the server environment, not from this setting) — reserved for future use. Free-form until a real shape is adopted in code.",
  },
};

export function getSettingShape(key: string): SettingShape | undefined {
  return SETTING_SHAPES[key];
}
