import { Hono, type Context } from "hono"
const auth_router = new Hono()

import { string, z } from "zod"
import { setCookie, getCookie } from "hono/cookie"
import { signup, create_email_jwt, create_email_jwt_dev,
  is_unique_username, login_google, login, get_access, logout
} from "./auth.serv"
import { schemas as sch } from "./auth.schema"
import { validate } from "../../zutils/api.util"
import { Success } from "../../zerrors/errors"

function set_cookie(c: Context, access_token: string, refresh_token: string) {
  setCookie(c, "access_token", access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 3600
  })
  setCookie(c, "refresh_token", refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 2_592_000
  })
  return c.json(new Success("created"))
}



auth_router.post("/signup/email/dev", async (c) => {
  const { email, dev_password} = await validate(z.object({
    email: z.email().toLowerCase(),
    dev_password: z.string()
  }), c)

  const jwt = await create_email_jwt_dev(email, dev_password)
  setCookie(c, "email_jwt", jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 3600
  })
  return c.json(new Success("verified"))
})
auth_router.post("/signup/google", async (c) => {
  const { token } = await validate(sch.GoogleAccess, c)

  const EmailJWT = await create_email_jwt(token)
  setCookie(c, "email_jwt", EmailJWT, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 3600
  })
  return c.json(new Success("verified"))
})
auth_router.post("/signup/username", async (c) => {
  const { username } = await validate(sch.Username, c)

  const res = await is_unique_username(username)
  return c.json(res)
})


auth_router.post("/signup", async (c) => {
  const signupUser = await validate(sch.UserSignup, c)
  const email_jwt = getCookie(c, "email_jwt")

  const { access_token, refresh_token } = await signup(signupUser, email_jwt)
  
  return set_cookie(c, access_token, refresh_token)
})
auth_router.post("/login/google", async (c) => {
  const { token } = await validate(sch.GoogleAccess, c)
  const {access_token, refresh_token} = await login_google(token)

  return set_cookie(c, access_token, refresh_token)
})
auth_router.post("/login", async (c) => {
  const userLogin = await validate(sch.UserLogin, c)
  const {access_token, refresh_token} = await login(userLogin)

  return set_cookie(c, access_token, refresh_token)
})


auth_router.post("/get_access", async (c) => {
  const refresh_token = getCookie(c, "refresh_token")
  const access_token = await get_access(refresh_token)

  setCookie(c, "access_token", access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 3600
  })
  return c.json(new Success("token created"))
})

auth_router.post("/logout", async (c) => {
  const refresh_token = getCookie(c, "refresh_token")
  const res = logout(refresh_token)

  setCookie(c, "access_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0
  })
  setCookie(c, "refresh_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0
  })
  return c.json(res)
})



export default auth_router