import { Hono } from "hono";
import type { AuthVars } from "../../types";
import { schemas as sch } from "./me.schema";

import { authGuard } from "../auth/auth.serv";
import { validate } from "../../zutils/api.util";
import { get_me_info, change_bio, change_display_name,
  set_init_avatar, set_random_avatar, change_username, change_password,
  change_email_dev, get_my_sended_notifications, get_my_received_notifications,
  get_my_transactions_histrory,
} from "./me.serv";


const router = new Hono<{Variables: AuthVars}>({ strict: false })
router.use("*", authGuard)



router.get("/", async (c) => {
  const { user_id } = c.var.payload
  const res = await get_me_info(user_id)
  return c.json(res)
})
router.post("/change/bio", async (c) => {
  const { user_id } = c.var.payload
  const { bio } = await validate(sch.Bio, c)

  return c.json(await change_bio(user_id, bio))
})
router.post("/change/display_name", async (c) => {
  const { user_id } = c.var.payload
  const { display_name } = await validate(sch.DisplayName, c)

  return c.json(await change_display_name(user_id, display_name))
})

router.post("/avatar/random", async (c) => {
  const { user_id } = c.var.payload
  const res = await set_random_avatar(user_id)
  return c.json(res)
})
router.post("/avatar/init", async (c) => {
  const { user_id } = c.var.payload
  const res = await set_init_avatar(user_id)
  return c.json(res)
})

router.post("/change/username", async (c) => {
  const { user_id } = c.var.payload
  const { new_username, password } = await validate(sch.UpdateUsername, c)

  const res = await change_username(user_id, new_username, password)
  return c.json(res)
})
router.post("/change/password", async (c) => {
  const { user_id } = c.var.payload
  const updatePassword = await validate(sch.UpdatePassword, c)

  const res = await change_password(user_id, updatePassword)
  return c.json(res)
})
router.post("/change/email/dev", async (c) => {
  const { user_id } = c.var.payload
  const { 
    new_email,
    password, 
    dev_password
  } = await validate(sch.UpdateEmailDev, c)

  const res = await change_email_dev(user_id, new_email, password, dev_password)
  return c.json(res)
})


router.get("/notifications/sended", async (c) => {
  const { user_id } = c.var.payload
  const res = await get_my_sended_notifications(user_id)
  return c.json(res)
})
router.get("/notifications/received", async (c) => {
  const { user_id } = c.var.payload
  const res = await get_my_received_notifications(user_id)
  return c.json(res)
})

router.get("/transactions", async (c) => {
  const { user_id } = c.var.payload
  const res = await get_my_transactions_histrory(user_id)
  return c.json(res)
})

const me_router = router
export default me_router