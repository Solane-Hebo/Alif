import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    organizationId: string;
    role: "ADMIN" | "STAFF";
    sessionVersion: number;
  }

  interface Session {
    user: {
      id: string;
      organizationId: string;
      role: "ADMIN" | "STAFF";
      sessionVersion: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organizationId: string;
    role: "ADMIN" | "STAFF";
    sessionVersion: number;
  }
}