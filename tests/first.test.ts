import app from "../src/app";
import { describe, it, expect } from "bun:test"

describe("testing tests. It's firts", () => {

  it("should retrun string", async () => {
    const res = await app.request("/")

    expect(res.status).toBe(200)
    
    const data = await res.json()
    expect(data).toEqual({ test: "HELLO WORLD" })
  })
})
