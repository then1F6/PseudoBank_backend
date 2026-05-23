import { config } from "./config";
import app from "./app";

Bun.serve({
  "port": config.PORT ?? 3000,
  "fetch": app.fetch
})