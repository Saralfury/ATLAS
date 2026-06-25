import { NextResponse } from "next/server";

export async function forward(path: string, request?: Request) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const url = `${base}${path}`;
  const body = request && request.method !== "GET" ? await request.text() : undefined;
  const response = await fetch(url, {
    method: request?.method ?? "GET",
    body,
    headers: body ? { "Content-Type": request?.headers.get("content-type") ?? "application/json" } : undefined,
    cache: "no-store"
  });
  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" }
  });
}
