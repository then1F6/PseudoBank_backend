import { VE } from "@/errors/validation_codes"
import z from "zod"

const UsernameQuery = z.object({
  username_query: z.string().trim()
    .min(4, VE.USERNAME_TOO_SHORT)
    .max(32, VE.USERNAME_TOO_LONG)
    .regex(/^[a-z][a-z0-9_]+$/, VE.USERNAME_INVALID)
})
const DisplayNameQuery = z.object({
  name_query: z.string().trim()
    .min(4, VE.DISPLAY_NAME_TOO_SHORT)
    .max(32, VE.DISPLAY_NAME_TOO_LONG)
})


export const schemas = {
  UsernameQuery, DisplayNameQuery
} 