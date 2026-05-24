import type { DB } from "@/db/db";

export async function get_user_profile(db: DB, username: string) {
  return await db.selectFrom("users")
    .innerJoin("profiles", "users.id", "profiles.user_id").select([
      "avatar", "display_name", "username", "bio", "role"
    ])
    .where("users.username", "=", username).executeTakeFirst()
}