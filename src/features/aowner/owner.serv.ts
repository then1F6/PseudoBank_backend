import { config } from "~/config";
import { db } from "@/db/db";
import { safe_equal } from "@/utils/hash.util";
import { HTTPError, Success} from "@/errors/errors";
import usersRepo from "@/crepo/users.repo";
import notificateRepo from "@/crepo/notificate.repo";
import { get_info_for_owner } from "./owner.zquery"


export async function become_owner(user_id: string, password: string) {
  const is_match = safe_equal(password, config.OWNER_PASSWORD)

  if (!is_match) { throw new HTTPError(403, "INCORRECT_PASSWORD")}

  const res = await usersRepo.become_owner(db, user_id)
  if (!res?.username) { throw new HTTPError(404, "USER_NOT_FOUND")}

  console.log(`[ WARNING ]  user @${res.username} became owner!`)
  return new Success("you are owner", { username: res.username })
}

export async function make_admin(username: string) {
  const res = await usersRepo.become_admin(db, username)
  if (!res.numUpdatedRows) { throw new HTTPError(404, "USER_NOT_FOUND") }

  return new Success("made an admin", { username })
}
export async function demote_admin(username: string) {
  const res = await usersRepo.demote_admin(db, username)
  if (!res.numUpdatedRows) { throw new HTTPError(404, "USER_NOT_FOUND") }

  return new Success("demoted an admin", { username })
}
export async function get_user_for_owner(username:  string) {
  const res = await get_info_for_owner(db, username)
  if (!res) { throw new HTTPError(404, "USER_NOT_FOUND") }

  return new Success("user", res)
}

export async function send_notification_everyone(message: string) {
  const res = await notificateRepo.create(db, {
    sender: null,
    receiver: null,
    message: message
  })
  if (!res.numInsertedOrUpdatedRows) {
    throw new HTTPError(400, "SOMETHING_WRONG")
  }

  return new Success("notificaion sent for everyone")
}
