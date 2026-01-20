import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/server/auth";

export interface AdminSession {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    githubId: string;
    isAdmin: true;
  };
}

/**
 * Verifies the current session belongs to an authenticated admin.
 * Memoized per request via React cache() to prevent redundant auth calls.
 *
 * @returns AdminSession if valid
 * @throws Redirects to login page if not authenticated or not admin
 */
export const verifyAdminSession = cache(async (): Promise<AdminSession> => {
  const session = await auth();

  if (!session?.user) {
    redirect("/panel-admin/login");
  }

  if (!session.user.isAdmin) {
    redirect("/panel-admin/login?error=AccessDenied");
  }

  return session as AdminSession;
});

/**
 * Non-redirecting version for conditional rendering.
 * Returns null if not authenticated or not admin.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return null;
  }

  return session as AdminSession;
});
