import { UserButton } from "@clerk/clerk-react";
import { lazy, ReactNode, Suspense } from "react";
import { useState } from "react";
import { AppShell } from "./views/AppShell";
import { AuthGuard } from "./views/AuthGuard";
import { useOpsnData } from "./hooks/useOpsnData";
import { Dashboard } from "@features/dashboard/views/Dashboard";
import { Section } from "./types/app";
import { PageSkeleton } from "@shared/components/PageSkeleton";

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
const Contracts = lazy(() =>
  import("@features/contracts/views/Contracts").then((module) => ({
    default: module.Contracts,
  })),
);
const Tenants = lazy(() =>
  import("@features/tenants/views/Tenants").then((module) => ({
    default: module.Tenants,
  })),
);
const Collections = lazy(() =>
  import("@features/collections/views/Collections").then((module) => ({
    default: module.Collections,
  })),
);
const Movements = lazy(() =>
  import("@features/movements/views/Movements").then((module) => ({
    default: module.Movements,
  })),
);
const Deadlines = lazy(() =>
  import("@features/deadlines/views/Deadlines").then((module) => ({
    default: module.Deadlines,
  })),
);
const Reports = lazy(() =>
  import("@features/reports/views/Reports").then((module) => ({
    default: module.Reports,
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
            {section === "dashboard" && (
              <Dashboard
                summary={data.summary}
                properties={data.properties}
                units={data.units}
                contracts={data.contracts}
                movements={data.movements}
                deadlines={data.deadlines}
                forecast={data.forecast}
              />
            )}
            <Suspense fallback={<PageSkeleton />}>
              {section === "properties" && (
                <Properties data={data} reload={load} getToken={getToken} />
              )}
              {section === "owners" && (
                <Owners data={data} reload={load} getToken={getToken} />
              )}
              {section === "contracts" && (
                <Contracts data={data} reload={load} getToken={getToken} />
              )}
              {section === "tenants" && (
                <Tenants data={data} reload={load} getToken={getToken} />
              )}
              {section === "collections" && (
                <Collections data={data} reload={load} getToken={getToken} />
              )}
              {section === "movements" && (
                <Movements data={data} reload={load} getToken={getToken} />
              )}
              {section === "deadlines" && (
                <Deadlines data={data} reload={load} getToken={getToken} />
              )}
              {section === "reports" && (
                <Reports data={data} getToken={getToken} />
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
