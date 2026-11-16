import { getSession } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { getPersonPhotoUrl } from "@/lib/person-photo";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { AccountForm } from "./account-form";

/**
 * Implements: Decision Log item C2 — "My Account" self-service profile
 * screen, confirmed in scope for v1.0 (2026-07-21). Previously the
 * Administrator's own display name/bio could only be changed through the
 * generic Persons CMS list — this is a dedicated, personal-feeling
 * screen for exactly one record: the signed-in Administrator's own
 * `person` row, reached via `platform_user.person_id`.
 */
export default async function AccountPage({ params }: { params: { locale: string } }) {
  const session = await getSession(nextCookieAdapter());
  const supabase = createRouteHandlerSupabaseClient();

  const { data: person } = await supabase
    .from("person")
    .select("*")
    .eq("id", session.authenticated ? session.personId : "")
    .maybeSingle();

  const photoUrl = person ? await getPersonPhotoUrl(supabase, String(person.id)) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "My Account" }]} />
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">My Account</h1>
        <p className="text-sm text-neutral">
          Your own display name and biography — shown publicly on the About page once your Person
          record is published.
        </p>
        {person ? (
          <AccountForm locale={params.locale} person={person} photoUrl={photoUrl} />
        ) : (
          <p className="text-sm text-danger">Could not load your account record.</p>
        )}
      </div>
    </div>
  );
}
