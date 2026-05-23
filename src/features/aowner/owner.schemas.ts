import z from "zod";
import { Username } from "../../zutils/schema.util";

const OwnerPassword = z.object({
  password: z.string()
})
const UsernameObj = z.object({
  username: Username
})
const Notification = z.object({
  message: z.string().min(1).max(128)
})

export const sch = {
  OwnerPassword, UsernameObj, UsernameStr: Username, Notification
}