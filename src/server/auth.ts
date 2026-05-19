import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";

const COOKIE_NAME = "estibot_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
  plan: string;
}

interface SessionTokenPayload {
  userId: string;
  tenantId: string;
  role: string;
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 20) {
    throw new Error("JWT_SECRET must be set to a strong value.");
  }
  return secret;
}

export function getAuthConfigurationError(): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 20) {
    return "Server auth is not configured. Set JWT_SECRET in Render Environment Variables to a long random value, then redeploy.";
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isSecureRequest(req: NextApiRequest): boolean {
  const host = req.headers.host ?? "";
  const forwardedProto = req.headers["x-forwarded-proto"];
  return forwardedProto === "https" || (process.env.NODE_ENV === "production" && !host.includes("localhost"));
}

export function setSessionCookie(req: NextApiRequest, res: NextApiResponse, user: SessionUser): void {
  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role
    } satisfies SessionTokenPayload,
    jwtSecret(),
    { expiresIn: SESSION_MAX_AGE_SECONDS }
  );

  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(req),
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS
    })
  );
}

export function clearSessionCookie(res: NextApiResponse): void {
  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0
    })
  );
}

export async function getSessionUser(req: NextApiRequest): Promise<SessionUser | null> {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, jwtSecret()) as SessionTokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { tenant: true }
    });

    if (!user || user.tenantId !== payload.tenantId) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      plan: user.tenant.plan
    };
  } catch {
    return null;
  }
}

export async function requireUser(req: NextApiRequest, res: NextApiResponse): Promise<SessionUser | null> {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: "Authentication required." });
    return null;
  }
  return user;
}
