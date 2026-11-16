import Link from "next/link";

/**
 * Implements: UI/UX Specification, Navigation (03) — Dashboard primary
 * navigation. AI (Package 06) and Notifications (Package 10) have no
 * standalone entry here, per that document — AI is embedded in CMS forms;
 * Notifications is the ModerationBadge in the Top Bar, not a nav item.
 *
 * CMS_ENTITY_ITEMS added in Milestone 5 — one link per entity registered
 * in @ahr/content's ENTITY_DEFINITIONS (definitions/index.ts), so this
 * list stays in sync with that registry rather than drifting independently.
 */
const NAV_ITEMS = [
  { label: "Media Library", href: "media" },
  // Deliberately a distinct nav item/label from "Media Library" above
  // (media_asset, entity-owned) — this is the new, separate, ownerless
  // media_library table (@ahr/media-library). See that package's README
  // for why these are two different systems, not a rename.
  { label: "Asset Library", href: "asset-library" },
  { label: "Completeness", href: "completeness" },
  { label: "Moderation Queue", href: "moderation" },
  { label: "Activity Log", href: "activity" },
  { label: "Settings", href: "settings" },
] as const;

const CMS_ENTITY_ITEMS = [
  { label: "People", href: "persons" },
  // Fixed Phase 3 CTO Audit: "Contacts & Organizations" previously linked
  // to /dashboard/contacts, a page that never existed. "organizations" is
  // already a registered entityType in @ahr/content's ENTITY_DEFINITIONS,
  // so the existing generic /dashboard/cms/[entityType] route already
  // handles it correctly with zero new code -- this was a broken link,
  // not a missing feature.
  { label: "Organizations", href: "organizations" },
  { label: "Works", href: "works" },
  { label: "Projects", href: "projects" },
  { label: "Events", href: "events" },
  { label: "Awards", href: "awards" },
  { label: "Categories", href: "categories" },
  { label: "Tags", href: "tags" },
  { label: "Press Mentions", href: "press-mentions" },
  { label: "Contributions", href: "contributions" },
  { label: "External Platforms", href: "external-platforms" },
] as const;

export function Sidebar({ locale }: { locale: string }) {
  return (
    <nav aria-label="Dashboard navigation" className="w-56 shrink-0 border-r p-4">
      <p className="px-2 pt-2 text-xs font-semibold text-neutral">CMS</p>
      <ul className="space-y-1">
        {CMS_ENTITY_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={`/${locale}/dashboard/cms/${item.href}`}
              className="block rounded-md p-2 text-sm"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-4 space-y-2 border-t pt-4">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={`/${locale}/dashboard/${item.href}`} className="block rounded-md p-2">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
