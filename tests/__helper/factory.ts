import { str } from "./func"
import { create_email_jwt_dev, signup } from "../../src/features/auth/auth.serv"

import { CookieClient } from "./test_client"


export async function create_user_serv(email: string, name: string) {
  const jwt = await create_email_jwt_dev(email)
  const { access_token, refresh_token } = await signup({
    username: name,
    display_name: name,
    password: str(8), confirm_password: str(8)
  }, jwt)
  return `access_token=${access_token}; refresh_token=${refresh_token}`
}

export async function create_user(name: string) {
  const app = new CookieClient()

  const email = `${name}01@gmail.com`
  await app.post("/auth/signup/email", { email })
  await app.post("/auth/signup", {
    username: name,
    display_name: name,
    password: str(8), confirm_password: str(8)
  })
  return app
}