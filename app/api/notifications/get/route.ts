import { NextResponse } from "next/server";

type GetNotificationsBody = {
  users: string[];
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body: GetNotificationsBody = (await req.json()) as GetNotificationsBody;

    const users: string[] = Array.isArray(body?.users) ? body.users : [];

    const baseUrl: string | undefined = process.env.AVALANCHE_METRICS_URL;
    const apiKey: string | undefined = process.env.AVALANCHE_METRICS_API_KEY;

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Missing AVALANCHE_METRICS_URL" },
        { status: 500 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing AVALANCHE_METRICS_API_KEY" },
        { status: 500 }
      );
    }

    const upstream: Response = await fetch(`${baseUrl}/notifications/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ users }),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const text: string = await upstream.text();
      return NextResponse.json(
        { error: text || "Failed to fetch notifications" },
        { status: upstream.status }
      );
    }

    const payload: unknown = await upstream.json();
    return NextResponse.json(payload, { status: 200 });
  } catch (err: unknown) {
    const message: string =
      err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
