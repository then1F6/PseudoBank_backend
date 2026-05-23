import { VE } from "../../zerrors/validation_codes";
import { z } from "zod";

const Username = (
  z.string().trim()
  .min(4, VE.USERNAME_TOO_SHORT)
  .max(32, VE.USERNAME_TOO_LONG)
  .regex(/^[a-z][a-z0-9_]+$/, VE.USERNAME_INVALID)
)

const Transfer = z.object({
  to_username: Username,
  amount: z.number().int()
  .positive("Amount must be positive")
  .max(1000_000_000, "Amount too large")
})

const MoneyRequest = z.object({
  to_username: Username
})

export const schemas = {
  Username,
  Transfer,
  MoneyRequest
}

export namespace dto {
  export type TransferInput = ReturnType<typeof Transfer.parse>
}

export default schemas