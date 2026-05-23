import { randomBytes } from "node:crypto";
import {  it, expect } from "bun:test"
import type { ApiError, ApiSccess } from "../../src/zerrors/errors";

import { type tRequestInit, CookieClient } from "./test_client";


export function str(count: number) {
  return "a".repeat(count)
}
export function ustr(base: string, max: number = 32) {
  return (base+"_"+randomBytes(Math.floor(max/2)).toString("hex")).slice(0, max)
}


export interface ValidatonCase {
  name: string,
  status: number, 
  body?: unknown,
  error?: string
  not_cookie?: true
}
interface Requests {
  method: "POST" | "GET"
  path: string
  app?: CookieClient
  req?: tRequestInit
}
export function testing(reqs: Requests, cases: ValidatonCase[]) {
  const appClient = reqs.app ?? new CookieClient()

  cases.forEach(({ name, body, status, error, not_cookie}) => {
    it(name, async () => {
      let res;
      const req = {...reqs.req, not_cookie: !!not_cookie}

      if (reqs.method === "POST") {
        res = await appClient.post(reqs.path, body, req)
      } else {
        res = await appClient.get(reqs.path, req)
      }
      
      const data = await res.json() as ApiError | ApiSccess
      expect(res.status).toEqual(status)

      if (!data.ok && error) {
        expect(data.error).toEqual(error)
      }
    })
  })
}