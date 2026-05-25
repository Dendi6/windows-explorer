import sql from "../../config/database";
import type { Folder, FolderNode } from "../../types";

export const FolderService = {

  // ── GET TREE ──────────────────────────────────────────────────────────────
  // Fetches all active folders flat, then builds tree in-memory
  async getTree(ownerId: number): Promise<FolderNode[]> {
    const folders = await sql<Folder[]>`
      SELECT id, name, parent_id, owner_id, created_at, updated_at
      FROM folders
      WHERE owner_id   = ${ownerId}
        AND deleted_at IS NULL
      ORDER BY name ASC
    `;
    return buildTree(folders, null);
  },

  // ── GET CHILDREN ──────────────────────────────────────────────────────────
  // Returns direct active subfolders of a given folder
  async getChildren(parentId: number, ownerId: number): Promise<Folder[]> {
    return sql<Folder[]>`
      SELECT id, name, parent_id, owner_id, created_at, updated_at
      FROM folders
      WHERE parent_id  = ${parentId}
        AND owner_id   = ${ownerId}
        AND deleted_at IS NULL
      ORDER BY name ASC
    `;
  },

  // ── GET BY ID ─────────────────────────────────────────────────────────────
  async getById(id: number, ownerId: number): Promise<Folder | null> {
    const [folder] = await sql<Folder[]>`
      SELECT id, name, parent_id, owner_id, created_at, updated_at
      FROM folders
      WHERE id         = ${id}
        AND owner_id   = ${ownerId}
        AND deleted_at IS NULL
    `;
    return folder ?? null;
  },

  // ── CREATE ────────────────────────────────────────────────────────────────
  async create(
    name:     string,
    ownerId:  number,
    parentId: number | null = null
  ): Promise<Folder> {
    // Verify parent belongs to this user (if provided)
    if (parentId !== null) {
      const parent = await FolderService.getById(parentId, ownerId);
      if (!parent) throw new Error("Parent folder not found");
    }

    const [folder] = await sql<Folder[]>`
      INSERT INTO folders (name, parent_id, owner_id)
      VALUES (${name}, ${parentId}, ${ownerId})
      RETURNING id, name, parent_id, owner_id, created_at, updated_at
    `;
    return folder;
  },

  // ── UPDATE (rename) ───────────────────────────────────────────────────────
  async update(
    id:      number,
    name:    string,
    ownerId: number
  ): Promise<Folder | null> {
    const [folder] = await sql<Folder[]>`
      UPDATE folders
      SET    name       = ${name},
             updated_at = now()
      WHERE  id         = ${id}
        AND  owner_id   = ${ownerId}
        AND  deleted_at IS NULL
      RETURNING id, name, parent_id, owner_id, created_at, updated_at
    `;
    return folder ?? null;
  },

  // ── SOFT DELETE ───────────────────────────────────────────────────────────
  // Marks this folder AND all descendants as deleted via recursive CTE
  async softDelete(id: number, ownerId: number): Promise<boolean> {
    // First confirm the folder exists and belongs to this user
    const folder = await FolderService.getById(id, ownerId);
    if (!folder) return false;

    // Recursively soft-delete all descendant folders + their files
    await sql`
      WITH RECURSIVE descendants AS (
        -- anchor: the target folder
        SELECT id FROM folders
        WHERE  id = ${id} AND deleted_at IS NULL

        UNION ALL

        -- recurse into children
        SELECT f.id FROM folders f
        INNER JOIN descendants d ON f.parent_id = d.id
        WHERE f.deleted_at IS NULL
      )
      UPDATE folders
      SET    deleted_at = now()
      WHERE  id IN (SELECT id FROM descendants)
    `;

    // Soft-delete all files inside those folders
    await sql`
      WITH RECURSIVE descendants AS (
        SELECT id FROM folders
        WHERE  id = ${id}

        UNION ALL

        SELECT f.id FROM folders f
        INNER JOIN descendants d ON f.parent_id = d.id
      )
      UPDATE files
      SET    deleted_at = now()
      WHERE  folder_id IN (SELECT id FROM descendants)
        AND  deleted_at IS NULL
    `;

    return true;
  },

  // ── RESTORE ───────────────────────────────────────────────────────────────
  // Restores a soft-deleted folder (direct folder only, not descendants)
  async restore(id: number, ownerId: number): Promise<Folder | null> {
    const [folder] = await sql<Folder[]>`
      UPDATE folders
      SET    deleted_at = NULL,
             updated_at = now()
      WHERE  id       = ${id}
        AND  owner_id = ${ownerId}
        AND  deleted_at IS NOT NULL
      RETURNING id, name, parent_id, owner_id, created_at, updated_at
    `;
    return folder ?? null;
  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

function buildTree(folders: Folder[], parentId: number | null): FolderNode[] {
  return folders
    .filter((f) => f.parent_id === parentId)
    .map((f) => ({
      ...f,
      children: buildTree(folders, f.id),
    }));
}