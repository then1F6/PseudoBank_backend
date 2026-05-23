import { HTTPError } from "../zerrors/errors";
import type { Context, Next } from "hono";
import type { AuthVars } from "../types";


// you have to use them only after authGuard
export async function ownerGuard(c: Context<{Variables: AuthVars}>, next: Next) {
  if (c.var.payload.role !== "owner") { throw new HTTPError(403, "NOT_OWNER")}

  return await next()
}
export async function adminGuard(c: Context<{Variables: AuthVars}>, next: Next) {
  if (
    c.var.payload.role !== "owner" && c.var.payload.role !== "admin"
  ) { throw new HTTPError(403, "NOT_ADMIN")}

  return await next()
}
