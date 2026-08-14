import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { ReactNode } from "react";
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
  className,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  isEditing: boolean;
  onBack: () => void;
  onDelete?: () => void;
  onSubmit: () => void;
  className?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-emerald-950/10 bg-white/70">
        <div className="flex items-start gap-3">
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
          <div className="min-w-0 space-y-1">
            {eyebrow ? (
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                {eyebrow}
              </div>
            ) : null}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-5">
        <form
          onSubmit={onSubmit}
          className={cn("grid max-w-3xl gap-4", className)}
        >
          {children}
          <div className="flex flex-col-reverse gap-2 border-t border-emerald-950/10 pt-4 sm:flex-row sm:justify-end">
            {isEditing && onDelete ? (
              <Button type="button" variant="outline" onClick={onDelete}>
                <Trash2 size={16} /> Elimina
              </Button>
            ) : null}
            <Button>
              <Plus size={16} /> Salva
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
