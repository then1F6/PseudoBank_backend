import { HTTPError, Success } from "../../zerrors/errors";
import { DatabaseError } from "pg"

import type { dto } from "./me.schema";
import { generate_avatar} from "../../zutils/avatar.util";
import { sha512 } from "../../zutils/hash.util";

import profilesRepo from "../../srepo/profiles.repo";
import usersRepo from "../../srepo/users.repo";
import { get_me_full } from "./me.zquery";

import { db } from "../../zdb/db";
import notificateRepo from "../../srepo/notificate.repo";
import transactionRepo from "../../srepo/transaction.repo";


async function verify_password(user_id: string, password: string) {
  const user = await usersRepo.get_user_by_id(db, user_id)
  if (!user) {throw new HTTPError(404, "USER_NOT_FOUND")}

  const hash_password = await sha512(password)
  const is_match = user.password_hash === hash_password
  if (!is_match) {throw new HTTPError(401, "INCORRECT_PASSWORD")}

  return user
}


export async function get_me_info(user_id: string) {
  const info = await get_me_full(db, user_id)

  if (!info) {throw new HTTPError(404, "USER_NOT_FOUND")}

  return new Success("my info", info)
}


export async function change_bio(user_id: string, bio: string) {
  const res = await profilesRepo.update_bio(db, user_id, bio)
  if (!res.numUpdatedRows) {throw new HTTPError(404, "USER_NOT_FOUND")}

  return new Success("bio changed success")
}
export async function change_display_name(user_id: string, name: string) {
  const res = await profilesRepo.update_display_name(db, user_id, name)
  if (!res.numUpdatedRows) {throw new HTTPError(404, "USER_NOT_FOUND")}

  return new Success("display name changed success")
}

export async function change_username(
  user_id: string, new_username: string, password: string
) {
  const user = await verify_password(user_id, password)
  
  const now = Math.floor(Date.now() / 1000)
  const cooldown = 24 * 3600

  if (user.username_updated_at !== 0 
  && (now - user.username_updated_at) < cooldown) {
    throw new HTTPError(429, "USERNAME_COOLDOWN")
  }

  try {
    const res = await usersRepo.update_username(db, user_id, new_username, now)
    if (!res.numUpdatedRows) { throw new HTTPError(404, "USER_NOT_FOUND") }
    return new Success("username updated", new_username)

  } catch (e) {
    if (e instanceof HTTPError) { throw e }
    if (e instanceof DatabaseError) { throw new HTTPError(409, "USERNAME_TAKEN")}
    console.error("error in change_username()", e)
    throw new HTTPError(400, "SOMETHING_WRONG")
  }

}
export async function change_password(user_id: string, update: dto.UpdatePassword) {
  await verify_password(user_id, update.password)
  
  const hash_new_password = await sha512( update.new_password )

  const res = await usersRepo.update_password(db, user_id, hash_new_password)
  if (!res.numUpdatedRows) {throw new HTTPError(404, "USER_NOT_FOUND")}
  return new Success("password updated")
}
export async function change_email_dev(user_id: string, new_email: string, password: string) {
  await verify_password(user_id, password)
  
  try {
    const res = await usersRepo.update_email(db, user_id, new_email)
    if (!res.numUpdatedRows) {throw new HTTPError(404, "USER_NOT_FOUND")}
    return new Success("email updated", new_email)

  } catch (e) {
    if (e instanceof HTTPError) { throw e }
    if (e instanceof DatabaseError) { throw new HTTPError(409, "EMAIL_TAKEN")}
    console.error("error in change_username()", e)
    throw new HTTPError(400, "SOMETHING_WRONG")
  }
}


export async function set_random_avatar(user_id: string) {
  const profile = await profilesRepo.get(db, user_id)
  if (!profile) { throw new HTTPError(404, "USER_NOT_FOUND")}

  const now = Math.floor(Date.now() / 1000)
  const cooldown = 2 * 24 * 3600

  if (profile.avatar_updated_at !== 0 
  && (now - profile.avatar_updated_at) < cooldown) {
    throw new HTTPError(429, "AVATAR_COOLDOWN")
  }

  const new_avatar = await generate_avatar(user_id + now)
  const res = await profilesRepo.update_avatar(db, user_id, new_avatar, now)

  if (!res.numUpdatedRows) { throw new HTTPError(404, "USER_NOT_FOUND") }
  return new Success("avatar updated", { new_avatar })
}
export async function set_init_avatar(user_id: string) {
  const init_avatar = await generate_avatar(user_id)

  const now = Math.floor(Date.now() / 1000)
  const res = await profilesRepo.update_avatar(db, user_id, init_avatar, now)

  if (!res.numUpdatedRows) { throw new HTTPError(404, "USER_NOT_FOUND") }
  return new Success("avatar updated", init_avatar)
}

export async function get_my_sended_notifications(user_id: string) {
  const notifics = await notificateRepo.get_by_sender(db, user_id)
  return new Success("sended notifiations", notifics)
}
export async function get_my_received_notifications(user_id: string) {
  const notifics = await notificateRepo.get_by_receiver(db, user_id)
  return new Success("received notifiations", notifics)
}
export async function get_my_transactions_histrory(user_id: string) {
  const transactions = await transactionRepo.get_history(db, user_id)
  return new Success("transctions history", transactions)
}

