import { requireCapability } from "@ahr/auth";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { nextCookieAdapter } from "@/lib/cookies";
import { listAllSettings } from "@/lib/settings-admin";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { SettingRow } from "./setting-row";

/**
 * Implements: 06-Dashboard.md §3 — Settings Editor. Added: Phase 3 CTO
 * Audit (Admin Dashboard Verification) — platform_settings has been
 * seeded with its 12 keys since Milestone 2, and every other Dashboard
 * surface (CMS, Moderation, Activity Log) already existed or was just
 * added, but no page ever let an Administrator actually read or change a
 * setting.
 *
 * Updated: Gap Analysis & Remaining Work Report item A4 — each of the 12
 * known keys now renders a field matched to its real shape (text input,
 * toggle, dropdown, key/value list, or a fixed form) instead of a shared
 * raw-JSON textarea; see @/lib/settings-shapes.ts. Any setting not in that
 * list (e.g. one added later by migration) still falls back to raw JSON,
 * so a new setting still needs no UI change — same extensibility the
 * original design called for.
 */
export default async function SettingsPage({ params }: { params: { locale: string } }) {
  await requireCapability(nextCookieAdapter(), "settings:manage");
  const supabase = createRouteHandlerSupabaseClient();
  const settings = await listAllSettings(supabase);

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Settings" }]} />
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-neutral">
          Each setting below shows the right kind of field for its value — text, a toggle, a
          dropdown, or a list — so there&apos;s no JSON to get wrong. A setting without a matching
          field yet falls back to editing its raw stored value directly.
        </p>
        {settings.map((setting) => (
          <SettingRow
            key={setting.key}
            locale={params.locale}
            settingKey={setting.key}
            initialValue={setting.value}
            description={setting.description}
          />
        ))}
      </div>
    </div>
  );
}
