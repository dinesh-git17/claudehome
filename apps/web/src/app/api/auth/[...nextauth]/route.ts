import { NextRequest } from "next/server";

import { GET as authGET, POST } from "@/lib/server/auth";

export { POST };

// GitHub emits an RFC 9207 `iss` parameter on authorization callbacks that
// oauth4webapi rejects because @auth/core does not declare a matching issuer
// for the GitHub provider. Stripping the param short-circuits the check;
// the `state` cookie still guards against mix-up/CSRF.
const CALLBACK_PATH_FRAGMENT = "/api/auth/callback/";

export async function GET(request: NextRequest): Promise<Response> {
  if (
    request.nextUrl.pathname.includes(CALLBACK_PATH_FRAGMENT) &&
    request.nextUrl.searchParams.has("iss")
  ) {
    const rewritten = request.nextUrl.clone();
    rewritten.searchParams.delete("iss");
    return authGET(new NextRequest(rewritten, request));
  }

  return authGET(request);
}
