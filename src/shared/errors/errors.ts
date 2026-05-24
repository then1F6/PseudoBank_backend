import type { ErrorCode } from "@/errors/error_codes"
import type { ValidationErrorCode } from "@/errors/validation_codes"

export class HTTPError extends Error {
  constructor(public status: number, codeMessage: ErrorCode) {
    super(codeMessage)
  }
}

export class ValidationError extends Error {
  constructor(message: ValidationErrorCode) {
    super(message)
  }
}


// also output 'cause here
export class Success {
  ok = true
  message: string
  data?: unknown

  constructor(message: string, data?: unknown) {
    this.message = message
    this.data = data
  }
}
export type ApiSccess = {
  ok: true
  message: string
  data?: unknown
}

export type ApiError = {
  ok: false
  error: string
}