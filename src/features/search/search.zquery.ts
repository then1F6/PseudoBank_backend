import { sql } from "kysely";
import type { DB } from "../../zdb/db";

export async function search_by_username(db: DB, query: string) {
  const lower = query.toLowerCase();

  return db.selectFrom("users")
    .innerJoin("profiles as p", "p.user_id", "users.id")
    .select([ 
      "username", "role", "p.avatar",
    ])
    .where(sql`lower(username)`, 'like', `${lower}%`)
    .orderBy(sql`length(username)`, 'asc')
    .limit(100).execute()
} 

export async function search_by_display_name(db: DB, query: string) {
  const lower = query.toLowerCase();

  return db.selectFrom("profiles as p")
    .innerJoin("users as u", "p.user_id", "u.id")
    .select([ 
      "u.username", "p.display_name", "u.role", "p.avatar"
    ])
    .where(sql`lower(p.display_name)`, 'like', `${lower}%`)
    .orderBy(sql`length(p.display_name)`, 'asc')
    .limit(100).execute()
} 