function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env variable: ${key}`)
  return value
}

export const config = {
  super_secret: required('SUPER_DATA'),

  OWNER_PASSWORD:  required("BECOME_OWNER_PASSWORD"),
  DEV_EMAIL_PASSWORD: required("DEV_EMAIL_PASSWORD"),
  SECRET_JWT: new TextEncoder().encode(required("SECRET_JWT")),
  DB_URL: required("DB_URL"),
  PORT: Number(required("PORT")),
  COST_PASSWORD_HASH: Number(required("COST_PASSWORD_HASH"))
}