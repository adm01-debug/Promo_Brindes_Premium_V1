import { NextResponse } from "next/server";
import {
  CONSOLE_COOKIE,
  consoleAccessConfig,
  issueConsoleSession,
  matchesConsoleToken,
  requestComesFromSelf,
  sessionCookieOptions,
} from "@/lib/console-access.mjs";

export const dynamic = "force-dynamic";

function hidden() {
  return NextResponse.json({ erro: "RECURSO_INDISPONIVEL" }, { status: 404 });
}


export async function POST(request: Request) {
  const config = consoleAccessConfig();
  if (!config) return hidden();
  if (!requestComesFromSelf(request))
    return NextResponse.json({ erro: "ORIGEM_INVALIDA" }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "PEDIDO_INVALIDO" }, { status: 400 });
  }
  const token = (body as { token?: unknown } | null)?.token;
  if (!matchesConsoleToken(config, token))
    return NextResponse.json({ erro: "TOKEN_INVALIDO" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    CONSOLE_COOKIE,
    issueConsoleSession(config),
    sessionCookieOptions(Math.floor(config.ttlMs / 1000)),
  );
  return response;
}

export async function DELETE(request: Request) {
  const config = consoleAccessConfig();
  if (!config) return hidden();
  if (!requestComesFromSelf(request))
    return NextResponse.json({ erro: "ORIGEM_INVALIDA" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONSOLE_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}