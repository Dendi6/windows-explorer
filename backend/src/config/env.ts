const required = ["DATABASE_URL", "JWT_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET:   process.env.JWT_SECRET!,
  PORT:         Number(process.env.PORT ?? 3000),
};