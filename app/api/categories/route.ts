import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export async function GET() {
  const rows = await db.select().from(categories).orderBy(categories.name);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Название категории обязательно" }, { status: 400 });
  }

  try {
    const [created] = await db.insert(categories).values({ name }).returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    // уже существует — просто вернём её
    const existing = await db.select().from(categories);
    const found = existing.find((c) => c.name === name);
    return NextResponse.json(found, { status: 200 });
  }
}
