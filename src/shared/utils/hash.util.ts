import { scrypt, timingSafeEqual,createHash } from "node:crypto"
import { promisify } from "node:util"
import { config } from "~/config"
const scryptAsync = promisify(scrypt)

export async function sha256(input: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  )

  return Buffer.from(hash).toString("hex")
}

export async function sha512(password: string) {
  const salt = config.PASSWORD_SECRET
  
  const hash = await scryptAsync(password, salt, 32) as Buffer
  return hash.toString("hex")
}

export function safe_equal(input1: string, input2: string) {
  const hash1 = createHash('sha256').update(input1).digest();
  const hash2 = createHash('sha256').update(input2).digest();

  return timingSafeEqual(hash1, hash2);
}