import type { DB } from "@/db/db";

export async function get_refresh(db: DB, refresh: string) {
  return await db.selectFrom("refreshs")
  .innerJoin("users", "users.id", "refreshs.user_id").select([
    "refreshs.expired_at", "refreshs.user_id", "users.role"
  ]).where("refreshs.token", "=", refresh).executeTakeFirst()
}