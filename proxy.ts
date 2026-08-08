import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const auth = req.headers.get("authorization");

  const user = process.env.APP_USER;
  const pass = process.env.APP_PASSWORD;

  // Если логин/пароль не заданы — не блокируем (удобно для локальной разработки)
  if (!user || !pass) {
    return NextResponse.next();
  }

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [reqUser, reqPass] = decoded.split(":");
      if (reqUser === user && reqPass === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Task Tracker"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
