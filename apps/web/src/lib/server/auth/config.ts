import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

const ADMIN_GITHUB_IDS = new Set(
  (process.env.ADMIN_GITHUB_IDS ?? "").split(",").filter(Boolean)
);

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/panel-admin/login",
    error: "/panel-admin/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/panel-admin");
      const isLoginPage = request.nextUrl.pathname === "/panel-admin/login";

      if (!isAdminRoute) {
        return true;
      }

      if (isLoginPage) {
        if (auth?.user) {
          return Response.redirect(new URL("/panel-admin", request.nextUrl));
        }
        return true;
      }

      return !!auth?.user;
    },
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.githubId = String(profile.id);
      }
      return token;
    },
    session({ session, token }) {
      if (token.githubId) {
        session.user.githubId = token.githubId as string;
        session.user.isAdmin = ADMIN_GITHUB_IDS.has(token.githubId as string);
      }
      return session;
    },
    signIn({ profile }) {
      if (!profile?.id) {
        return false;
      }
      const githubId = String(profile.id);
      if (!ADMIN_GITHUB_IDS.has(githubId)) {
        return false;
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
};
