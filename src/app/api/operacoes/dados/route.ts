import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CONSOLE_COOKIE,
  consoleAccessConfig,
  verifyConsoleSession,
} from "@/lib/console-access.mjs";
import {
  ConsoleError,
  readConsoleBriefings,
  readConsoleCatalog,
  readConsoleLimits,
  readConsoleStatus,
} from "@/lib/operations-console";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = consoleAccessConfig();
  if (!config)
    return NextResponse.json({ erro: "RECURSO_INDISPONIVEL" }, { status: 404 });
  const store = await cookies();
  if (!verifyConsoleSession(config, store.get(CONSOLE_COOKIE)?.value))
    return NextResponse.json({ erro: "SESSAO_EXPIRADA" }, { status: 401 });
  const scope = new URL(request.url).searchParams.get("escopo") ?? "situacao";
  try {
    if (scope === "situacao")
      return NextResponse.json({
        escopo: scope,
        dados: await readConsoleStatus(),
      });
    if (scope === "catalogo")
      return NextResponse.json({
        escopo: scope,
        dados: await readConsoleCatalog(),
      });
    if (scope === "briefings")
      return NextResponse.json({
        escopo: scope,
        dados: await readConsoleBriefings(),
      });
    if (scope === "limites")
      return NextResponse.json({
        escopo: scope,
        dados: await readConsoleLimits(),
      });
    return NextResponse.json({ erro: "ESCOPO_INVALIDO" }, { status: 400 });
  } catch (error) {
    const known = error instanceof ConsoleError;
    return NextResponse.json(
      {
        erro: "FALHA",
        mensagem: known
          ? error.message
          : "Falha inesperada ao consultar o banco premium.",
      },
      { status: known ? error.status : 500 },
    );
  }
}