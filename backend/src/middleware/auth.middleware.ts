import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { env } from "../config/env";
import type { JwtPayload } from "../types";

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .use(jwt({ name: "jwt", secret: env.JWT_SECRET }))
  .use(bearer())
  .derive({ as: "global" }, async ({ jwt, bearer }): Promise<{ user: JwtPayload }> => {
    if (!bearer) {
      throw new Error("Missing token");
    }

    const payload = await jwt.verify(bearer);
    if (!payload) {
      throw new Error("Invalid or expired token");
    }

    return { user: payload as JwtPayload };
  });