// import { describe, it, expect, beforeAll } from "bun:test"

// import { VE } from "../../src/zerrors/validation_codes";
// import{ SE } from "../../src/zerrors/error_codes"

// import { base_validate, str } from "../__helper/func";
// import { create_user } from "../__helper/factory";


// describe("POST /auth/login", () => {
//   describe("validate email", () => {
//     const cases = [{
//       name: "EMAIL_INVALID: simple string", 
//       body: { email: "qwerty", password: "12345678" },
//       status: 422, error: VE.EMAIL_INVALID
//     },{ 
//       name: "EMAIL_INVALID: domain", 
//       body: { email: "mail.ru", password: "12345678" }, 
//       status: 422, error: VE.EMAIL_INVALID
//     },{ 
//       name: "LOGIN_INVALID: @mail.ru", 
//       body: { email: "qwerty@mail.ru", password: "12345678" }, 
//       status: 422, error: VE.LOGIN_INVALID
//     },{ 
//       name: "LOGIN_INVALID: @yandex.ru", 
//       body: { email: "qwerty@yandex.ru", password: "12345678" }, 
//       status: 422, error: VE.LOGIN_INVALID
//     },{ 
//       name: "LOGIN_INVALID: gmail but .ru", 
//       body: { email: "qwerty@gmail.ru", password: "12345678" }, 
//       status: 422, error: VE.LOGIN_INVALID
//     }]
//     base_validate(cases)
//   })
//   describe("validate password", () => {
//     const cases = [{
//       name:  "LOGIN_INVALID: too short",
//       body: { email: "qwer@gmail.com", password: str(7) },
//       status: 422, error: VE.LOGIN_INVALID
//     },{
//       name:  "LOGIN_INVALID: normal short",
//       body: { email: "qwer@gmail.com", password: str(8) },
//       status: 409, error: SE.INCORRECT_EMAIL_OR_PASSWORD
//     },{
//       name: "LOGIN_INVALID: too login",
//       body: { email: "qwer@gmail.com", password: str(65) },
//       status: 422, error: VE.LOGIN_INVALID
//     },{
//       name:  "LOGIN_INVALID: normal long",
//       body: { email: "qwer@gmail.com", password: str(64) },
//       status: 409, error: SE.INCORRECT_EMAIL_OR_PASSWORD
//     },{
//       name:  "LOGIN_INVALID: not match regex 1",
//       body: { email: "qwer@gmail.com", password: "1234567$%" },
//       status: 422, error: VE.LOGIN_INVALID
//     },{
//       name:  "LOGIN_INVALID: not match regex 2",
//       body: { email: "qwer@gmail.com", password: "--------" },
//       status: 422, error: VE.LOGIN_INVALID
//     },{
//       name:  "LOGIN_INVALID: normal reqex",
//       body: { email: "qwer@gmail.com", password: "190aZ_.?!" },
//       status: 409, error: SE.INCORRECT_EMAIL_OR_PASSWORD
//     }]
//     base_validate(cases)
//   })

//   describe("validate serv with DB", () => {
//     beforeAll(async () => {
//       await create_user("first@gmail.com", "SUPER")
//     })

//     const cases = [{
//       name: "NOT in DB",
//       body: { email: "never@gmail.com", password: str(8) },
//       status: 409, error: SE.INCORRECT_EMAIL_OR_PASSWORD
//     },{
//       name: "PASSWORD INCORRECT",
//       body: { email: "first@gmail.com", password: "never.never" },
//       status: 409, error: SE.INCORRECT_EMAIL_OR_PASSWORD
//     },{
//       name: "SUCCESS",
//       body: { email: "first@gmail.com", password: str(8) },
//       status: 200
//     },]
//     base_validate(cases)
//   })
// })