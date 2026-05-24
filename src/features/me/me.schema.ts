import { SE } from "@/errors/error_codes";
import { VE } from "@/errors/validation_codes";
import { z } from "zod";

const password_field = (z.string().trim()
  .min(8, VE.PASSWORD_TOO_SHORT)
  .max(64, VE.PASSWORD_TOO_LONG)
  .regex(/^[a-zA-Z0-9_.!?]+$/, VE.PASSWORD_INVALID)
)

const Bio = z.object({
  bio: (
    z.string().trim()
    .min(1, VE.BIO_TOO_SHORT)
    .max(256, VE.BIO_TOO_LONG)
  )
})
const DisplayName = z.object({
  display_name: (
    z.string().trim()
    .min(4, VE.DISPLAY_NAME_TOO_SHORT)
    .max(32, VE.DISPLAY_NAME_TOO_LONG)
  )
})
const UpdateUsername = z.object({
  new_username: (
    z.string().trim()
    .min(4, VE.USERNAME_TOO_SHORT)
    .max(32, VE.USERNAME_TOO_LONG)
    .regex(/^[a-z][a-z0-9_]+$/, VE.USERNAME_INVALID)
  ),
  password: password_field
})
const UpdatePassword = ( z.object({
  password: password_field,
  new_password: password_field,
  confirm_new_password: z.string(),
}).refine(data => data.new_password === data.confirm_new_password, {
  message: VE.PASSWORDS_DONT_MATCH,
}))
const UpdateEmailDev = z.object({
  new_email: (z.email().trim().toLowerCase()
    .refine(val => val.endsWith("@gmail.com"), {
      message: SE.NOT_GMAIL,
  })),
  password: password_field,
  dev_password: z.string()
})

export const schemas = {
  UpdateEmailDev,
  UpdateUsername,
  UpdatePassword,
  Bio, 
  DisplayName
}
export namespace dto {
  export type UpdatePassword = ReturnType<typeof UpdatePassword.parse>
}