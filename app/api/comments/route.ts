import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, ensureCommentsTable } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("docId");
  if (!docId) {
    return NextResponse.json(
      { ok: false, error: "missing_docId" },
      { status: 400 },
    );
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { ok: false, error: "db_missing" },
      { status: 503 },
    );
  }
  await ensureCommentsTable();
  const { rows } = await db.query(
    `SELECT id, doc_id, content, user_id, user_name, user_image, parent_id, created_at
     FROM comments WHERE doc_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [docId],
  );
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { ok: false, error: "db_missing" },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => null)) as {
    docId?: string;
    content?: string;
    parentId?: number | null;
  } | null;
  const docId = body?.docId?.trim();
  const content = body?.content?.trim();
  const parentId = body?.parentId ?? null;
  if (!docId || !content) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 },
    );
  }
  if (content.length > 4000) {
    return NextResponse.json(
      { ok: false, error: "content_too_long" },
      { status: 400 },
    );
  }
  await ensureCommentsTable();
  const userId = (session.user as any).id ?? "unknown";
  const userName = session.user.name ?? null;
  const userImage = session.user.image ?? null;
  const { rows } = await db.query(
    `INSERT INTO comments (doc_id, content, user_id, user_name, user_image, parent_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, doc_id, content, user_id, user_name, user_image, parent_id, created_at`,
    [docId, content, String(userId), userName, userImage, parentId],
  );
  return NextResponse.json({ ok: true, data: rows[0] }, { status: 201 });
}
