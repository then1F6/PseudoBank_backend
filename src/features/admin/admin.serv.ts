import { db } from "@/db/db";
import { HTTPError, Success} from "@/errors/errors";
import { get_admins, get_info_for_admin } from "./admin.zquery";



export async function get_admins_info() {
  const res = await get_admins(db)

  return new Success("admins", res)
}
export async function get_user_for_admin(username:  string) {
  const res = await get_info_for_admin(db, username)
  if (!res) { throw new HTTPError(404, "USER_NOT_FOUND") }

  return new Success("user", res)
}

