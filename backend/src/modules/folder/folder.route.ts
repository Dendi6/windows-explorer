import Elysia from "elysia";
import { authMiddleware }    from "../../middleware/auth.middleware";
import { FolderService }     from "./folder.service";
import {
  FolderParamsSchema,
  CreateFolderBodySchema,
  UpdateFolderBodySchema,
} from "./folder.model";

export const folderRoute = new Elysia({ prefix: "/folders" })
  .use(authMiddleware)

  // ── GET /folders/tree ─────────────────────────────────────────────────────
  .get(
    "/tree",
    async ({ user }:any) => {
      const data = await FolderService.getTree(user.sub);
      return { success: true, data };
    },
    {
      detail: { summary: "Get full folder tree" },
    }
  )

  // ── GET /folders/:id ──────────────────────────────────────────────────────
  .get(
    "/:id",
    async ({ params, user, error }:any) => {
      const data = await FolderService.getById(params.id, user.sub);
      if (!data) return error(404, { success: false, message: "Folder not found" });
      return { success: true, data };
    },
    {
      params: FolderParamsSchema,
      detail: { summary: "Get a single folder" },
    }
  )

  // ── GET /folders/:id/children ─────────────────────────────────────────────
  .get(
    "/:id/children",
    async ({ params, user, error }:any) => {
      const folder = await FolderService.getById(params.id, user.sub);
      if (!folder) return error(404, { success: false, message: "Folder not found" });

      const data = await FolderService.getChildren(params.id, user.sub);
      return { success: true, data };
    },
    {
      params: FolderParamsSchema,
      detail: { summary: "Get direct children of a folder" },
    }
  )

  // ── POST /folders ─────────────────────────────────────────────────────────
  .post(
    "/",
    async ({ body, user, set, error }:any) => {
      try {
        const data = await FolderService.create(
          body.name,
          user.sub,
          body.parent_id ?? null
        );
        set.status = 201;
        return { success: true, data };
      } catch (e: any) {
        return error(400, { success: false, message: e.message });
      }
    },
    {
      body:   CreateFolderBodySchema,
      detail: { summary: "Create a folder" },
    }
  )

  // ── PATCH /folders/:id ────────────────────────────────────────────────────
  .patch(
    "/:id",
    async ({ params, body, user, error }:any) => {
      const data = await FolderService.update(params.id, body.name, user.sub);
      if (!data) return error(404, { success: false, message: "Folder not found" });
      return { success: true, data };
    },
    {
      params: FolderParamsSchema,
      body:   UpdateFolderBodySchema,
      detail: { summary: "Rename a folder" },
    }
  )

  // ── DELETE /folders/:id ───────────────────────────────────────────────────
  .delete(
    "/:id",
    async ({ params, user, error }:any) => {
      const deleted = await FolderService.softDelete(params.id, user.sub);
      if (!deleted) return error(404, { success: false, message: "Folder not found" });
      return { success: true, message: "Folder deleted" };
    },
    {
      params: FolderParamsSchema,
      detail: { summary: "Soft delete a folder and all its contents" },
    }
  )

  // ── PATCH /folders/:id/restore ────────────────────────────────────────────
  .patch(
    "/:id/restore",
    async ({ params, user, error }:any) => {
      const data = await FolderService.restore(params.id, user.sub);
      if (!data) return error(404, { success: false, message: "Folder not found or not deleted" });
      return { success: true, data };
    },
    {
      params: FolderParamsSchema,
      detail: { summary: "Restore a soft-deleted folder" },
    }
  );