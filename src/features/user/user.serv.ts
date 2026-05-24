import { HTTPError, Success } from "@/errors/errors";
import profilesRepo from "@/crepo/profiles.repo";
import { db } from "@/db/db";
import type { Trx } from "@/db/db";
import usersRepo from "@/crepo/users.repo";
import transactionRepo from "@/crepo/transaction.repo";
import notificateRepo from "@/crepo/notificate.repo";

import { get_user_profile } from "./user.zquery";
import type { dto } from "./user.schema";


export async function get_user_info(username: string) {
  const res = await get_user_profile(db, username)
  if (!res) { throw new HTTPError(404, "USER_NOT_FOUND") }

  return new Success("user profile", res)
}

export async function transfer_money(from_user_id:string, transfer_data:dto.TransferInput) {
  try {
    const result = await db.transaction().execute(async (trx: Trx) => {
      const to_user = ( await usersRepo.get_user_by_name(trx, transfer_data.to_username) )
      if (!to_user) { throw new HTTPError(404, "USER_NOT_FOUND") }
      if (to_user.id === from_user_id) { throw new HTTPError(409, "CANNOT_TRANSFER_TO_SELF") }

      const now = Math.floor(Date.now() / 1000)

      const decreased = await profilesRepo.decrease_balance_if_enough(trx, from_user_id, transfer_data.amount)
      if (!decreased.numUpdatedRows) {
        throw new HTTPError(400, "INSUFFICIENT_BALANCE")
      }

      const increased = await profilesRepo.increase_balance(trx, to_user.id, transfer_data.amount)
      if (!increased.numUpdatedRows) { throw new HTTPError(404, "USER_NOT_FOUND") }

      await transactionRepo.create(trx,
        from_user_id, to_user.id, transfer_data.amount, now
      )

      return {
        to_username: transfer_data.to_username,
        amount: transfer_data.amount
      }
    })

    return new Success("transfer successful", result)
  } catch (e) {
    if (e instanceof HTTPError) {
      throw e
    }
    console.error("error in transfer_money()", e)
    throw new HTTPError(400, "SOMETHING_WRONG")
  }
}

export async function make_reqest_money(user_id: string, to_username: string) {
  const limit = Math.floor(Date.now() / 86400000) * 86400;
  const last_requests = await notificateRepo.get_last6(db, user_id, limit)

  const cooldown = last_requests.length >= 5
  if (cooldown) { throw new HTTPError(429, "MONEY_REQUEST_COOLDOWN")} 

  const receiver = await usersRepo.get_user_by_name(db, to_username)
  if (!receiver) { throw new HTTPError(404, "USER_NOT_FOUND")}
  if (receiver.id === user_id) { throw new HTTPError(409, "CANNOT_REQUEST_SELF")}

  const asked_alredy = last_requests.some(r => r.receiver === receiver.id)
  if(asked_alredy) { throw new HTTPError(429, "USER_ALREADY_ASKED")}

  try {
    await notificateRepo.create(db, {
      sender: user_id, receiver: receiver.id, message: "Requsest money"
    })
  } catch (e: any) {
    if (e.code == "23503") {throw new HTTPError(404, "USER_NOT_FOUND")}
    console.error(e)
    throw e
  }
  return new Success("request made")
}
