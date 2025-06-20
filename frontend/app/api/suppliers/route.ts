import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env['NEXT_PUBLIC_API_URL']!   // p.ej. "http://206.183.128.36:5500/api"

async function proxy(req: NextRequest, method: string) {
  const url = `${API_BASE}/suppliers${req.nextUrl.search}`
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
  };
  if (method !== "GET") {
    const body = await req.text();
    fetchOptions.body = body || null;
  }
  const upstream = await fetch(url, fetchOptions);
  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}

export const GET  = (req: NextRequest) => proxy(req, "GET")
export const POST = (req: NextRequest) => proxy(req, "POST")