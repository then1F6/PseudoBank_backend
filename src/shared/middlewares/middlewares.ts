import z from "zod";
import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";

import { HTTPError, ValidationError } from "@/errors/errors";
import type { AuthVars, access_payload } from "~/types";
import { decode_jwt } from "@/utils/jwt.util";
import { config } from "~/config";


export async function authGuard(c: Context<{Variables: AuthVars}>, next: Next) {

  const access_token = getCookie(c, "access_token")
  if (!access_token) {throw new HTTPError(401, "NOT_ACCESS_TOKEN")}

  const payload = await decode_jwt(access_token) as unknown as access_payload

  const impersonate_user_id = c.req.header("X-Impersonate-User-Id")
  if (impersonate_user_id && payload.role === "owner") {
    if (!z.uuid().safeParse(impersonate_user_id).success) {
      throw new ValidationError("INVALID_UUID")
    }
    console.log("[ WARNING ] owner is impersonating user with id "+impersonate_user_id+" (real user id: "+payload.user_id+")")
    payload.user_id = impersonate_user_id
    payload.role = "user"
  }

  c.set("payload", payload)

  return await next()
}

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

export async function devGuard(c: Context, next: Next) {
  if (config.RUN_NODE !== "DEV") { throw new HTTPError(403, "NOT_DEV")}

  return await next()
}