import type { Context } from "hono"

import { z } from "zod"
import { ValidationError } from "@/errors/errors"
import { VE } from "@/errors/validation_codes"


export const validate_base = async <T>( schema: z.ZodSchema<T>, data: unknown): Promise<T> => {

  const result = schema.safeParse(data)
  if (!result.success) {
    const issue = result.error.issues[0]
    const field = issue?.path[0]

    if (issue?.code === "invalid_type") {throw new ValidationError(VE.INVALID_TYPE)}
    if (issue?.code === "invalid_format" && field === "email") {
      throw new ValidationError(VE.EMAIL_INVALID)
    }

    if (issue?.message && issue.message in  VE) {
      throw new ValidationError(issue.message as keyof typeof VE)
    } else {
      throw new ValidationError(VE.VALIDATION_ERROR)
    }
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