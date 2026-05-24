import { describe, it, expect, beforeAll, test } from "bun:test"

import { VE } from "../../src/shared/errors/validation_codes";
import{ SE } from "../../src/shared/errors/error_codes"

import { str, ustr } from "../__helper/func";
import { testing, type TestCase } from "../__helper/testing";
import { create_user } from "../__helper/factory";


describe("GET /me", async () => {
  const name = ustr("me12")
  let app = await create_user(name);

  const cases: TestCase[] = [{
    name: "without cookie",
    status: 401, error: SE.NOT_ACCESS_TOKEN,
    not_cookie: true,
  },{ 
    name: "with cookie",
    status: 200, res_data: {
      username: name,
      display_name: name,
      email: `${name}01@gmail.com`
    }
  },]

  testing({
    method: "GET",
    path: "/me",
    app: app
  }, cases)
})

describe("GET /me/change/bio", async () => {
  const name = ustr("me12")
  let app = await create_user(name);

  const cases: TestCase[] = [{
    name: "body not json", status: 422,
    body: "not object", error: VE.INVALID_TYPE
  },{
    name: "new bio not a string", status: 422,
    body: { bio: 422 }, error: VE.INVALID_TYPE
  },{
    name: "new bio too short", status: 422,
    body: { bio: "" }, error: VE.BIO_TOO_SHORT
  },{
    name: "new bio too long", status: 422,
    body: { bio: str(257) }, error: VE.BIO_TOO_LONG
  },{
    name: "new bio normal short", status: 200,
    body: { bio: "." }
  },{
    name: "new bio normal long", status: 200,
    body: { bio: str(256) }
  },{
    name: "new bio usually using", status: 200,
    body: { bio: "HELLO MY FRIEND @#$%^&*()-_=+][" }
  },]

  testing({
    method: "POST",
    path: "/me/change/bio",
    app: app
  }, cases)
})
describe("GET /me/change/display_name", async () => {
  const name = ustr("me12")
  let app = await create_user(name);

  const cases: TestCase[] = [{
    name: "body not json", status: 422,
    body: "not object", error: VE.INVALID_TYPE
  },{
    name: "new display_name not a string", status: 422,
    body: { display_name: 422 }, error: VE.INVALID_TYPE
  },{
    name: "new display_name too short", status: 422,
    body: { display_name: "" }, error: VE.DISPLAY_NAME_TOO_SHORT
  },{
    name: "new display_name too short 2", status: 422,
    body: { display_name: "123" }, error: VE.DISPLAY_NAME_TOO_SHORT
  },{
    name: "new display_name too long", status: 422,
    body: { display_name: str(33) }, error: VE.DISPLAY_NAME_TOO_LONG
  },{
    name: "new display_name normal short", status: 200,
    body: { display_name: "1234" }
  },{
    name: "new display_name normal long", status: 200,
    body: { display_name: str(32) }
  },{
    name: "new display_name usually using", status: 200,
    body: { display_name: "HELLO MY FRIEND @#$%^&*()-_=+][" }
  },]

  testing({
    method: "POST",
    path: "/me/change/display_name",
    app: app
  }, cases)
})
describe("GET /me/avatar/random", async () => {
  const name = ustr("me12")
  let app = await create_user(name);

  const cases: TestCase[] = [{
    name: "random avatar without cookies", status: 401,
    error: SE.NOT_ACCESS_TOKEN, not_cookie: true
  }, {
    name: "succes setted random", status: 200,
  }, {
    name: "random avatar cooldown", status: 429,
    error: SE.AVATAR_COOLDOWN 
    // Этот тест кейс зависит от предыдуего успешного 
  }]

  testing({
    method: "POST",
    path: "/me/avatar/random",
    app: app
  }, cases)
})