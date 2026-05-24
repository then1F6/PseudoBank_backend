import { Hono } from "hono";
import { authGuard } from "../auth/auth.serv";
import { validate, validate_base } from "@/utils/api.util";
import { adminGuard } from "@/utils/middleware.util";
import type { AuthVars } from "~/types";

import { sch } from "./admin.schemas";
import { get_admins_info, get_user_for_admin,} from "./admin.serv";


const router = new Hono<{Variables: AuthVars}>()
router.use("*", authGuard, adminGuard)


router.get("/all", async (c) => {
  const res = await get_admins_info()
  return c.json(res)
})
router.get("/user/:username", async (c) => {
  const username = await validate_base(sch.UsernameStr, c.req.param('username'))
  const res = await get_user_for_admin(username)

  return c.json(res)
})



const admin_router = router
export default admin_router