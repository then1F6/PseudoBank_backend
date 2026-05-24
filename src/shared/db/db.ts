import { Kysely, PostgresDialect, Transaction } from 'kysely'
import { Pool } from "pg"

import { config } from '~/config'

import type { users, profiles, refreshs, transactions, notifications } from './models'

interface Database {
  users: users
  profiles: profiles
  refreshs: refreshs
  transactions: transactions
  notifications: notifications
}

export type DB = Kysely<Database>
export type Trx = Transaction<Database>


export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: config.DB_URL })
  })
})