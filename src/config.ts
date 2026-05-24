function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env variable: ${key}`)
  return value
}

export const config = {
  PASSWORD_SECRET: required('PASSWORD_SECRET'),
  SECRET_JWT: new TextEncoder().encode(required("SECRET_JWT")),

  OWNER_PASSWORD:  required("BECOME_OWNER_PASSWORD"),
  DEV_EMAIL_PASSWORD: required("DEV_EMAIL_PASSWORD"),

  DB_URL: required("DB_URL"),
  PORT: Number(required("PORT"))
}