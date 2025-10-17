import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

export async function ensureCommentsTable() {
  const db = getDb();
  if (!db) return false;
  await db.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id BIGSERIAL PRIMARY KEY,
      doc_id TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_image TEXT,
      parent_id BIGINT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_comments_doc ON comments (doc_id, created_at DESC);
  `);
  return true;
}
