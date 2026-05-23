import app from "../../src/app";


type tApp = typeof app
export type tRequestInit = RequestInit & {
  not_cookie?: boolean
}
export class CookieClient {
  app: tApp;
  cookie: string[] = []

  constructor() {
    this.app = app
  }
  watch_cookie() {
    return this.cookie
  }

  private async request(path: string, req: tRequestInit) {
    if (!req.not_cookie && this.cookie.length > 0) {
      req.headers = {
        ...req.headers,
        Cookie: this.cookie.join('; ')
      };
    }
    const res = await app.request(path, req)
 
    const setCookieHeader = res.headers.getSetCookie();
    if (setCookieHeader) {
      const rawCookies = setCookieHeader

      for (const rawCookie of rawCookies) {
        const cookiePart = rawCookie.split(';')[0]!.trim()
        const [key] = cookiePart.split('=');

        if (key) {
          // Удаляем старую куку с таким же ключом и добавляем новую
          this.cookie = this.cookie.filter(c => !c.startsWith(`${key}=`));
          this.cookie.push(cookiePart);
        }
      }
    }

    return res;
  }

  async get(path: string, req: tRequestInit = {}) {
    return this.request(path, {...req,
      method: 'GET'
    })
  }
  async post(path: string, body: unknown = {}, req: tRequestInit = {}) {
    const headers = new Headers(req.headers);
  
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return this.request(path, {
      ...req,
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
  }
}

export const appClient = new CookieClient()