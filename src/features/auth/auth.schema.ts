import { VE } from "../../zerrors/validation_codes"
import { z } from "zod"


const Username = (
  z.string().trim()
  .min(4, VE.USERNAME_TOO_SHORT)
  .max(32, VE.USERNAME_TOO_LONG)
  .regex(/^[a-z][a-z0-9_]+$/, VE.USERNAME_INVALID)
)
const SignupEmailDev = z.object({
  email: z.email().toLowerCase(),
  dev_password: z.string()
})
const UserSignup = (z.object({
  username: Username,
  display_name: (
    z.string({ error: VE.INVALID_TYPE}).trim()
    .min(4, VE.DISPLAY_NAME_TOO_SHORT)
    .max(32, VE.DISPLAY_NAME_TOO_LONG)
  ),
  password: (
    z.string().trim()
    .min(8, VE.PASSWORD_TOO_SHORT)
    .max(64, VE.PASSWORD_TOO_LONG)
    .regex(/^[a-zA-Z0-9_.!?]+$/, VE.PASSWORD_INVALID)
  ),
  confirm_password: z.string()

}).refine(data => data.password === data.confirm_password, {
  message: VE.PASSWORDS_DONT_MATCH,
  path: ["confirm_password"],
}) )
const UserLogin = z.object({
  email: (z.email().trim().toLowerCase()
    .refine(val => val.endsWith("@gmail.com"), {
      message: VE.LOGIN_INVALID,
  })),
  password: (z.string().trim()
    .min(8, VE.LOGIN_INVALID)
    .max(64,  VE.LOGIN_INVALID)
    .regex(/^[a-zA-Z0-9_.!?]+$/,  VE.LOGIN_INVALID)),
})
const GoogleAccess = z.object({
  token: (z.string()
    .min(100, VE.GOOGLE_TOKEN_INVALID)  
    .max(4000, VE.GOOGLE_TOKEN_INVALID) 
    .regex(/^[A-Za-z0-9._-]+$/, VE.GOOGLE_TOKEN_INVALID)
  )
})


export const schemas = {
  UserSignup,
  UserLogin,
  GoogleAccess,
  Username: z.object({ username: Username}),
  SignupEmailDev,
}
export namespace dto {
  export type SignupInput = ReturnType<typeof UserSignup.parse>
  export type UserLogins = ReturnType<typeof UserLogin.parse>
}