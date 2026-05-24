import { sql } from "kysely"
import { db } from "@/db/db"


async function create_refreshs_table() {
  await (db.schema.createTable("refreshs").ifNotExists()
    .addColumn("user_id", "uuid", col => col.notNull())
    .addColumn("token", "uuid", col => col.primaryKey())
    .addColumn("expired_at", "bigint", col => col.notNull())

    .addForeignKeyConstraint("refreshs_user_id_fkey", ["user_id"], "users", ["id"],
      (c) => c.onDelete("cascade").onUpdate("cascade"))
  .execute())

  await (db.schema.createIndex("refreshs_user_id_idx")
    .on("refreshs").column("user_id")
    .ifNotExists()
  .execute())
  await db.schema.createIndex("refreshs_created_at_idx")
  .on("refreshs").column("expired_at").ifNotExists().execute()
}
async function create_users_table() {
  await (db.schema.createTable("users").ifNotExists()
    .addColumn("id", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("role", "varchar(5)", col => col.notNull().defaultTo("user"))
    .addColumn("username", "varchar(32)", col => col.notNull().unique())
    .addColumn("username_updated_at", "bigint", col => col.notNull().defaultTo(0))
    .addColumn("email", "varchar(255)", col => col.notNull().unique())
    .addColumn("password_hash", "text", col => col.notNull())
    .addColumn("created_at", "bigint", col => col.notNull().defaultTo(sql`(extract(epoch from now()))`))
  .execute())

  await (db.schema
    .createIndex("users_username_lower_idx")
    .ifNotExists()
    .on("users")
    .expression(sql`lower(username) text_pattern_ops`)
  .execute())

  await db.schema.createIndex("users_created_at_idx")
  .on("users").column("created_at").ifNotExists().execute()

  await db.schema.createIndex("users_role_idx")
  .on("users").column("role").ifNotExists().execute()
}
async function create_profiles_table() {
  await (db.schema.createTable("profiles").ifNotExists()
    .addColumn("user_id", "uuid", col => col.notNull().unique().primaryKey())
    .addColumn("display_name", "varchar(32)", col => col.notNull())
    .addColumn("avatar", "varchar(18)", col => col.notNull())
    .addColumn("avatar_updated_at", "bigint", col => col.notNull().defaultTo( 0 ))
    .addColumn("balance", "bigint", col => col.notNull().defaultTo( 100 ))
    .addColumn("bio", "varchar(256)", col => col.notNull().defaultTo("Hello!"))

    .addForeignKeyConstraint(
      "profiles_user_id_fkey", ["user_id"], "users", ["id"],
      (constraint) => constraint.onDelete('cascade').onUpdate('cascade')
    )
  .execute())

  await (db.schema
    .createIndex("profiles_display_name_idx")
    .on("profiles").column("display_name")
    .ifNotExists()
  .execute())

  await (db.schema
    .createIndex("users_display_name_lower_idx")
    .ifNotExists()
    .on("profiles")
    .expression(sql`lower(display_name) text_pattern_ops`)
  .execute())

}
async function create_transactions_table() {
  await (db.schema.createTable("transactions").ifNotExists()
    .addColumn("id", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("from", "uuid", col => col.notNull())
    .addColumn("to", "uuid", col => col.notNull())
    .addColumn("amount", "bigint", col => col.notNull())
    .addColumn("created_at", "bigint", col => col.notNull().defaultTo(sql`(extract(epoch from now()))`))

    .addForeignKeyConstraint(
      "transactions_from_fkey", ["from"], "users", ["id"],
      (constraint) => constraint.onDelete("no action").onUpdate("cascade")
    )
    .addForeignKeyConstraint(
      "transactions_to_fkey", ["to"], "users", ["id"],
      (constraint) => constraint.onDelete("no action").onUpdate("cascade")
    )
  .execute())

  await (db.schema.createIndex("transactions_from_idx")
  .on("transactions").column("from").ifNotExists().execute())

  await (db.schema.createIndex("transactions_to_idx")
  .on("transactions").column("to").ifNotExists().execute())

  await db.schema.createIndex("transactions_created_at_idx")
  .on("transactions").column("created_at").ifNotExists().execute()
}
async function create_notifications_table() {
    await (db.schema.createTable("notifications").ifNotExists()
    .addColumn("id", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("sender", "uuid", col => col)
    .addColumn("receiver", "uuid", col => col)
    .addColumn("message", "varchar(128)", col => col.notNull())
    .addColumn("created_at", "bigint", col => col.notNull().defaultTo(sql`(extract(epoch from now()))`))

    .addForeignKeyConstraint(
      "notifications_sender_fkey", ["sender"], "users", ["id"],
      (constraint) => constraint.onDelete("cascade").onUpdate("no action")
    )
    .addForeignKeyConstraint(
      "notifications_reciver_fkey", ["receiver"], "users", ["id"],
      (constraint) => constraint.onDelete("cascade").onUpdate("no action")
    )
  .execute())

  await db.schema.createIndex("notifications_receiver_idx")
  .on("notifications").column("receiver").ifNotExists().execute()

  await db.schema.createIndex("notifications_sender_idx")
  .on("notifications").column("sender").ifNotExists().execute()

  await db.schema.createIndex("notifications_created_at_idx")
  .on("notifications").column("created_at").ifNotExists().execute()
}

export async function create_all() {
  await create_users_table()
  await create_refreshs_table()

  await create_profiles_table()
  await create_transactions_table()
  await create_notifications_table()
}
export async function drop_all() {
  await sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.execute(db)
}

export async function start_tables(drop: boolean = false) {
  if (drop) {
    await drop_all()
    console.log("DROP TABLES")
  }
  await create_all()
  console.log("CREATE TABLES")
}