import { VE } from "@/errors/validation_codes"
import z from "zod"

export const Username = (
  z.string().trim()
  .min(4, VE.USERNAME_TOO_SHORT)
  .max(32, VE.USERNAME_TOO_LONG)
  .regex(/^[a-z][a-z0-9_]+$/, VE.USERNAME_INVALID)
)

export const Password = (
  z.string().trim()
  .min(8, VE.PASSWORD_TOO_SHORT)
  .max(64,  VE.PASSWORD_TOO_LONG)
  .regex(/^[a-zA-Z0-9_.!?]+$/,  VE.PASSWORD_INVALID)
)

export const Email = (
  z.email().trim().toLowerCase()
  .refine(val => val.endsWith("@gmail.com"), {
    message: VE.EMAIL_INVALID,
}))