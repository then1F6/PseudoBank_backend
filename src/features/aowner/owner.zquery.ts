import type { DB, Trx } from "../../zdb/db";

export async function get_info_for_owner(db: DB, username: string) {
  return db.selectFrom("users as u")
  .where("username", "=", username)
  .innerJoin("profiles as p", "p.user_id", "u.id")
  .selectAll()
  .executeTakeFirst()
}