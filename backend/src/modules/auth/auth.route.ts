import Elysia, { t } from "elysia";
import { jwt }        from "@elysiajs/jwt";
import { AuthService } from "./auth.service";
import { RegisterBodySchema, LoginBodySchema } from "./auth.model";
import { env } from "../../config/env";
import type { JwtPayload } from "../../types";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name:   "jwt",
      secret: env.JWT_SECRET,
      exp:    "7d",
    })
  )

  // ── POST /auth/register ──────────────────────────────────────────────────
  .post(
    "/register",
    async ({ body, jwt, error }:any) => {
      const exists = await AuthService.emailExists(body.email);
      if (exists) return error(409, { success: false, message: "Email already registered" });

      // Bun.password uses bcrypt under the hood
      const hashedPassword = await Bun.password.hash(body.password);
      const user = await AuthService.create(body.email, hashedPassword, body.name);

      const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name };
      const token = await jwt.sign(payload);

      return {
        success: true,
        data: {
          token,
          user: { id: user.id, email: user.email, name: user.name },
        },
      };
    },
    {
      body:   RegisterBodySchema,
      detail: { summary: "Register a new user" },
    }
  )

  // ── POST /auth/login ─────────────────────────────────────────────────────
  .post(
    "/login",
    async ({ body, jwt, error }:any) => {
      const user = await AuthService.findByEmail(body.email);
      if (!user) return error(401, { success: false, message: "Invalid credentials" });

      const valid = await Bun.password.verify(body.password, user.password);
      if (!valid) return error(401, { success: false, message: "Invalid credentials" });

      const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name };
      const token = await jwt.sign(payload);

      return {
        success: true,
        data: {
          token,
          user: { id: user.id, email: user.email, name: user.name },
        },
      };
    },
    {
      body:   LoginBodySchema,
      detail: { summary: "Login with email & password" },
    }
  );