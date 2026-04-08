import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check org membership for role
        const orgMembership = await prisma.orgMember.findFirst({
          where: { userId: user.id },
          select: { role: true, organizationId: true },
        });

        // Determine effective role:
        // If user is ORG_ADMIN or HR_MANAGER, that takes priority
        let effectiveRole = user.role;
        if (orgMembership?.role === "ORG_ADMIN") effectiveRole = "ORG_ADMIN";
        else if (orgMembership?.role === "HR_MANAGER") effectiveRole = "HR_MANAGER";

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: effectiveRole,
          image: user.avatar,
          orgRole: orgMembership?.role || null,
          organizationId: orgMembership?.organizationId || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.orgRole = (user as Record<string, unknown>).orgRole || null;
        token.organizationId = (user as Record<string, unknown>).organizationId || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
