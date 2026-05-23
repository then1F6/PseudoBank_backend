import z from "zod"
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { DatabaseError } from "pg"
import { config } from "../../config";

import { type Trx, db } from "../../zdb/db";
import type { dto } from "./auth.schema";
import type { GoogleUserInfo, access_payload, AuthVars } from "../../types"

import usersRepo from "../../srepo/users.repo";
import profilesRepo from "../../srepo/profiles.repo";
import refreshsRepo from "../../srepo/refreshs.repo";
import { get_refresh } from "./auth.zquery";
import { HTTPError, Success, ValidationError } from "../../zerrors/errors";
import { generate_avatar } from "../../zutils/avatar.util";
import { sha512, safe_equal } from "../../zutils/hash.util";

import { SignJWT, jwtVerify } from "jose";


async function decode_jwt(jwt: string | undefined ) {
  if (!jwt) throw new HTTPError(401, "NOT_JWT")
  try {
    const { payload } = await jwtVerify(jwt, config.SECRET_JWT)
    return payload
  } catch { throw new HTTPError(401, "INVALID_JWT")}
}
async function verify_google(token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new HTTPError(401, "INVALID_GOOGLE_TOKEN")
  }
  const user = (await res.json()) as GoogleUserInfo
  if (!user.email || !user.email_verified) {
    throw new HTTPError(400, "EMAIL_NOT_VERIFIED");
  } else if (!user.email.endsWith("@gmail.com")) {
    throw new HTTPError(400, "NOT_GMAIL");
  }
  return user.email
}


export async function create_email_jwt_dev(email: string, dev_password: string) {
  const is_match = safe_equal(dev_password, config.DEV_EMAIL_PASSWORD)

  if (!is_match) { throw new HTTPError(403, "INCORRECT_PASSWORD")}

  const unique = await usersRepo.is_unique_email(db, email)
  if (!unique) { throw new HTTPError(409, "EMAIL_TAKEN") }

  const EmailJWT = await new SignJWT({ email: email })
    .setProtectedHeader({alg: 'HS256'}).setExpirationTime("15m")
    .sign(config.SECRET_JWT)
  return EmailJWT
}
export async function create_email_jwt(token: string) {
  const email = await verify_google(token)

  const unique = await usersRepo.is_unique_email(db, email)
  if (!unique) throw new HTTPError(409, "EMAIL_TAKEN")

  const EmailJWT = await new SignJWT({ email: email })
    .setProtectedHeader({alg: 'HS256'}).setExpirationTime("15m")
    .sign(config.SECRET_JWT)

  return EmailJWT
}
export async function is_unique_username(username: string) {
  const unique = await usersRepo.is_unique_username(db, username)

  if (!unique) { throw new HTTPError(409, "USERNAME_TAKEN") } 
  return new Success("username is unique", username)
}


export async function signup(signupUser: dto.SignupInput, email_jwt: string | undefined) {
  const payload = await decode_jwt(email_jwt) as { email: string }
  if (!payload.email) { throw new HTTPError(401, "EMAIL_TOKEN_EXPIRED")}

  try {
    const password_hash = await sha512(signupUser.password)
    const refresh = crypto.randomUUID()

    const user_id = await db.transaction().execute(async (trx: Trx) => {
      const { id } =  await usersRepo.create(trx, {
        email: payload.email,
        username: signupUser.username,
        password_hash: password_hash,
      })
      const avatar = await generate_avatar(id)
      
      await profilesRepo.create(trx, {
        user_id: id,
        display_name: signupUser.display_name,
        avatar: avatar
      })
      await refreshsRepo.create(trx, {
        user_id: id,
        token: refresh,
        expired_at: Math.floor(Date.now() / 1000) + 2_592_000
      })
      return id
    })

    const access_token = await new SignJWT({
      user_id,
      role: "user"
    }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h")
    .sign(config.SECRET_JWT)

    return { access_token, refresh_token: refresh }
  } catch (e) {
    if (e instanceof HTTPError) { throw e }
    if (e instanceof DatabaseError) {
      switch (e.constraint) {
        case 'users_username_key': throw new HTTPError(409, "USERNAME_TAKEN")
        case 'users_email_key': throw new HTTPError(409, "EMAIL_TAKEN")
      }
    }
    console.log(e)
    throw new HTTPError(400, "SOMETHING_WRONG")
  }
} 
export async function login_google(token: string) {
  const email = await verify_google(token)

  const unique = await usersRepo.is_unique_email(db, email)
  if (unique) throw new HTTPError(409, "USER_NOT_FOUND")


  const refresh = crypto.randomUUID()

  const user_id = await db.transaction().execute(async (trx) => {
    const user = await usersRepo.get_user(trx, email)
    if (!user) throw new HTTPError(409, "USER_NOT_FOUND")
    
    await refreshsRepo.create(trx, {
      user_id: user.id,
      token: refresh,
      expired_at: Math.floor(Date.now() / 1000) + 2_592_000
    })
    return user.id
  })
  

  const access_token = await new SignJWT({
    user_id,
    role: "user"
  }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h")
  .sign(config.SECRET_JWT)

  return { access_token, refresh_token: refresh }
}
export async function login(userLogin: dto.UserLogins) {
  const refresh_token = crypto.randomUUID()
  const password_hash = await sha512(userLogin.password)

  try {
    const [user_id, user_role] = await db.transaction().execute(async (trx) => {
      const user_db = await usersRepo.get_user(trx, userLogin.email)
      const password_hash_db = user_db?.password_hash

      if (!password_hash_db) { throw new HTTPError(409, "INCORRECT_EMAIL_OR_PASSWORD") }

      const isMatch = password_hash === password_hash_db
      if (!isMatch) { throw new HTTPError(409, "INCORRECT_EMAIL_OR_PASSWORD") } 

      await refreshsRepo.create(trx, {
        user_id: user_db.id,
        token: refresh_token,
        expired_at: Math.floor(Date.now() / 1000) + 2_592_000
      })
      return [user_db.id, user_db.role] as const
    })
    const access_token = await new SignJWT({ user_id, role: user_role })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h")
    .sign(config.SECRET_JWT)
   
    return { access_token, refresh_token }
  } catch (e) {
    if (e instanceof HTTPError) { throw e }
    console.log(e)
    throw new HTTPError(400, "SOMETHING_WRONG")
  }
}


export async function get_access(refresh: string | undefined) {
  if (!refresh) { throw new HTTPError(401, "NOT_REFRESH_TOKEN")}

  const res = await get_refresh(db, refresh)
  if (!res) { throw new HTTPError(401, "REFRESH_NOT_FOUND") }

  if (res.expired_at < Math.floor(Date.now() / 1000)) {
    refreshsRepo.delete(db, refresh).catch(() => {})
    throw new HTTPError(401, "REFRESH_TOKEN_EXPIRED")
  }

  const access_token = await new SignJWT({ user_id: res.user_id, role: res.role, })
    .setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h")
    .sign(config.SECRET_JWT)

  return access_token
}
export function logout(refresh: string | undefined) {
  if (!refresh) { throw new HTTPError(401, "REFRESH_NOT_FOUND")}
  
  refreshsRepo.delete(db, refresh).catch(() => {})
  return new Success("logged out")
}


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