import usersRepo from "@/crepo/users.repo"
import { db } from "@/db/db"
import { Success } from "@/errors/errors"

export async function say_hello_dev() {
  return new Success("test route")
}

export async function get_all_users() {
  return new Success("all users", await usersRepo.get_all(db))
}