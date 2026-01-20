import "server-only";
import "./types";

import NextAuth from "next-auth";

import { authConfig } from "./config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
