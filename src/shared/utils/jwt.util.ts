import { config } from "~/config"
import { HTTPError } from "@/errors/errors"
import { jwtVerify } from "jose"


export async function decode_jwt(jwt: string | undefined ) {
  if (!jwt) throw new HTTPError(401, "NOT_JWT")
  try {
    const { payload } = await jwtVerify(jwt, config.SECRET_JWT)
    return payload
  } catch { throw new HTTPError(401, "INVALID_JWT")}
}