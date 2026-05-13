"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserSearchPicker, type SearchUser } from "./UserSearchPicker";
import { Trash2 } from "lucide-react";

type Judge = {
  id: string;
  assigned_at: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    user_name: string | null;
    custom_attributes: string[];
  };
};

type Props = {
  hackathonId: string;
  initialJudges: Judge[];
};

function initials(name: string | null, email: string): string {
  const source = name ?? email;
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function JudgesManager({ hackathonId, initialJudges }: Props) {
  const [judges, setJudges] = useState<Judge[]>(initialJudges);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const excludedIds = judges.map((j) => j.user.id);

  async function addJudge(user: SearchUser) {
    setError(null);
    const res = await fetch(`/api/events/${hackathonId}/judges`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? `Failed to assign (${res.status})`);
      return;
    }
    const { judge } = (await res.json()) as { judge: Judge };
    setJudges((prev) => {
      if (prev.some((j) => j.user.id === judge.user.id)) return prev;
      return [...prev, judge];
    });
  }

  async function removeJudge(userId: string) {
    setError(null);
    const previous = judges;
    setJudges((prev) => prev.filter((j) => j.user.id !== userId));
    const res = await fetch(`/api/events/${hackathonId}/judges/${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setJudges(previous);
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? `Failed to remove (${res.status})`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h2 className="text-sm font-medium text-zinc-200">Assign a new judge</h2>
        <p className="mt-1 mb-3 text-xs text-zinc-500">
          Search by name or email. The user must already have a Builder Hub account.
        </p>
        <UserSearchPicker
          onSelect={(user) => startTransition(() => void addJudge(user))}
          excludeUserIds={excludedIds}
          placeholder="Search Builder Hub users…"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        {pending && <p className="mt-2 text-xs text-zinc-500">Saving…</p>}
      </Card>

      <Card className="p-6">
        <h2 className="text-sm font-medium text-zinc-200">
          Current judges <span className="text-zinc-500">({judges.length})</span>
        </h2>
        {judges.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No judges assigned yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-zinc-800">
            {judges.map((judge) => (
              <li
                key={judge.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Avatar className="size-9">
                  {judge.user.image && (
                    <AvatarImage src={judge.user.image} alt={judge.user.name ?? judge.user.email} />
                  )}
                  <AvatarFallback>{initials(judge.user.name, judge.user.email)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-100">
                    {judge.user.name ?? judge.user.user_name ?? judge.user.email}
                  </div>
                  <div className="truncate text-xs text-zinc-500">{judge.user.email}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeJudge(judge.user.id)}
                  aria-label={`Remove ${judge.user.name ?? judge.user.email}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
