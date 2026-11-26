import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CONSOLE_COOKIE,
  consoleAccessConfig,
  requestComesFromSelf,
  verifyConsoleSession,
} from "@/lib/console-access.mjs";
import { ConsoleError, runConsoleAction } from "@/lib/operations-console";
import type { ConsoleActionBody } from "@/lib/operations-types";

export const dynamic = "force-dynamic";


export async function POST(request: Request) {
  const config = consoleAccessConfig();
  if (!config)
    return NextResponse.json({ erro: "RECURSO_INDISPONIVEL" }, { status: 404 });
  const store = await cookies();
  if (!verifyConsoleSession(config, store.get(CONSOLE_COOKIE)?.value))
    return NextResponse.json({ erro: "SESSAO_EXPIRADA" }, { status: 401 });
  if (!requestComesFromSelf(request))
    return NextResponse.json({ erro: "ORIGEM_INVALIDA" }, { status: 403 });
  let body: ConsoleActionBody;
  try {
    body = (await request.json()) as ConsoleActionBody;
  } catch {
    return NextResponse.json({ erro: "PEDIDO_INVALIDO" }, { status: 400 });
  }
  try {
    return NextResponse.json(await runConsoleAction(body));
  } catch (error) {
    const known = error instanceof ConsoleError;
    return NextResponse.json(
      {
        erro: "FALHA",
        mensagem: known ? error.message : "Falha inesperada ao gravar.",
      },
      { status: known ? error.status : 500 },
    );
  }
}