import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      importance: tasks.importance,
      urgency: tasks.urgency,
      assignee: tasks.assignee,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      categoryId: tasks.categoryId,
      categoryName: categories.name,
    })
    .from(tasks)
    .leftJoin(categories, eq(tasks.categoryId, categories.id))
    .orderBy(tasks.dueDate);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  }

  const [created] = await db
    .insert(tasks)
    .values({
      title: body.title.trim(),
      description: body.description || null,
      status: body.status || "not_started",
      importance: body.importance || "mid",
      urgency: body.urgency || "mid",
      categoryId: body.categoryId || null,
      assignee: body.assignee || null,
      dueDate: body.dueDate || null,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
