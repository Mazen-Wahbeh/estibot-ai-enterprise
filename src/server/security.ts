import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/estimation";

const publicBuckets = new Map<string, number[]>();
const MAX_JSON_BYTES = 256 * 1024;

function requestHost(req: NextApiRequest): string {
  const forwardedHost = req.headers["x-forwarded-host"];
  return (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? req.headers.host ?? "";
}

function requestProtocol(req: NextApiRequest): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const host = requestHost(req);
  if (host.includes("localhost") || host.startsWith("127.0.0.1")) {
    return "http";
  }
  return (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ?? (process.env.NODE_ENV === "production" ? "https" : "http");
}

function normalizeOrigin(value?: string): string | null {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function expectedOrigin(req: NextApiRequest): string | null {
  const host = requestHost(req);
  if (!host) {
    return null;
  }
  return `${requestProtocol(req)}://${host}`;
}

export function getClientIp(req: NextApiRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return raw?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
}

export function applyApiSecurityHeaders(res: NextApiResponse): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
}

export function enforcePayloadSize(req: NextApiRequest, res: NextApiResponse): boolean {
  const contentLength = Number(req.headers["content-length"] ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BYTES) {
    res.status(413).json({ ok: false, error: "Request body is too large." } satisfies ApiResponse<never>);
    return false;
  }
  return true;
}

export function enforceJsonRequest(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
    return true;
  }
  const contentType = req.headers["content-type"] ?? "";
  if (!String(contentType).toLowerCase().includes("application/json")) {
    res.status(415).json({ ok: false, error: "Content-Type must be application/json." } satisfies ApiResponse<never>);
    return false;
  }
  return true;
}

export function enforceSameOrigin(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH" && req.method !== "DELETE") {
    return true;
  }

  const expected = expectedOrigin(req);
  if (!expected) {
    res.status(403).json({ ok: false, error: "Unable to verify request origin." } satisfies ApiResponse<never>);
    return false;
  }

  const origin = normalizeOrigin(Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin);
  const referer = normalizeOrigin(Array.isArray(req.headers.referer) ? req.headers.referer[0] : req.headers.referer);
  const candidate = origin ?? referer;

  if (!candidate) {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    res.status(403).json({ ok: false, error: "Missing request origin." } satisfies ApiResponse<never>);
    return false;
  }

  if (candidate !== expected) {
    res.status(403).json({ ok: false, error: "Cross-origin request blocked." } satisfies ApiResponse<never>);
    return false;
  }

  return true;
}

export function enforcePublicRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number
): boolean {
  const key = `${scope}:${getClientIp(req)}:${identifier.toLowerCase()}`;
  const now = Date.now();
  const recent = (publicBuckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    publicBuckets.set(key, recent);
    res.status(429).json({ ok: false, error: "Too many requests. Please wait before trying again." } satisfies ApiResponse<never>);
    return false;
  }
  recent.push(now);
  publicBuckets.set(key, recent);
  return true;
}
