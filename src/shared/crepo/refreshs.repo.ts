import type { Trx, DB } from "@/db/db";

import type { Insertable, Kysely } from "kysely";
import type { refreshs } from "@/db/models";

type InsertRefresh = Insertable<refreshs>

class RefreshsRepo {
  constructor() {}

  async get(trx: DB, token: string) {
    return await trx
      .selectFrom("refreshs").selectAll()
      .where("token", "=", token).executeTakeFirst()
  }

  async create(trx: Trx, insert: InsertRefresh) {
    return await trx.insertInto("refreshs").values({
      user_id: insert.user_id,
      token: insert.token,
      expired_at: insert.expired_at
    }).execute()
  }
  async delete(db: DB, token: string) {
    return await db.deleteFrom("refreshs")
      .where("token", "=", token).execute()
  }
}

export default new RefreshsRepo