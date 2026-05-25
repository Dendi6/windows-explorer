import { t } from "elysia";

export const FolderParamsSchema = t.Object({
  id: t.Numeric(),
});

export const CreateFolderBodySchema = t.Object({
  name:      t.String({ minLength: 1, maxLength: 255 }),
  parent_id: t.Optional(t.Nullable(t.Number())),
});

export const UpdateFolderBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
});