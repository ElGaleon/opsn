export function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}
