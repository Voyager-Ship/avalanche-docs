# Referral attribution — adding it to a new form

Every submission form on Builders Hub (grants, hackathons, signups) writes a row to `ReferralAttribution` so the Builder Insights dashboard can credit the referrer's team. This doc is the recipe for wiring a new form.

## Two paths, one row

A `ReferralAttribution` row can come from either of two paths — the data shape is the same:

| Path | When it fires | `referral_link_id` | `team_id_referrer` | `user_id_referrer` | `team_id_referrer_other` |
|---|---|---:|---|---|---|
| URL `?ref=CODE` | Visitor lands via a referral link | uuid | from `ReferralLink.team_id` | from `ReferralLink.owner_user_id` | `null` |
| Manual: curated team | Visitor picks a team in the picker | `null` | curated id (e.g. `"team1-latam"`) | uuid (server-verified) or `null` | `null` |
| Manual: "Other" | Visitor types a free-text label | `null` | `"none"` (sentinel) | `null` | the typed string |

URL code wins if both arrive in the same submission.

## The four-step recipe

### 1. Pick (or add) a `target_type`

`lib/referrals/constants.ts` exports the union `ReferralTargetType`. Reuse an existing literal (`"hackathon_registration"`, `"grant_application"`, `"bh_signup"`, `"build_games_application"`) or add a new one. The value is what the Builder Insights dashboard groups by.

### 2. Drop the picker into your form

```tsx
import { useState } from "react";
import {
  ReferralFormSection,
  buildReferralAttributionPayload,
} from "@/components/referrals/ReferralFormSection";
import {
  EMPTY_REFERRER,
  type ReferrerPickerValue,
} from "@/components/referrals/ReferrerPicker";

function MyForm() {
  const [referrer, setReferrer] = useState<ReferrerPickerValue>(EMPTY_REFERRER);
  // ...
  return (
    <form onSubmit={handleSubmit}>
      {/* your fields */}
      <ReferralFormSection value={referrer} onChange={setReferrer} />
    </form>
  );
}
```

`<ReferralFormSection>` already handles:
- Reading `?ref=CODE` from the URL.
- Calling `/api/referrals/resolve` to swap into locked / "Referred by …" mode.
- The team + user dropdowns.
- The "Other" free-text fallback.

### 3. Build the payload in `onSubmit`

```tsx
const body = {
  ...formValues,
  ...buildReferralAttributionPayload(referrer),
};

const res = await fetch("/api/your-form", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
```

`buildReferralAttributionPayload` reads URL + cookie state and the picker, and produces `{ referral_attribution: ... | null }`. Shape matches `ReferralAttributionPayload` in `server/services/referrals.ts`.

### 4. Record server-side

```ts
import { extractAndRecordReferral } from "@/server/services/referrals";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // ... your form's own validation + DB write ...

  const referralAttributed = await extractAndRecordReferral(
    request,
    body,
    { targetType: "your_target_type", targetId: "optional-static-or-dynamic-id" },
    { userId: session.user.id, userEmail: session.user.email },
  );

  return NextResponse.json({ ok: true, referralAttributed });
}
```

`extractAndRecordReferral` never throws — failures are logged and reported via the boolean. Returns `true` only when a row was actually written. Forward this back to the client so it can call `clearStoredReferralAttribution()` on success.

## Validation guarantees you don't have to re-implement

Inside `recordReferralAttribution` the server already:

- Rejects unknown `team_id` values.
- Verifies the picked `userId` actually has `User.team_id === <chosen team>`. Mismatch → drops `userId`, keeps the row team-only, logs a warning.
- Refuses to attach a `userId` to an "Other" pick.
- Truncates / requires the "Other" free-text label (`1 ≤ length ≤ 100`).
- Dedupes by `(target_type, target_id, referral_link_id, user_id, user_email)` via the `attribution_key` unique index — re-submissions are no-ops.

## Things to think about when you adopt this

- The picker is **always optional** — never gate form progression on it.
- If your form has a "save and resume later" path, the picker state is local React state (not in your Zod schema) and won't auto-persist. If you need persistence, lift `referrer` into your existing `localStorage` blob.
- `<ReferralFormSection>` already calls `captureReferralAttributionFromUrl()` once on mount — you don't need to call it elsewhere.

## Files

- `lib/referrals/team-labels.ts` — the curated team registry + `OTHER_TEAM_SENTINEL`.
- `lib/referrals/schema.ts` — Zod blocks for body validation.
- `components/referrals/ReferralFormSection.tsx` — the drop-in section.
- `components/referrals/ReferrerPicker.tsx` — raw picker, in case you need a non-section variant.
- `hooks/use-referrer-auto-fill.ts` — URL `?ref=` resolver hook.
- `server/services/referrals.ts` — `recordReferralAttribution` + `extractAndRecordReferral`.
- `app/api/referrals/resolve/route.ts` — public code resolver.
- `app/api/referrals/team-members/route.ts` — auth-gated team roster.
