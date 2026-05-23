import { Success } from "../../zerrors/errors";
import { db } from "../../zdb/db";
import { search_by_username, search_by_display_name } from "./search.zquery";

export async function search_username(query: string) {
  const res = await search_by_username(db, query)
  return new Success("serched by username", res)
}
export async function search_display_name(query: string) {
  const res = await search_by_display_name(db, query)
  return new Success("serched by display name", res)
}