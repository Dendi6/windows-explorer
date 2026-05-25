import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "./config/env";
import { authRoute } from "./modules/auth/auth.route";
import { migrate } from "./database/migrate";
import { folderRoute } from "./modules/folder/folder.route";
import { fileRoute } from "./modules/file/file.route";

await migrate();

const app = new Elysia()
  .use(cors({
    origin: "*",    
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .get("/health", () => ({ status: "ok" }))
  .use(authRoute)
  .use(folderRoute)
  .use(fileRoute)
  .onError(({ code, error, set }: any) => {
    console.error(`[${code}]`, error.message);
    if (code === "VALIDATION") {
      set.status = 422;
      return { success: false, message: "Validation error", details: error.message };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Route not found" };
    }
    set.status = 500;
    return { success: false, message: "Internal server error" };
  })
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
