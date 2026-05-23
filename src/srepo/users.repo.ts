import type { Trx, DB } from "../zdb/db";

import type { Insertable } from "kysely";
import type { users } from "../zdb/models";

type InsertUser = Insertable<users>
type TRX = DB | Trx

class UsersRepo {
  async get_all (db: DB){
    return await db.selectFrom("users").selectAll().limit(100).execute()
  }

  async is_unique_username(db: DB, username: string) {
    const user = await db.selectFrom("users")
      .select("id").where("username", "=", username).executeTakeFirst()
    
    return !user
  }
  async is_unique_email(db: DB, email: string) {
    const user = await db.selectFrom("users")
      .select("id").where("email", "=", email).executeTakeFirst()
    
    return !user
  }

  async get_user(db: DB, email: string) {
    const user = await db.selectFrom("users").selectAll()
    .where("email", "=", email).executeTakeFirst()

    return user
  }
  async get_user_by_id(db: DB, user_id: string) {
    return await db.selectFrom("users").selectAll()
    .where("id", "=", user_id).executeTakeFirst()
  }
  async get_user_by_name(trx: TRX, username: string) {
    return await trx.selectFrom("users").selectAll()
    .where("username", "=", username).executeTakeFirst()
  }

  async create(trx: Trx, signupUser: InsertUser) {
    return await trx.insertInto("users").values({
      "email": signupUser.email,
      "username": signupUser.username,
      "password_hash": signupUser.password_hash
    }).returning("id").executeTakeFirstOrThrow()
  }

  async update_username(trx: TRX, user_id: string, new_username: string, time: number) {
    return trx.updateTable("users").set({
      "username": new_username,
      "username_updated_at": time
    }).where("id", "=", user_id).executeTakeFirst()
  }
  async update_password(trx: TRX, user_id: string, new_password: string) {
    return trx.updateTable("users").set({
      "password_hash": new_password
    }).where("id", "=", user_id).executeTakeFirst()
  }
  async update_email(trx: TRX, user_id: string, new_email: string) {
    return trx.updateTable("users").set({
      "email": new_email
    }).where("id", "=", user_id).executeTakeFirst()
  }

  async become_owner(db: DB, user_id: string) {
    return await db.updateTable("users").set({
      "role": "owner"
    }).where("id", "=", user_id)
    .returning("username").executeTakeFirst()
  }
  async become_admin(db: DB, username: string) {
    return await db.updateTable("users").set({
      "role": "admin"
    }).where("username", "=", username)
    .executeTakeFirst()
  }
  async demote_admin(db: DB, username: string) {
    return await db.updateTable("users").set({
      "role": "user"
    }).where("username", "=", username)
    .executeTakeFirst()
  }
}

export default new UsersRepo()