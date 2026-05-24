import { Hono } from "hono";
import { authGuard } from "../auth/auth.serv";
import { validate, validate_base } from "@/utils/api.util";
import { ownerGuard } from "@/utils/middleware.util";
import type { AuthVars } from "~/types";

import { sch } from "./owner.schemas";
import { become_owner, make_admin, demote_admin, 
  get_user_for_owner, send_notification_everyone
} from "./owner.serv";


const router = new Hono<{Variables: AuthVars}>()
router.use("*", authGuard)


router.post("/init", async (c) => {
  const { user_id } = c.var.payload
  const { password } = await validate(sch.OwnerPassword, c)

  const res = await become_owner(user_id, password)
  return c.json(res)
  
})
router.post("/make_admin", ownerGuard, async (c) => {
  const { username } = await validate(sch.UsernameObj, c)

  const res = await make_admin(username)
  return c.json(res)
})
router.post("/demote_admin", ownerGuard, async (c) => {
  const { username } = await validate(sch.UsernameObj, c)

  const res = await demote_admin(username)
  return c.json(res)
})
router.get("/user/:username", ownerGuard, async (c) => {
  const username = await validate_base(sch.UsernameStr, c.req.param('username'))

  const res = await get_user_for_owner(username)
  return c.json(res)
})

router.post("/act/notification", ownerGuard, async (c) => {
  const { message } = await validate(sch.Notification, c)

  const res = await send_notification_everyone(message)
  return c.json(res)
})



const owner_router = router
export default owner_router