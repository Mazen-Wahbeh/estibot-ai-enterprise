import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/estimation";

export type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

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

export function badRequest(res: NextApiResponse, error: string): void {
  res.status(400).json({ ok: false, error } satisfies ApiResponse<never>);
}
