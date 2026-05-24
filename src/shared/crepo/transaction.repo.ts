import type { Trx, DB } from "@/db/db";

class TransactionRepo {
  constructor() {}

  async create(trx: Trx, from_id: string, to_id: string, amount: number, time: number) {
    return await trx.insertInto("transactions").values({
      from: from_id,
      to: to_id,
      amount: amount.toString(),
      created_at: time
    }).execute() 
  }

  async get_history(db: DB, user_id: string) {
    return db.selectFrom("transactions as t")
    .leftJoin("users as sender", "sender.id", "t.from")
    .leftJoin("users as receiver", "receiver.id", "t.to")
    .select([
      "t.id", 
      "sender.username as sender",
      "receiver.username as receiver",
      "t.amount", "t.created_at"  
    ]).where(eb => eb.or([
      eb("t.from", "=", user_id),
      eb("t.to", "=", user_id)
    ]))
    .orderBy("t.created_at", "desc")
    .limit(100).execute()
  }

  async get_by_sender(db: DB, user_id: string) {
    return db.selectFrom('transactions as t')
    .leftJoin("users", "users.id", "t.to")
    .select([
      "t.id", "users.username as receiver", "t.amount", "t.created_at",
    ]).where("t.from", "=", user_id).limit(100)
    .orderBy("t.created_at", "desc").execute()
  }
  async get_by_receiver(db: DB, user_id: string) {
    return db.selectFrom('transactions as t')
    .leftJoin("users", "users.id", "t.from")
    .select([
      "t.id", "users.username as sender", "t.amount", "t.created_at",
    ]).where("t.to", "=", user_id).limit(100)
    .orderBy("t.created_at", "desc").execute()
  }
}

export default new TransactionRepo()