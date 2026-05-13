import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { withAuthRole } from "@/lib/protectedRoute";

const MAX_RESULTS = 20;

export const GET = withAuthRole("devrel", async (request: NextRequest) => {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { user_name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      user_name: true,
      custom_attributes: true,
    },
    orderBy: { name: "asc" },
    take: MAX_RESULTS,
  });

  return NextResponse.json({ users });
});
