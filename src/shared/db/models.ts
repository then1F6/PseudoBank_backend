import type { Generated } from "kysely"

export interface users {
  id: Generated<string>
  role: Generated<"user"|"admin"|"owner">
  username: string
  username_updated_at: Generated<number>
  email: string
  password_hash: string
  created_at: Generated<number>
}

export interface refreshs {
  user_id: string
  token: string
  expired_at: number
}

export interface profiles {
  user_id: string
  display_name: string
  avatar: string
  avatar_updated_at: Generated<number>
  balance: Generated<number>
  bio: Generated<string>
}

export interface transactions {
  id: Generated<string>
  from: string
  to: string
  amount: string
  created_at: Generated<number>
}
export interface notifications {
  id: Generated<string>
  sender: string | null
  receiver: string | null
  message: string
  created_at: Generated<number>
}