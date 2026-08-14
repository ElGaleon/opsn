import { useCallback, useEffect, useState } from "react";
import {
  api,
  Contract,
  Deadline,
  Forecast,
  Movement,
  Owner,
  OwnerReport,
  Property,
  Share,
  Summary,
  Tenant,
  Unit,
} from "@shared/lib/api";
import { Data, emptyData } from "@app/types/app";

export function useOpsnData(getToken?: () => Promise<string | null>) {
  const [data, setData] = useState<Data>(emptyData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken ? await getToken() : null;
      const [
        owners,
        tenants,
        properties,
        units,
        shares,
        contracts,
        movements,
        deadlines,
        summary,
        ownerReports,
        forecast,
      ] = await Promise.all([
        api<Owner[]>("/owners", token),
        api<Tenant[]>("/tenants", token),
        api<Property[]>("/properties", token),
        api<Unit[]>("/units", token),
        api<Share[]>("/ownership-shares", token),
        api<Contract[]>("/contracts", token),
        api<Movement[]>("/movements", token),
        api<Deadline[]>("/deadlines", token),
        api<Summary>("/reports/summary", token),
        api<OwnerReport[]>("/reports/owners", token),
        api<Forecast>("/reports/forecast", token),
      ]);
      setData({
        owners,
        tenants,
        properties,
        units,
        shares,
        contracts,
        movements,
        deadlines,
        summary,
        ownerReports,
        forecast,
      });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore API");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, load };
}
