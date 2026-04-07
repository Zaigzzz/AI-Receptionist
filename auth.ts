import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { findByEmail, createUser } from "@/lib/users";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await findByEmail(credentials.email as string);
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, username: user.username };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await findByEmail(user.email);
        if (!existing) {
          // Auto-create account for Google sign-in users
          const randomPassword = crypto.randomBytes(32).toString("hex");
          const hashed = await bcrypt.hash(randomPassword, 12);
          await createUser({
            name: user.name ?? "User",
            business: "",
            email: user.email,
            password: hashed,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.username = (user as { username?: string }).username ?? token.name;
      }
      // For Google users, fetch username from DB
      if (account?.provider === "google" && token.email) {
        const dbUser = await findByEmail(token.email);
        if (dbUser) {
          token.sub = dbUser.id;
          token.username = dbUser.username;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { username?: string }).username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
});
