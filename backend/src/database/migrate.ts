import sql from "../config/database";

export async function migrate() {
  // ── Users ────────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      name       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ DEFAULT NULL
    )
  `;

  // ── Folders ───────────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      parent_id  INTEGER REFERENCES folders(id) ON DELETE CASCADE,
      owner_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ DEFAULT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_folders_parent_id  ON folders(parent_id)
    WHERE deleted_at IS NULL
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_folders_owner_id
    ON folders(owner_id)
    WHERE deleted_at IS NULL
  `;

  // ── Files ────────────────────────────────────────────────────────────────
  await sql`
  CREATE TABLE IF NOT EXISTS files (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    folder_id  INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    owner_id   INTEGER NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    size       BIGINT NOT NULL DEFAULT 0,
    mime_type  TEXT NOT NULL DEFAULT 'application/octet-stream',
    disk_path  TEXT NOT NULL DEFAULT '',          -- path on server disk
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
  )
`;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_files_folder_id
    ON files(folder_id)
    WHERE deleted_at IS NULL
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_files_owner_id
    ON files(owner_id)
    WHERE deleted_at IS NULL
  `;

  console.log("✅ Migrations complete.");
}