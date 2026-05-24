import { Hono } from "hono";
import type { AuthVars } from "~/types";
import { authGuard } from "@/middlewares/middlewares";

import { validate, validate_query } from "@/utils/api.util";

import { schemas as sch} from "./search.schema";
import { search_username, search_display_name } from "./search.serv";


const router = new Hono<{Variables: AuthVars}>()
router.use("*", authGuard)

router.get("/username", async (c) => {
  const { username_query } = await validate_query(sch.UsernameQuery, c)

  const res = await search_username(username_query)
  return c.json(res)
})
router.get("/display_name", async (c) => {
  const { name_query } = await validate_query(sch.DisplayNameQuery, c)

  const res = await search_display_name(name_query)
  return c.json(res)
})


export default router
