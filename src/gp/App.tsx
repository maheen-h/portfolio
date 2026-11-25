import { useEffect } from "react";
import { RouterProvider, Link, match, useLocation, useNavigate } from "./router";
import { SiteHeader } from "./components/SiteHeader";
import { LayerContext, Toaster } from "./ui/overlay";
import { useDb } from "./lib/store";
import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import IntakePage from "./pages/Intake";
import Review from "./pages/Review";
import AnalysisPage from "./pages/Analysis";
import RoadmapPage from "./pages/Roadmap";

const PRIVATE: [string, () => React.ReactElement][] = [
  ["/dashboard", () => <Dashboard />],
  ["/intake", () => <IntakePage />],
  ["/review", () => <Review />],
  ["/analysis/$id", () => <AnalysisPage />],
  ["/roadmap/$id", () => <RoadmapPage />],
];

function Routes() {
  const { path } = useLocation();
  const navigate = useNavigate();
  const signedIn = useDb((d) => Boolean(d.session && d.profile));
  const page = PRIVATE.find(([p]) => match(p, path));
  const needsAuth = Boolean(page) && !signedIn;

  useEffect(() => { if (needsAuth) navigate({ to: "/auth", replace: true }); }, [needsAuth, navigate]);
  useEffect(() => { if (path === "/reset-password") navigate({ to: "/auth", replace: true }); }, [path, navigate]);

  if (path === "/") return <Landing />;
  if (path === "/auth") return <AuthPage />;
  if (page && signedIn) return <div className="min-h-screen"><SiteHeader />{page[1]()}</div>;
  if (needsAuth || path === "/reset-password") return null;
  return (
    <div className="min-h-screen"><SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 tabIndex={-1} className="outline-none font-display text-6xl">404</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist in the app.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go to the app's home page</Link>
      </main>
    </div>
  );
}

export default function App({ layer }: { layer: HTMLElement }) {
  return (
    <LayerContext.Provider value={layer}>
      <RouterProvider>
        <Routes />
        <Toaster />
      </RouterProvider>
    </LayerContext.Provider>
  );
}

