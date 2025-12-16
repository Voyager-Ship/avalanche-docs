import { NextRequest, NextResponse } from "next/server";
import { HackathonHeader } from "@/types/hackathons";
import { getProject, updateProject } from "@/server/services/projects";
import { GetProjectByIdWithMembers } from "@/server/services/memberProject";

export async function GET(req: NextRequest, context: any) {

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Use GetProjectByIdWithMembers to get project with full member information
    const project = await GetProjectByIdWithMembers(id);
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error in GET /api/projects/[id]:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')!;
    const partialEditedHackathon = (await req.json()) as Partial<HackathonHeader>;

    const updatedHackathon = await updateProject(id ?? partialEditedHackathon.id, partialEditedHackathon);

    return NextResponse.json(updatedHackathon);
  } catch (error) {
    console.error("Error in PUT /api/hackathons/[id]:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
