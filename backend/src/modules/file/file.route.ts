import Elysia, { t }     from "elysia";
import { authMiddleware } from "../../middleware/auth.middleware";
import { FileService }    from "./file.service";
import { FileParamsSchema, RenameFileBodySchema } from "./file.model";
import path from "path";
import fs   from "fs";

export const fileRoute = new Elysia({ prefix: "/files" })
  .use(authMiddleware)

  // ── GET /files?folder_id=1 ────────────────────────────────────────────────
  .get(
    "/",
    async ({ query, user, error }:any) => {
      if (!query.folder_id)
        return error(400, { success: false, message: "folder_id is required" });

      const data = await FileService.getByFolder(Number(query.folder_id), user.sub);
      return { success: true, data };
    },
    {
      query: t.Object({ folder_id: t.Optional(t.String()) }),
      detail: { summary: "List files in a folder" },
    }
  )

  // ── GET /files/:id ────────────────────────────────────────────────────────
  .get(
    "/:id",
    async ({ params, user, error }:any) => {
      const data = await FileService.getById(params.id, user.sub);
      if (!data) return error(404, { success: false, message: "File not found" });
      return { success: true, data };
    },
    { params: FileParamsSchema }
  )

  // ── GET /files/:id/download ───────────────────────────────────────────────
  .get(
    "/:id/download",
    async ({ params, user, error, set }:any) => {
      const file = await FileService.getById(params.id, user.sub);
      if (!file) return error(404, { success: false, message: "File not found" });

      if (!fs.existsSync(file.disk_path))
        return error(410, { success: false, message: "File no longer exists on disk" });

      const bunFile = Bun.file(file.disk_path);

      set.headers["Content-Type"]        = file.mime_type;
      set.headers["Content-Disposition"] = `attachment; filename="${file.name}"`;

      return bunFile;
    },
    { params: FileParamsSchema, detail: { summary: "Download a file" } }
  )

  // ── POST /files/upload ────────────────────────────────────────────────────
  .post(
    "/upload",
    async ({ body, user, set, error }:any) => {
      try {
        const data = await FileService.upload(
          body.file as File,
          Number(body.folder_id),
          user.sub
        );
        set.status = 201;
        return { success: true, data };
      } catch (e: any) {
        return error(400, { success: false, message: e.message });
      }
    },
    {
      body: t.Object({
        file:      t.File(),            // multipart file
        folder_id: t.String(),          // multipart fields are strings
      }),
      detail: { summary: "Upload a file into a folder" },
    }
  )

  // ── PATCH /files/:id ──────────────────────────────────────────────────────
  .patch(
    "/:id",
    async ({ params, body, user, error }:any) => {
      const data = await FileService.rename(params.id, body.name, user.sub);
      if (!data) return error(404, { success: false, message: "File not found" });
      return { success: true, data };
    },
    {
      params: FileParamsSchema,
      body:   RenameFileBodySchema,
      detail: { summary: "Rename a file" },
    }
  )

  // ── DELETE /files/:id ─────────────────────────────────────────────────────
  // Soft delete — keeps file on disk, marks deleted in DB
  .delete(
    "/:id",
    async ({ params, user, error }:any) => {
      const deleted = await FileService.softDelete(params.id, user.sub);
      if (!deleted) return error(404, { success: false, message: "File not found" });
      return { success: true, message: "File deleted" };
    },
    { params: FileParamsSchema, detail: { summary: "Soft delete a file" } }
  )

  // ── PATCH /files/:id/restore ──────────────────────────────────────────────
  .patch(
    "/:id/restore",
    async ({ params, user, error }:any) => {
      const data = await FileService.restore(params.id, user.sub);
      if (!data) return error(404, { success: false, message: "File not found or not deleted" });
      return { success: true, data };
    },
    { params: FileParamsSchema, detail: { summary: "Restore a soft-deleted file" } }
  )

  // ── DELETE /files/:id/purge ───────────────────────────────────────────────
  // Hard delete — removes from disk AND database permanently
  .delete(
    "/:id/purge",
    async ({ params, user, error }:any) => {
      const purged = await FileService.purge(params.id, user.sub);
      if (!purged) return error(404, { success: false, message: "File not found" });
      return { success: true, message: "File permanently deleted" };
    },
    { params: FileParamsSchema, detail: { summary: "Permanently delete a file from disk and DB" } }
  );