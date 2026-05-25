import postgres from "postgres";
import { env } from "./env";

const sql = postgres(env.DATABASE_URL, {
  max:        10,        // connection pool size
  idle_timeout: 30,
  connect_timeout: 10,
});

export default sql;