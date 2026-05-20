import type { Role } from "@/lib/constants";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      registrationCompleted: boolean;
      className: string | null;
    };
  }
}
