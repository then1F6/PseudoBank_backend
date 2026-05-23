import type { Context } from "hono"

import { z } from "zod"
import { ValidationError } from "../zerrors/errors"
import { VE } from "../zerrors/validation_codes"


export const validate_base = async <T>( schema: z.ZodSchema<T>, data: unknown): Promise<T> => {

  const result = schema.safeParse(data)
  if (!result.success) {
    const issue = result.error.issues[0]
    const field = issue?.path[0]

    if (issue?.code === "invalid_type") {throw new ValidationError(VE.INVALID_TYPE)}
    if (issue?.code === "invalid_format" && field === "email") {
      throw new ValidationError(VE.EMAIL_INVALID)
    }

    throw new ValidationError(issue?.message ?? "validation error")
  }
  return result.data
}

export const validate = async <T>( schema: z.ZodSchema<T>, c: Context ): Promise<T> => {
  const data = await c.req.json().catch(() => {
    throw new ValidationError(VE.INVALID_JSON)
  })
  return await validate_base(schema, data)
}
export const validate_query = async <T>( schema: z.ZodSchema<T>, c: Context ): Promise<T> => {
  const data = c.req.query()
  return await validate_base(schema, data)
}