import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { config } from './config'

import auth_router from './features/auth/auth.api'
import dev_router from './_for_develop/develop.api'
import me_router from './features/me/me.api'
import user_router from "./features/user/user.api"
import search_router from './features/search/search.api'
import admin_router from './features/admin/admin.api'
import owner_router from './features/aowner/owner.api'

import { start_tables } from "./zdb/tables"
import { HTTPError, ValidationError } from './zerrors/errors'
import { showRoutes } from 'hono/dev'


const app = new Hono({ strict: false })
app.use(logger())
app.use('/*', cors({
  origin: [
    'http://localhost:5173',
    'https://localhost:5173',
    'https://postman.co',
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: [
    'Content-Type', 'X-Impersonate-User-Id'
  ],
}))

app.onError((e, c) => {
  if (e instanceof HTTPError) {
    return c.json({ ok: false, error: e.message }, e.status as any)
  }
  if (e instanceof ValidationError) {
    return c.json({ ok: false, error: e.message }, 422)
  }

  if (e.message.includes('ECONNREFUSED') || 
    e.message.includes('Connection terminated') || 
    e.message.includes('ETIMEDOUT')
  ) {
    return c.json({ok: false, error: "database connection failed"}, 503)
  }
  console.error(e)
  return c.json({ok: false, error: 'Internal Server Error' }, 500)
})

app.route("/dev", dev_router)
app.route("/auth", auth_router)
app.route("/me", me_router)
app.route("/user", user_router)
app.route("/search", search_router)
app.route("/admin", admin_router)
app.route("/owner", owner_router)

app.get('/', (c) => {
  return c.json({test: "HELLO WORLD"})
})


await start_tables(false)
console.log(`Server started on port ${config.PORT}`)
console.log(showRoutes(app))
export default app
