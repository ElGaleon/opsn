import { ArrowLeft, Pencil } from "lucide-react";
import { ReactNode } from "react";
import { ActionButton } from "@shared/components/ActionButton";
import { Button } from "@shared/components/ui/button";
import { CardHeader, CardTitle } from "@shared/components/ui/card";

export function DetailHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  onEdit,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <CardHeader className="border-b border-emerald-950/10 bg-white/70">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <Button
          aria-label="Indietro"
          title="Indietro"
          variant="outline"
          onClick={onBack}
          className="h-9 w-9 px-0"
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase text-emerald-700">
              {eyebrow}
            </p>
          ) : null}
          <CardTitle className="mt-1 truncate text-lg sm:text-xl">
            {title}
          </CardTitle>
          {subtitle ? (
            <p className="mt-1 truncate text-sm text-stone-500">{subtitle}</p>
          ) : null}
        </div>
        <ActionButton
          onClick={onEdit}
          icon={<Pencil size={16} />}
          label="Modifica"
        />
      </div>
    </CardHeader>
  );
}
