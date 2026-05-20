import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants";

const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "itisgrassi.edu.it";
const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
const nextBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "/quest";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Necessario quando AUTH_URL include il basePath di Next (es. /quest):
  // altrimenti NextAuth genera callback come /quest/callback/google invece di
  // /quest/api/auth/callback/google e Google ridireziona a una route inesistente.
  basePath: `${nextBasePath}/api/auth`,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "1",
  logger: {
    error(error) { console.error("[auth][error]", error); },
    warn(code) { console.warn("[auth][warn]", code); },
  },
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
