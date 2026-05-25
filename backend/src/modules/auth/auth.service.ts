import sql from "../../config/database";
import type { User } from "../../types";

export const AuthService = {
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return user ?? null;
  },

  async findById(id: number): Promise<Omit<User, "password"> | null> {
    const [user] = await sql<Omit<User, "password">[]>`
      SELECT id, email, name, created_at FROM users WHERE id = ${id} LIMIT 1
    `;
    return user ?? null;
  },

  async create(email: string, hashedPassword: string, name: string): Promise<User> {
    const [user] = await sql<User[]>`
      INSERT INTO users (email, password, name)
      VALUES (${email}, ${hashedPassword}, ${name})
      RETURNING *
    `;
    return user;
  },

  async emailExists(email: string): Promise<boolean> {
    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*) as count FROM users WHERE email = ${email}
    `;
    return Number(count) > 0;
  },
};