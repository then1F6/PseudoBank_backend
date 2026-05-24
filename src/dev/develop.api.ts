import { Hono } from "hono";

import { db } from "@/db/db";
import { validate_base } from "@/utils/api.util";
import { Username } from "@/utils/schema.util";
import { HTTPError } from "@/errors/errors";
import { devGuard } from "@/middlewares/middlewares";

import { say_hello_dev, get_all_users } from "./develop.serv"


const router = new Hono()
router.use("*", devGuard)

router.get("/test", async (c) => {
  const res = await say_hello_dev()
  return c.json(res)
})
router.get("/users", async (c) => {
  return c.json(await get_all_users())
})
router.get("/profiles", async (c) => {
  const res = await db.selectFrom("profiles")
    .selectAll().limit(100).execute()
  return c.json(res)
})
router.get("/trans", async (c) => {
  const res = await db.selectFrom("transactions")
  .leftJoin("users as sender", "sender.id", "transactions.from")
  .leftJoin("users as receiver", "receiver.id", "transactions.to")
  .select([
    "transactions.id", 
    "sender.username as sender", "receiver.username as receiver",
    "transactions.amount", "transactions.created_at",
  ]).orderBy("transactions.created_at", "desc").limit(100).execute()
  return c.json(res)
})
router.get("/notifics", async (c) => {
  const res = await db.selectFrom("notifications as n")
  .leftJoin("users as sender", "sender.id", "n.sender")
  .leftJoin("users as receiver", "receiver.id", "n.receiver")
  .select([
    "n.id", 
    "sender.username as sender", "receiver.username as receiver",
    "n.message", "n.created_at",
  ]).orderBy("n.created_at", "desc").limit(100).execute()
  return c.json(res)
})

router.get("/IDof/:username", async (c) => {
  const username = await validate_base(Username, c.req.param('username'))

  const res = await db.selectFrom("users")
  .select("id").where("username", "=", username)
  .executeTakeFirst()

  if (!res) { throw new HTTPError(404, "USER_NOT_FOUND") }
  return c.json({
    username: username,
    id: res.id
  })
})

export default router