import { useState } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section } from "./Section";
import type { Schedule } from "@/types/campaign";

interface HistoryEntry {
  round: number;
  date: string;
  window: string;
  status: string;
  messageCount: number;
}

function generateMockHistory(schedule: Schedule): HistoryEntry[] {
  if (schedule.schedule_type === "one_time") return [];
  const entries: HistoryEntry[] = [];
  const start = new Date(schedule.start_date);
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - (i + 1));
    entries.push({
      round: 5 - i,
      date: d.toLocaleDateString(),
      window: `${schedule.send_times[0] || "08:00"} – ${schedule.end_times[0] || "17:00"}`,
      status: i === 0 ? "completed" : i === 1 ? "completed" : "completed",
      messageCount: Math.floor(Math.random() * 500) + 100,
    });
  }
  return entries.reverse();
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-blue-100 text-blue-800",
  partial: "bg-yellow-100 text-yellow-800",
  skipped: "bg-muted text-muted-foreground",
};

export function ExecutionHistory({ schedule }: { schedule: Schedule }) {
  const [open, setOpen] = useState(false);

  if (schedule.schedule_type === "one_time") return null;

  const history = generateMockHistory(schedule);
  if (history.length === 0) return null;

  return (
    <Section
      icon={History}
      title="Execution History"
      action={
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} className="gap-1 text-xs">
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? "Collapse" : `Show ${history.length} runs`}
        </Button>
      }
    >
      {open ? (
        <div className="space-y-1">
          <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
            <span>Round</span>
            <span>Date</span>
            <span>Window</span>
            <span>Status</span>
            <span className="text-right">Messages</span>
          </div>
          {history.map((h) => (
            <div key={h.round} className="grid grid-cols-5 gap-2 text-sm py-1.5">
              <span className="text-muted-foreground">#{h.round}</span>
              <span>{h.date}</span>
              <span className="text-muted-foreground">{h.window}</span>
              <Badge className={`text-xs w-fit ${STATUS_COLORS[h.status] || "bg-muted"}`}>
                {h.status}
              </Badge>
              <span className="text-right font-medium">{h.messageCount}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {history.length} completed execution windows. Click to expand.
        </p>
      )}
    </Section>
  );
}
