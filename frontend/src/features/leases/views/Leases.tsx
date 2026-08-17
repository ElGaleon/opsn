import { useState } from "react";
import { Contracts } from "@features/contracts/views/Contracts";
import { Tenants } from "@features/tenants/views/Tenants";
import { Button } from "@shared/components/ui/button";
import { Data } from "@app/types/app";

type LeaseTab = "contracts" | "tenants";

export function Leases({
  data,
  reload,
  getToken,
}: {
  data: Data;
  reload: () => Promise<void>;
  getToken?: () => Promise<string | null>;
}) {
  const [tab, setTab] = useState<LeaseTab>("contracts");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-emerald-950/10 bg-white/95 p-1 shadow-sm shadow-emerald-950/5">
        <Button
          variant={tab === "contracts" ? "default" : "ghost"}
          onClick={() => setTab("contracts")}
        >
          Contratti
        </Button>
        <Button
          variant={tab === "tenants" ? "default" : "ghost"}
          onClick={() => setTab("tenants")}
        >
          Inquilini
        </Button>
      </div>
      {tab === "contracts" ? (
        <Contracts data={data} reload={reload} getToken={getToken} />
      ) : (
        <Tenants data={data} reload={reload} getToken={getToken} />
      )}
    </div>
  );
}
