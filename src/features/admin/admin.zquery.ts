import type { DB, Trx } from "@/db/db";


export async function get_admins(db: DB) {
  return await db.selectFrom("users as u")
    .where("u.role", "=", "admin")
    .innerJoin("profiles as p", "u.id", "p.user_id")
    .select([
      "u.username", "p.avatar", "p.display_name",
    ])
    .limit(100).execute()
}
export async function get_info_for_admin(db: DB, username: string) {
  return db.selectFrom("users as u")
  .where("username", "=", username)
  .innerJoin("profiles as p", "p.user_id", "u.id")
  .select([
    "u.email", "u.role", "u.username",
    "p.avatar", "p.display_name", "p.balance", "p.bio",
  ]).executeTakeFirst()
}