import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/estimation";
import { enforceRequestRateLimit } from "@/server/rateLimit";
import { requireUser, type SessionUser } from "@/server/auth";

export type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
export type ProtectedApiHandler = (req: NextApiRequest, res: NextApiResponse, user: SessionUser) => Promise<void>;

export function withPost(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      res.status(405).json({ ok: false, error: "Method not allowed. Use POST." } satisfies ApiResponse<never>);
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      console.error("API handler failure", error);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: "The server could not complete the request." } satisfies ApiResponse<never>);
      }
    }
  };
}

export function withGet(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      res.status(405).json({ ok: false, error: "Method not allowed. Use GET." } satisfies ApiResponse<never>);
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      console.error("API handler failure", error);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: "The server could not complete the request." } satisfies ApiResponse<never>);
      }
    }
  };
}

export function withMethods(methods: string[], handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    if (!req.method || !methods.includes(req.method)) {
      res.setHeader("Allow", methods.join(", "));
      res.status(405).json({ ok: false, error: `Method not allowed. Use ${methods.join(" or ")}.` } satisfies ApiResponse<never>);
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      console.error("API handler failure", error);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, error: "The server could not complete the request." } satisfies ApiResponse<never>);
      }
    }
  };
}

export function withProtectedPost(handler: ProtectedApiHandler): ApiHandler {
  return withPost(async (req, res) => {
    const user = await requireUser(req, res);
    if (!user || !enforceRequestRateLimit(req, res, user)) {
      return;
    }
    await handler(req, res, user);
  });
}

export function withProtectedMethods(methods: string[], handler: ProtectedApiHandler): ApiHandler {
  return withMethods(methods, async (req, res) => {
    const user = await requireUser(req, res);
    if (!user || !enforceRequestRateLimit(req, res, user)) {
      return;
    }
    await handler(req, res, user);
  });
}

export function badRequest(res: NextApiResponse, error: string): void {
  res.status(400).json({ ok: false, error } satisfies ApiResponse<never>);
}
