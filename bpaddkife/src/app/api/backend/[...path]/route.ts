import type { NextRequest } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:3000/api/v1";
const API_KEY = process.env.BACKEND_API_KEY ?? "dev-api-key-change-me";

type RouteParams = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;

  const base = API_BASE_URL.replace(/\/+$/, "");
  const target = new URL(
    `${base}/${path.map((segment) => encodeURIComponent(segment)).join("/")}`,
  );
  target.search = request.nextUrl.search;

  const method = request.method.toUpperCase();
  const headers = new Headers({
    Accept: "application/json",
    "X-API-Key": API_KEY,
  });

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await request.text();
    if (body) {
      headers.set("Content-Type", "application/json");
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return Response.json(
      {
        message: isTimeout
          ? "Backend tidak merespons dalam batas waktu. Coba lagi."
          : "Backend tidak dapat dihubungi. Pastikan server NestJS berjalan di port 3000.",
      },
      { status: isTimeout ? 504 : 502 },
    );
  }

  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const text = await upstream.text();
  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("Content-Type", contentType);
  const requestId = upstream.headers.get("x-request-id");
  if (requestId) responseHeaders.set("X-Request-Id", requestId);

  return new Response(text, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteParams) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteParams) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteParams) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return proxy(request, context);
}
