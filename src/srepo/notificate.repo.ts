import { type DB, type Trx } from "../zdb/db";
import type { Insertable } from "kysely";
import type { notifications } from "../zdb/models";

type Create = Insertable<notifications>


class NotificationsRepo {
  constructor() {}

  async get_last6(db: DB, user_id: string, time: number) {
    return db.selectFrom("notifications").select(["id", "receiver"])
    .where(eb => eb.and([
      eb("sender", "=", user_id),
      eb("created_at", ">=", time)
    ])
    ).limit(6).execute()
  }

  async create(db: DB, create: Create) {
    return db.insertInto("notifications").values({
      sender: create.sender,
      receiver: create.receiver,
      message: create.message
    }).executeTakeFirst()
  }

  async get_by_sender(db: DB, user_id: string) {
    return db.selectFrom("notifications as n")
    .leftJoin("users", "users.id", "n.receiver")
    .select([
      "n.id", "users.username as receiver", "n.message", "n.created_at",
    ]).where("n.sender", "=", user_id).limit(100)
    .orderBy("n.created_at", "desc").execute()
  }
  async get_by_receiver(db: DB, user_id: string) {
    return db.selectFrom("notifications as n")
    .leftJoin("users", "users.id", "n.sender")
    .select([
      "n.id", "users.username as sender", "n.message", "n.created_at",
    ]).where(eb => eb.or([
      eb("n.receiver", "=", user_id), eb("n.receiver", "is", null)
    ])).limit(100)
    .orderBy("n.created_at", "desc").execute()
  }
}
export default new NotificationsRepo()