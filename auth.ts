import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";

const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "itisgrassi.edu.it";
const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const email = (user.email || profile?.email || "").toLowerCase();
      if (!email) return false;
      if (email === adminEmail) return true;
      // Email pre-autorizzata come admin nel DB (anche fuori dominio).
      const existing = await prisma.user.findUnique({ where: { email }, select: { role: true } });
      if (existing?.role === Role.ADMIN) return true;
      return email.endsWith(`@${allowedDomain}`);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, registrationCompletedAt: true, name: true, surname: true, className: true },
        });
        session.user.role = (dbUser?.role ?? Role.STUDENT) as Role;
        session.user.registrationCompleted = !!dbUser?.registrationCompletedAt;
        session.user.className = dbUser?.className ?? null;
        if (dbUser?.name) session.user.name = `${dbUser.name} ${dbUser.surname ?? ""}`.trim();
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      const email = user.email?.toLowerCase();
      if (email && email === adminEmail) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: Role.ADMIN, registrationCompletedAt: new Date() },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
