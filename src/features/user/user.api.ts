import { Hono } from "hono";
import type { AuthVars } from "~/types";
import { authGuard } from "../auth/auth.serv";
import { validate, validate_base } from "@/utils/api.util";

import { get_user_info, transfer_money, make_reqest_money } from "./user.serv";
import { schemas as sch } from "./user.schema"


const router = new Hono<{Variables: AuthVars}>()
router.use("*", authGuard)

router.get("/:username", async (c) => {
  const username = await validate_base(sch.Username, c.req.param('username'))

  const res = await get_user_info(username)
  return c.json(res)
})

router.post("/act/transfer", async (c) => {
  const { user_id } = c.var.payload
  const transfer_data = await validate(sch.Transfer, c)

  const res = await transfer_money(user_id, transfer_data)
  return c.json(res)
})
router.post("/act/request", async (c) => {
  const { user_id } = c.var.payload
  const { to_username } = await validate(sch.MoneyRequest, c)

  const res = await make_reqest_money(user_id, to_username)
  return c.json(res)
})

export default router