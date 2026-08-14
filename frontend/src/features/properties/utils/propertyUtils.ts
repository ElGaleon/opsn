import { Property, Unit } from "@shared/lib/api";
import { Data } from "@app/types/app";
import {
  MoneyStats,
  PropertyFormValues,
  UnitFormValues,
} from "../types/propertyTypes";

export const propertyValues = (property?: Property): PropertyFormValues => ({
  name: property?.name ?? "",
  address: property?.address ?? "",
  street: property?.street ?? "",
  street_number: property?.street_number ?? "",
  city: property?.city ?? "",
  postal_code: property?.postal_code ?? "",
  province: property?.province ?? "",
  region: property?.region ?? "",
  country: property?.country ?? "Italia",
  latitude: property?.latitude ? Number(property.latitude) : undefined,
  longitude: property?.longitude ? Number(property.longitude) : undefined,
  purchase_value: Number(property?.purchase_value ?? 0),
  mortgage: Number(property?.mortgage ?? 0),
  condo_fees: Number(property?.condo_fees ?? 0),
  notes: property?.notes ?? "",
});

export function composeAddress(
  values: Pick<
    PropertyFormValues,
    | "street"
    | "street_number"
    | "postal_code"
    | "city"
    | "province"
    | "region"
    | "country"
    | "address"
  >,
) {
  const street = [values.street, values.street_number]
    .filter(Boolean)
    .join(" ");
  const city = [values.postal_code, values.city].filter(Boolean).join(" ");
  const area = [city, values.province, values.region, values.country]
    .filter(Boolean)
    .join(", ");
  return [street, area].filter(Boolean).join(", ") || values.address || "";
}

export const unitValues = (
  propertyId: string,
  unit?: Unit,
): UnitFormValues => ({
  property_id: unit?.property_id ?? propertyId,
  name: unit?.name ?? "",
  unit_type: (unit?.unit_type as UnitFormValues["unit_type"]) ?? "apartment",
  notes: unit?.notes ?? "",
});

export function statsFor(movements: Data["movements"]): MoneyStats {
  const income = movements
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = movements
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const cashIn = movements
    .filter((item) => item.type === "income" && item.status !== "unpaid")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const cashOut = movements
    .filter((item) => item.type === "expense" && item.status !== "unpaid")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const arrears = movements
    .filter((item) => item.type === "income" && item.status === "unpaid")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  return {
    income,
    expenses,
    net: income - expenses,
    cashflow: cashIn - cashOut,
    arrears,
  };
}
