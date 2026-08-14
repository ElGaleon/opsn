import { Deadline } from "@shared/lib/api";
import { SectionPanel } from "@shared/components/SectionPanel";
import { Stat } from "@shared/components/Stat";
import { Badge } from "@shared/components/ui/badge";

export function DeadlineList({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <SectionPanel
      title="Scadenze"
      stats={
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Scadenze" value={deadlines.length} />
          <Stat
            label="Aperte"
            value={
              deadlines.filter((deadline) => deadline.status === "open").length
            }
            tone="bad"
          />
          <Stat
            label="Chiuse"
            value={
              deadlines.filter((deadline) => deadline.status === "done").length
            }
            tone="good"
          />
        </div>
      }
      contentClassName="space-y-2"
    >
      {deadlines.map((deadline) => (
        <div
          key={deadline.id}
          className="flex items-center justify-between rounded-md border border-stone-200 bg-white/70 p-3"
        >
          <span>{deadline.title}</span>
          <Badge>{deadline.due_date}</Badge>
        </div>
      ))}
    </SectionPanel>
  );
}
