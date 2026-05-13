import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { getAuthSession } from "@/lib/auth/authSession";
import { canEvaluateHackathon } from "@/lib/auth/permissions";
import type { RouteParams } from "@/lib/protectedRoute";

type Params = RouteParams<{ id: string }>;

type Body = {
  score_overall?: number | null;
  comment?: string | null;
};

const MIN_SCORE = 0;
const MAX_SCORE = 100;

export async function POST(request: NextRequest, context: Params) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, hackaton_id: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (!project.hackaton_id) {
    return NextResponse.json(
      { error: "Project is not attached to a hackathon" },
      { status: 400 },
    );
  }

  const allowed = await canEvaluateHackathon(session, project.hackaton_id);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;

  let scoreOverall: number | null = null;
  if (body.score_overall !== undefined && body.score_overall !== null) {
    const n = Number(body.score_overall);
    if (!Number.isFinite(n) || n < MIN_SCORE || n > MAX_SCORE) {
      return NextResponse.json(
        { error: `score_overall must be a number between ${MIN_SCORE} and ${MAX_SCORE}` },
        { status: 400 },
      );
    }
    scoreOverall = n;
  }

  const comment =
    typeof body.comment === "string" ? body.comment.slice(0, 5000) : null;

  const evaluation = await prisma.evaluation.upsert({
    where: {
      project_id_evaluator_id: {
        project_id: projectId,
        evaluator_id: session.user.id,
      },
    },
    create: {
      project_id: projectId,
      hackathon_id: project.hackaton_id,
      evaluator_id: session.user.id,
      score_overall: scoreOverall,
      comment,
    },
    update: {
      score_overall: scoreOverall,
      comment,
    },
    select: {
      id: true,
      score_overall: true,
      comment: true,
      created_at: true,
      updated_at: true,
      evaluator: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return NextResponse.json({ evaluation });
}
