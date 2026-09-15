import { NextResponse } from "next/server";
import { serverApi } from "@/lib/server-api";

export async function GET(req, { params }) {
  const { slug } = await params;
  try {
    const result = await serverApi(`/posts/community/${encodeURIComponent(slug)}${req.nextUrl.search}`);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: error.status || 502 });
  }
}
