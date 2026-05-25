import { t } from "elysia";

export const RegisterBodySchema = t.Object({
  email:    t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  name:     t.String({ minLength: 1 }),
});

export const LoginBodySchema = t.Object({
  email:    t.String({ format: "email" }),
  password: t.String(),
});

export const AuthResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    token: t.String(),
    user: t.Object({
      id:    t.Number(),
      email: t.String(),
      name:  t.String(),
    }),
  }),
});