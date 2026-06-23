import { NextResponse } from "next/server";
import { loadProfile, saveProfile } from "@/lib/profile";
import { syncAtlas } from "@/lib/atlasSync";

export async function GET() {
  return NextResponse.json(await loadProfile());
}

export async function POST(req: Request) {
  const body = await req.json();
  const saved = await saveProfile(body);
  // Recompute so the snapshot (date/runway) reflects the change immediately.
  await syncAtlas(saved.target).catch(() => null);
  return NextResponse.json(saved);
}

export const dynamic = "force-dynamic";
