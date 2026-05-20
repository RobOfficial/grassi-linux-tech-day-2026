import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Role } from "@/lib/constants";

export async function SiteHeader() {
  const session = await auth();
  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <header className="border-b border-primary/30 bg-card/40 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="font-bold text-primary glow text-lg tracking-wider">
          <span className="text-accent">~/</span>grassi-tech-quest
        </Link>
        <nav className="flex items-center gap-3 text-xs sm:text-sm">
          <Link href="/leaderboard" className="hover:text-primary">classifica</Link>
          <Link href="/stats" className="hover:text-primary">stats</Link>
          <Link href="/monitor" className="hover:text-primary hidden sm:inline">monitor</Link>
          {session?.user ? (
            <>
              <Link href="/app" className="hover:text-primary">dashboard</Link>
              {isAdmin && (
                <Link href="/admin" className="text-accent hover:text-accent/80">admin</Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="btn-danger text-xs px-2 py-1">logout</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn text-xs px-2 py-1">login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
