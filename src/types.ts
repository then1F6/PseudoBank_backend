import type { JWTPayload } from "jose"

export interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface access_payload extends JWTPayload {
  user_id: string,
  role: "user"|"admin"|"owner"
}

export interface AuthVars {
  payload: access_payload
}