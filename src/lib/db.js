import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env.local") });
dotenv.config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { db };
