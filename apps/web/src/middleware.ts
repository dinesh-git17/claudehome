import NextAuth from "next-auth";

import { authConfig } from "@/lib/server/auth/config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/panel-admin/:path*"],
};
