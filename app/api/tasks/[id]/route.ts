import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const body = await req.json();

  const allowed = [
    "title",
    "description",
    "status",
    "importance",
    "urgency",
    "categoryId",
    "assignee",
    "dueDate",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  updates.updatedAt = sql`(current_timestamp)`;

  const [updated] = await getDb()
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);

  await getDb().delete(tasks).where(eq(tasks.id, taskId));

  return NextResponse.json({ ok: true });
}
