import { HackathonsList, validateHackathon } from "@/services/hackathons";
import { Hackathon } from "@/types/hackathons";
import { NextResponse } from "next/server";


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    const hackathon = HackathonsList.find(hackathon => hackathon.id === id);
    return NextResponse.json(hackathon)

}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id

        const index = HackathonsList.findIndex((hackathon) => hackathon.id === id );
        if (index === -1) {
            return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
        }
        const editedHackathon = (await req.json()) as Partial<Hackathon>;
        editedHackathon.id = id;


        const errors = validateHackathon(editedHackathon);
        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        HackathonsList[index] = editedHackathon as Hackathon;

        const response = NextResponse.json(editedHackathon);
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");

        return response
    } catch (error) {
        console.error("Error in PUT /hackathons:", error);
        return NextResponse.json({ error: `Internal Server Error ${error}` }, { status: 500 });
    }
}

export async function OPTIONS() {
    const response = NextResponse.json({});
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT" );
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
  }
  