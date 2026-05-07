import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { getUserById } from "@/server/services/getUser";
import { NEXT_AUTH_SECRET } from "@/constants/env_variables";

const prisma: PrismaClient = new PrismaClient();

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({
      req,
      secret: NEXT_AUTH_SECRET ?? "",
    });

    if (!token?.id || typeof token.id !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId: string = token.id;

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const customAttributes: string[] = user.custom_attributes || [];

    const allowedRoles: Set<string> = new Set([
      "devrel",
      "team1-admin",
      "hackathonCreator",
    ]);

    const hasAccess: boolean = customAttributes.some(
      (role: string): boolean => allowedRoles.has(role),
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resources = await prisma.resource.findMany();

    return NextResponse.json(resources, { status: 200 });
  } catch (error: unknown) {
    console.error("Error GET /api/resources:", error);

    return NextResponse.json(
      { error: "Error fetching resources" },
      { status: 500 },
    );
  }
}