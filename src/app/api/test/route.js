// src/app/api/test/route.ts
import {db} from "../../../lib/db";

export async function GET() {
  const result = await db.query("SELECT NOW()");
  return Response.json(result.rows);
}