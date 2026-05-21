import { handlers } from "@/auth";
import { NextRequest } from "next/server";

// Next.js strippa il basePath (/quest) dal request.url prima di passare la
// richiesta al route handler, ma NextAuth ha basePath="/quest/api/auth" per
// generare correttamente il redirect_uri OAuth. Re-iniettiamo /quest nell'URL
// così NextAuth riesce a fare match su pathname.startsWith(basePath).
const nextBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "/quest";

type Handler = (req: NextRequest) => Promise<Response> | Response;

function withBasePath(handler: Handler): Handler {
  return async (req: NextRequest) => {
    const url = new URL(req.url);
    if (url.pathname.startsWith(nextBasePath)) return handler(req);
    url.pathname = `${nextBasePath}${url.pathname}`;
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const init: RequestInit = {
      method: req.method,
      headers: req.headers,
      redirect: "manual",
    };
    if (hasBody) {
      (init as RequestInit & { duplex: "half" }).duplex = "half";
      init.body = req.body;
    }
    if (req.signal) init.signal = req.signal;
    const adapted = new NextRequest(url.toString(), init as ConstructorParameters<typeof NextRequest>[1]);
    return handler(adapted);
  };
}

export const GET = withBasePath(handlers.GET as Handler);
export const POST = withBasePath(handlers.POST as Handler);
