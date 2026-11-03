import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response | unknown>;

/** Wraps a route handler: JSON-serialises results and maps errors to responses. */
export function api<C = unknown>(handler: Handler<C>) {
  return async (req: Request, ctx: C) => {
    try {
      const result = await handler(req, ctx);
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (e) {
      unstable_rethrow(e);
      if (e instanceof ApiError) {
        return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
      }
      if (e instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: z.flattenError(e), fieldErrors: z.flattenError(e).fieldErrors },
          { status: 400 },
        );
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2003") return NextResponse.json({ error: "Referenced record does not exist" }, { status: 400 });
        if (e.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
        if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      console.error(e);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}

export type IdCtx = { params: Promise<{ id: string }> };
