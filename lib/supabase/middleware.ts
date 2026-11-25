import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./client";
import { publicUrl } from "@/lib/http/public-origin";
import {
  isDemoLoginAllowed,
  isProductionRuntime,
} from "@/lib/runtime/demo-mode";

const APP_PREFIXES = [
  "/dashboard",
  "/processos",
  "/nucleos",
  "/documentos",
  "/protocolo",
  "/configuracoes",
  "/cadastros",
  "/tarefas",
  "/notificacoes",
  "/arquivos",
  "/empreendimentos",
  "/carteira",
  "/boletos",
  "/contratos",
  "/reajustes",
  "/vendas",
  "/leads",
  "/financeiro",
  "/compras",
  "/obras",
  "/importacao",
  "/cobranca",
  "/juridico",
  "/fiscal",
  "/relatorios",
  "/quadros",
];

function isAppRoute(pathname: string) {
  return APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/auth");
}

function redirectTo(request: NextRequest, pathname: string, nextPath?: string) {
  const url = publicUrl(request, pathname);
  if (nextPath) url.searchParams.set("next", nextPath);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const demoCookie = request.cookies.get("mlf_demo_session")?.value;
  const hasDemo = isDemoLoginAllowed() && demoCookie === "1";

  // Produção: sem cookie demo e sem Supabase → bloqueia app
  if (!isSupabaseConfigured()) {
    if (isProductionRuntime() && isAppRoute(pathname)) {
      return redirectTo(request, "/auth/login", pathname);
    }
    if (isAuthRoute(pathname) && hasDemo && !pathname.includes("/callback")) {
      return redirectTo(request, "/dashboard");
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedIn = Boolean(user) || hasDemo;

  if (isAppRoute(pathname) && !loggedIn) {
    return redirectTo(request, "/auth/login", pathname);
  }

  if (isAuthRoute(pathname) && loggedIn && !pathname.includes("/callback")) {
    return redirectTo(request, "/dashboard");
  }

  return supabaseResponse;
}
