import sql        from "../../config/database";
import { UPLOAD_DIR } from "../../config/storage";
import path       from "path";
import fs         from "fs";
import { FolderService } from "../folder/folder.service";

export interface FileRecord {
  id:         number;
  name:       string;
  folder_id:  number;
  owner_id:   number;
  size:       number;
  mime_type:  string;
  disk_path:  string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const FileService = {

  // ── GET FILES BY FOLDER ───────────────────────────────────────────────────
  async getByFolder(folderId: number, ownerId: number): Promise<FileRecord[]> {
    return sql<FileRecord[]>`
      SELECT id, name, folder_id, owner_id, size, mime_type, created_at, updated_at
      FROM   files
      WHERE  folder_id  = ${folderId}
        AND  owner_id   = ${ownerId}
        AND  deleted_at IS NULL
      ORDER  BY name ASC
    `;
  },

  // ── GET BY ID ─────────────────────────────────────────────────────────────
  async getById(id: number, ownerId: number): Promise<FileRecord | null> {
    const [file] = await sql<FileRecord[]>`
      SELECT *
      FROM   files
      WHERE  id         = ${id}
        AND  owner_id   = ${ownerId}
        AND  deleted_at IS NULL
    `;
    return file ?? null;
  },

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  async upload(
    file:     File,           // Bun File object from multipart
    folderId: number,
    ownerId:  number
  ): Promise<FileRecord> {
    // 1. Verify folder belongs to this user
    const folder = await FolderService.getById(folderId, ownerId);
    if (!folder) throw new Error("Folder not found");

    // 2. Build a unique filename to avoid collisions
    const ext      = path.extname(file.name);
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const unique   = `${Date.now()}_${Math.random().toString(36).slice(2)}_${baseName}${ext}`;
    const diskPath = path.join(UPLOAD_DIR, unique);

    // 3. Write to disk
    const buffer = await file.arrayBuffer();
    await Bun.write(diskPath, buffer);

    // 4. Save metadata to DB
    const [record] = await sql<FileRecord[]>`
      INSERT INTO files (name, folder_id, owner_id, size, mime_type, disk_path)
      VALUES (
        ${file.name},
        ${folderId},
        ${ownerId},
        ${file.size},
        ${file.type || "application/octet-stream"},
        ${diskPath}
      )
      RETURNING id, name, folder_id, owner_id, size, mime_type, created_at, updated_at
    `;
    return record;
  },

  // ── RENAME ────────────────────────────────────────────────────────────────
  async rename(id: number, name: string, ownerId: number): Promise<FileRecord | null> {
    const [file] = await sql<FileRecord[]>`
      UPDATE files
      SET    name       = ${name},
             updated_at = now()
      WHERE  id         = ${id}
        AND  owner_id   = ${ownerId}
        AND  deleted_at IS NULL
      RETURNING id, name, folder_id, owner_id, size, mime_type, created_at, updated_at
    `;
    return file ?? null;
  },

  // ── SOFT DELETE ───────────────────────────────────────────────────────────
  async softDelete(id: number, ownerId: number): Promise<boolean> {
    const result = await sql`
      UPDATE files
      SET    deleted_at = now()
      WHERE  id         = ${id}
        AND  owner_id   = ${ownerId}
        AND  deleted_at IS NULL
    `;
    return result.count > 0;
  },

  // ── RESTORE ───────────────────────────────────────────────────────────────
  async restore(id: number, ownerId: number): Promise<FileRecord | null> {
    const [file] = await sql<FileRecord[]>`
      UPDATE files
      SET    deleted_at = NULL,
             updated_at = now()
      WHERE  id         = ${id}
        AND  owner_id   = ${ownerId}
        AND  deleted_at IS NOT NULL
      RETURNING id, name, folder_id, owner_id, size, mime_type, created_at, updated_at
    `;
    return file ?? null;
  },

  // ── HARD DELETE (purge from disk + db) ────────────────────────────────────
  async purge(id: number, ownerId: number): Promise<boolean> {
    const file = await FileService.getById(id, ownerId);
    if (!file) return false;

    // Remove from disk
    if (fs.existsSync(file.disk_path)) {
      fs.unlinkSync(file.disk_path);
    }

    // Remove from DB
    await sql`
      DELETE FROM files
      WHERE id = ${id} AND owner_id = ${ownerId}
    `;
    return true;
  },
};