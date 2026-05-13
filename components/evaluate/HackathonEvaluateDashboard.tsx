"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Github, Loader2 } from "lucide-react";

type Evaluator = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type Evaluation = {
  id: string;
  evaluator_id: string;
  score_overall: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  evaluator: Evaluator;
};

type Member = {
  id: string;
  user_id: string | null;
  email: string | null;
  status: string;
  role: string;
};

type Project = {
  id: string;
  project_name: string;
  short_description: string;
  full_description: string | null;
  tech_stack: string | null;
  github_repository: string | null;
  demo_link: string | null;
  demo_video_link: string | null;
  logo_url: string | null;
  cover_url: string | null;
  tracks: string[];
  categories: string[];
  tags: string[];
  created_at: string;
  members: Member[];
  evaluations: Evaluation[];
};

type Props = {
  hackathonId: string;
  viewerId: string;
  projects: Project[];
};

const MIN = 0;
const MAX = 100;

function initials(name: string | null, email: string): string {
  const src = name ?? email;
  return src
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function averageScore(evals: Evaluation[]): number | null {
  const scored = evals.filter((e) => typeof e.score_overall === "number");
  if (scored.length === 0) return null;
  return scored.reduce((a, e) => a + (e.score_overall ?? 0), 0) / scored.length;
}

export function HackathonEvaluateDashboard({ hackathonId, viewerId, projects: initialProjects }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.project_name, p.short_description, p.tech_stack, p.tracks.join(" "), p.tags.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [projects, query]);

  const openProject = projects.find((p) => p.id === openProjectId) ?? null;

  function patchEvaluation(projectId: string, updated: Evaluation) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const others = p.evaluations.filter((e) => e.evaluator_id !== updated.evaluator_id);
        return { ...p, evaluations: [updated, ...others] };
      }),
    );
  }

  return (
    <>
      <div className="mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects…"
          className="max-w-md"
        />
      </div>

      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Project</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="w-[120px] text-right">Submitted</TableHead>
              <TableHead className="w-[80px] text-right">Reviews</TableHead>
              <TableHead className="w-[100px] text-right">Avg score</TableHead>
              <TableHead className="w-[110px] text-right">My score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                  No projects yet.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => {
              const avg = averageScore(p.evaluations);
              const mine = p.evaluations.find((e) => e.evaluator_id === viewerId);
              return (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setOpenProjectId(p.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.logo_url ? (
                        <img
                          src={p.logo_url}
                          alt=""
                          className="size-9 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="size-9 shrink-0 rounded bg-zinc-800" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-zinc-100">
                          {p.project_name}
                        </div>
                        <div className="truncate text-xs text-zinc-500">
                          {p.short_description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {p.members.length} member{p.members.length === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-zinc-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-sm text-zinc-300">
                    {p.evaluations.length}
                  </TableCell>
                  <TableCell className="text-right text-sm text-zinc-300">
                    {avg !== null ? avg.toFixed(1) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-zinc-100">
                    {mine?.score_overall ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openProjectId !== null} onOpenChange={(o) => !o && setOpenProjectId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {openProject && (
            <ProjectDetail
              project={openProject}
              viewerId={viewerId}
              onEvaluationSaved={(ev) => patchEvaluation(openProject.id, ev)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProjectDetail({
  project,
  viewerId,
  onEvaluationSaved,
}: {
  project: Project;
  viewerId: string;
  onEvaluationSaved: (evaluation: Evaluation) => void;
}) {
  const mine = project.evaluations.find((e) => e.evaluator_id === viewerId);
  const otherEvals = project.evaluations.filter((e) => e.evaluator_id !== viewerId);

  const [score, setScore] = useState<string>(
    mine?.score_overall !== null && mine?.score_overall !== undefined
      ? String(mine.score_overall)
      : "",
  );
  const [comment, setComment] = useState<string>(mine?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const parsedScore = score.trim() === "" ? null : Number(score);
    if (parsedScore !== null && (!Number.isFinite(parsedScore) || parsedScore < MIN || parsedScore > MAX)) {
      setError(`Score must be between ${MIN} and ${MAX}, or empty.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/evaluate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          score_overall: parsedScore,
          comment: comment.trim() === "" ? null : comment,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Save failed (${res.status})`);
      }
      const { evaluation } = (await res.json()) as { evaluation: Evaluation };
      onEvaluationSaved(evaluation);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DialogHeader>
        <DialogTitle className="text-xl">{project.project_name}</DialogTitle>
      </DialogHeader>

      <section className="flex flex-col gap-3">
        <p className="text-sm text-zinc-300">{project.short_description}</p>
        {project.full_description && (
          <p className="whitespace-pre-wrap text-sm text-zinc-400">
            {project.full_description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs">
          {project.tracks.map((t) => (
            <span key={t} className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">
              {t}
            </span>
          ))}
          {project.tags.map((t) => (
            <span key={t} className="rounded bg-zinc-900 px-2 py-0.5 text-zinc-400">
              #{t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {project.github_repository && (
            <a
              href={project.github_repository}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-zinc-300 underline-offset-2 hover:underline"
            >
              <Github className="size-3.5" /> Repo
            </a>
          )}
          {project.demo_link && (
            <a
              href={project.demo_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-zinc-300 underline-offset-2 hover:underline"
            >
              <ExternalLink className="size-3.5" /> Demo
            </a>
          )}
          {project.demo_video_link && (
            <a
              href={project.demo_video_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-zinc-300 underline-offset-2 hover:underline"
            >
              <ExternalLink className="size-3.5" /> Video
            </a>
          )}
        </div>
        {project.tech_stack && (
          <div className="text-xs text-zinc-500">Stack: {project.tech_stack}</div>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-md border border-zinc-800 p-4">
        <h3 className="text-sm font-medium text-zinc-200">Your evaluation</h3>
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400" htmlFor="score-input">
            Score (0–100)
          </label>
          <Input
            id="score-input"
            type="number"
            min={MIN}
            max={MAX}
            step={1}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-24"
          />
        </div>
        <Textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a note about this project…"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {mine ? "Update evaluation" : "Submit evaluation"}
          </Button>
        </div>
        {mine && (
          <p className="text-xs text-zinc-500">
            Last saved {new Date(mine.updated_at).toLocaleString()}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-zinc-200">
          Other judges&apos; evaluations{" "}
          <span className="text-zinc-500">({otherEvals.length})</span>
        </h3>
        {otherEvals.length === 0 ? (
          <p className="text-xs text-zinc-500">No other evaluations yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {otherEvals.map((e) => (
              <li key={e.id} className="flex gap-3 rounded-md border border-zinc-800 p-3">
                <Avatar className="size-8">
                  {e.evaluator.image && (
                    <AvatarImage
                      src={e.evaluator.image}
                      alt={e.evaluator.name ?? e.evaluator.email}
                    />
                  )}
                  <AvatarFallback>
                    {initials(e.evaluator.name, e.evaluator.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {e.evaluator.name ?? e.evaluator.email}
                    </span>
                    <span className="text-sm font-semibold text-zinc-200">
                      {e.score_overall ?? "—"}
                    </span>
                  </div>
                  {e.comment && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-zinc-400">
                      {e.comment}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-600">
                    {new Date(e.updated_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
