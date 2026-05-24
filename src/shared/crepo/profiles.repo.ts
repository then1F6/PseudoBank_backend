import type { Trx, DB } from "@/db/db";

import type { Insertable } from "kysely";
import type { profiles } from "@/db/models";

type InsertProfile = Insertable<profiles>

class ProfilesRepo {
  constructor() {}

  async get(db: DB, user_id: string) {
    return await db.selectFrom("profiles")
    .selectAll().where("user_id", "=", user_id).executeTakeFirst()
  } 

  async create(trx: Trx, insert: InsertProfile) {
    return await trx.insertInto("profiles").values({
      user_id: insert.user_id,
      display_name: insert.display_name,
      avatar: insert.avatar,
      balance: 100
    }).executeTakeFirstOrThrow()
  }
    
  async update_bio(trx: DB, user_id: string, bio: string)  {
    return await trx.updateTable("profiles").set({
      "bio": bio
    }).where("user_id", "=", user_id).executeTakeFirst()
  }
  async update_display_name(db: DB, user_id: string, name: string) {
    return await db.updateTable("profiles").set({
      "display_name": name
    }).where("user_id", "=", user_id).executeTakeFirst()
  }

  async update_avatar(db: DB, user_id: string, new_avatar: string, time: number) {
    return db.updateTable("profiles").set({
      avatar: new_avatar,
      avatar_updated_at: time
    }).where("user_id", "=", user_id).executeTakeFirst()
  }


  async decrease_balance(trx: Trx, user_id: string, amount: number) {
    return await trx.updateTable("profiles")
      .set(eb => ({ balance: eb("balance", "-", amount) }))
      .where("user_id", "=", user_id)
      .executeTakeFirst()
  }
  async decrease_balance_if_enough(trx: Trx, user_id: string, amount: number) {
    return await trx.updateTable("profiles")
      .set(eb => ({ balance: eb("balance", "-", amount) }))
      .where("user_id", "=", user_id)
      .where("balance", ">=", amount)
      .executeTakeFirst()
  }
  async increase_balance(trx: Trx, user_id: string, amount: number) {
    return await trx.updateTable("profiles")
      .set(eb => ({ balance: eb("balance", "+", amount) }))
      .where("user_id", "=", user_id)
      .executeTakeFirst()
  }

}

export default new ProfilesRepo()
