import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Blocca l'accesso se l'email non appartiene al dominio consentito
      if (profile.email && !profile.email.endsWith(process.env.ALLOWED_EMAIL_DOMAIN!)) {
        return false; // Blocco accesso
      }
      return true; // Accesso consentito
    },
    async session({ session, user }) {
      // Aggiungi id e ruolo alla sessione
      session.user.id = user.id;
      session.user.role = user.role; // Assicurati che il ruolo sia presente nel modello User
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };