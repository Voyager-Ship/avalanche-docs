import Link from "next/link";
import { getAuthSession } from "@/lib/auth/authSession";
import {
  canEvaluateHackathon,
  canManageHackathonJudges,
} from "@/lib/auth/permissions";
import { Gavel, ClipboardCheck } from "lucide-react";

type Props = {
  hackathonId: string;
};

export async function HostNavButtons({ hackathonId }: Props) {
  const session = await getAuthSession();
  if (!session?.user) return null;

  const [canManage, canEvaluate] = await Promise.all([
    Promise.resolve(canManageHackathonJudges(session)),
    canEvaluateHackathon(session, hackathonId),
  ]);

  if (!canManage && !canEvaluate) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canManage && (
        <Link
          href={`/events/${hackathonId}/admin-panel/judges`}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          <Gavel className="size-3.5" />
          Judges
        </Link>
      )}
      {canEvaluate && (
        <Link
          href={`/events/${hackathonId}/evaluate`}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          <ClipboardCheck className="size-3.5" />
          Evaluate
        </Link>
      )}
    </div>
  );
}
