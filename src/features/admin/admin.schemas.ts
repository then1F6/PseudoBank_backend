import z from "zod";
import { Username } from "../../zutils/schema.util";

const OwnerPassword = z.object({
  password: z.string()
})
const UsernameObj = z.object({
  username: Username
})


export const sch = {
  OwnerPassword, Username: UsernameObj, UsernameStr: Username
}