import { t } from "elysia";

export const FileParamsSchema = t.Object({
  id: t.Numeric(),
});

export const RenameFileBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
});