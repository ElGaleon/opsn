import { ArrowLeft, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { cn } from "@shared/lib/utils";

export function EntityForm({
  title,
  eyebrow,
  children,
  isEditing,
  onBack,
  onDelete,
  onSubmit,
  isDirty,
  className,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  isEditing: boolean;
  onBack: () => void;
  onDelete?: () => void | Promise<void>;
  onSubmit: () => void;
  isDirty?: boolean;
  className?: string;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-emerald-950/10 bg-white/70">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-9 w-9 shrink-0 px-0"
            aria-label="Indietro"
            title="Indietro"
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
                {eyebrow}
              </div>
            ) : null}
            <CardTitle className="text-lg leading-none">{title}</CardTitle>
          </div>
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} /> Elimina
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-6 sm:pt-8">
        <form
          onSubmit={onSubmit}
          className={cn("grid w-full gap-4", className)}
        >
          {children}
          <div className="flex flex-col-reverse gap-2 border-t border-emerald-950/10 pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onBack}>
              Annulla
            </Button>
            <Button disabled={!isDirty}>
              Salva
            </Button>
          </div>
        </form>
      </CardContent>
      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/35 p-4">
          <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-5 shadow-xl shadow-stone-950/15">
            <h2 className="text-base font-semibold text-stone-950">
              Eliminare definitivamente?
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Questa operazione non può essere annullata.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
              >
                Annulla
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  await onDelete?.();
                  setConfirmDelete(false);
                }}
              >
                Elimina
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
