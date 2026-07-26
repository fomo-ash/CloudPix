import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const res = await fetch(url, { method: "HEAD" });
    const cl = res.headers.get("content-length");
    if (cl && parseInt(cl, 10) > 0) {
      return NextResponse.json({ size: parseInt(cl, 10) });
    }

    const fullRes = await fetch(url);
    const blob = await fullRes.arrayBuffer();
    return NextResponse.json({ size: blob.byteLength });
  } catch {
    return NextResponse.json({ error: "Failed to fetch size" }, { status: 500 });
  }
}
