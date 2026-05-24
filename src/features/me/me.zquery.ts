import type { DB } from "@/db/db";

export async function get_me_full(db: DB, user_id: string) {
  const info = await db.selectFrom("users")
    .innerJoin("profiles", "users.id", "profiles.user_id").select([
      "users.username", "users.username_updated_at", "users.email","users.role",
      "profiles.display_name", "profiles.bio", "profiles.balance",
      "profiles.avatar", "profiles.avatar_updated_at"
    ])
    .where("users.id", "=", user_id).executeTakeFirst()
  return info
}
