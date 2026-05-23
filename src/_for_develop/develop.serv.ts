import usersRepo from "../srepo/users.repo"
import { db } from "../zdb/db"
import { Success } from "../zerrors/errors"

export async function say_hello_dev() {
  return new Success("test route")
}

export async function get_all_users() {
  return new Success("all users", await usersRepo.get_all(db))
}