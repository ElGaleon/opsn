import { UserButton } from "@clerk/clerk-react";
import { lazy, ReactNode, Suspense } from "react";
import { useState } from "react";
import { AppShell } from "./views/AppShell";
import { AuthGuard } from "./views/AuthGuard";
import { useOpsnData } from "./hooks/useOpsnData";
import { Section } from "./types/app";
import { PageSkeleton } from "@shared/components/PageSkeleton";

const Dashboard = lazy(() =>
  import("@features/dashboard/views/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
const Properties = lazy(() =>
  import("@features/properties/views/Properties").then((module) => ({
    default: module.Properties,
  })),
);
const Owners = lazy(() =>
  import("@features/owners/views/Owners").then((module) => ({
    default: module.Owners,
  })),
);
const Leases = lazy(() =>
  import("@features/leases/views/Leases").then((module) => ({
    default: module.Leases,
  })),
);
const Movements = lazy(() =>
  import("@features/movements/views/Movements").then((module) => ({
    default: module.Movements,
  })),
);

function AppBody({
  getToken,
  authControls,
}: {
  getToken?: () => Promise<string | null>;
  authControls?: ReactNode;
}) {
  const [section, setSection] = useState<Section>("dashboard");
  const { data, error, loading, load } = useOpsnData(getToken);

  return (
    <AppShell
      section={section}
      onSectionChange={setSection}
      authControls={authControls}
    >
      <section className="space-y-5">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            <Suspense fallback={<PageSkeleton />}>
              {section === "dashboard" && (
                <Dashboard
                  summary={data.summary}
                  properties={data.properties}
                  units={data.units}
                  contracts={data.contracts}
                  movements={data.movements}
                  forecast={data.forecast}
                />
              )}
              {section === "properties" && (
                <Properties data={data} reload={load} getToken={getToken} />
              )}
              {section === "owners" && (
                <Owners data={data} reload={load} getToken={getToken} />
              )}
              {section === "leases" && (
                <Leases data={data} reload={load} getToken={getToken} />
              )}
              {section === "movements" && (
                <Movements data={data} reload={load} getToken={getToken} />
              )}
            </Suspense>
          </>
        )}
      </section>
    </AppShell>
  );
}

function ClerkApp() {
  return (
    <AuthGuard>
      {(getToken) => (
        <AppBody
          getToken={getToken}
          authControls={
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/80 shadow-sm shadow-emerald-950/5">
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { avatarBox: "h-9 w-9 rounded-md" } }}
              />
            </div>
          }
        />
      )}
    </AuthGuard>
  );
}

export default function App() {
  const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  return hasClerk ? <ClerkApp /> : <AppBody />;
}
