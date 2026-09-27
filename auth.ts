import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        await connectToDatabase();

        const user = await User.findOne({
          email,
          isActive: true,
        })
          .select("+passwordHash")
          .lean();

        if (!user) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          organizationId: user.organizationId.toString(),
          role: user.role,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.role = user.role;
      token.sessionVersion =
      user.sessionVersion ?? 0;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId =
          token.organizationId as string;
        session.user.role = token.role as "ADMIN" | "STAFF";
        session.user.sessionVersion =
      token.sessionVersion as number;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});