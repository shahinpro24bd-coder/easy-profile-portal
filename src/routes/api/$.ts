import { createFileRoute } from "@tanstack/react-router";

// Forwards /api/* to the clinic's existing backend so all current data keeps working.
const DEFAULT_BACKEND = "https://api.luckydentalcare.com";

async function proxy({ request, params }: { request: Request; params: { _splat?: string } }) {
  const base = (process.env["BACKEND_URL"] || DEFAULT_BACKEND).replace(/\/$/, "");
  const apiBase = base.endsWith("/api") ? base : `${base}/api`;
  const incoming = new URL(request.url);
  const target = `${apiBase}/${params._splat ?? ""}${incoming.search}`;

  const headers = new Headers(request.headers);
  ["host", "origin", "referer", "content-length", "accept-encoding", "connection"].forEach((h) => headers.delete(h));

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const res = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : null,
    redirect: "manual",
  });

  const out = new Headers(res.headers);
  ["content-encoding", "content-length", "transfer-encoding", "connection"].forEach((h) => out.delete(h));
  // Rewrite cookie domain so session cookies stick to this site.
  const cookies = res.headers.getSetCookie?.() ?? [];
  if (cookies.length) {
    out.delete("set-cookie");
    cookies.forEach((c) => out.append("set-cookie", c.replace(/;\s*domain=[^;]*/i, "")));
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: { GET: proxy, POST: proxy, PUT: proxy, PATCH: proxy, DELETE: proxy, OPTIONS: proxy },
  },
});
