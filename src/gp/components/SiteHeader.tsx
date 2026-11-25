import { Link, useNavigate } from "../router";
import { LogOut } from "../icons";
import { Button } from "../ui/button";
import { signOut, useDb } from "../lib/store";

export function SiteHeader() {
  const signedIn = useDb((d) => Boolean(d.session));
  const navigate = useNavigate();
  function onSignOut() {
    signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <header className="z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-3 px-5 text-xs">
          <span className="truncate rounded bg-background/10 px-2 py-0.5 font-semibold">Evidence-backed relocation planning</span>
          <span className="shrink-0 opacity-80"><span className="sm:hidden">Portfolio edition</span><span className="hidden sm:inline">Portfolio edition · sample data · partners never influence rankings</span></span>
        </div>
      </div>
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="Global Pathways AI home">
          <img src="images/global-pathways-logo.png" alt="" width={634} height={328} className="h-9 w-[70px] shrink-0 object-contain" />
          <span className="font-display text-xl leading-none text-ink sm:text-2xl">Global Pathways <span className="italic text-primary">AI</span></span>
        </Link>
        <nav aria-label="Global Pathways AI" className="flex items-center gap-1 text-sm">
          {signedIn ? (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard">My plan</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/intake">Profile</Link></Button>
              <Button variant="ghost" size="sm" onClick={onSignOut} aria-label="Sign out"><LogOut /> <span className="hidden sm:inline">Sign out</span></Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Log in</Link></Button>
              <Button asChild variant="ink" size="sm"><Link to="/auth" search={{ mode: "signup" }}>Get started</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
