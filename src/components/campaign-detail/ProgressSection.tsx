import { BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Section, StatCard } from "./Section";
import type { CampaignProgress } from "@/types/campaign";
import { EXECUTION_STATUS_LABELS } from "@/types/campaign";

const PROGRESS_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  STOPPED: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-destructive/10 text-destructive",
};

export function ProgressSection({ progress }: { progress: CampaignProgress }) {
  const p = progress;
  return (
    <Section icon={BarChart3} title="Execution Progress">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <div className="flex items-center gap-2">
            <Badge className={PROGRESS_STATUS_COLORS[p.status] || "bg-muted text-muted-foreground"}>
              {EXECUTION_STATUS_LABELS[p.status] || p.status}
            </Badge>
            <span className="font-medium">{p.progress_percent.toFixed(1)}%</span>
          </div>
        </div>
        <Progress value={p.progress_percent} className="h-2.5" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Messages" value={p.total_messages.toLocaleString()} />
          <StatCard label="Sent" value={p.sent_count.toLocaleString()} color="text-green-600" />
          <StatCard label="Failed" value={p.failed_count.toLocaleString()} color="text-destructive" />
          <StatCard label="Pending" value={p.pending_count.toLocaleString()} color="text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1 border-t">
          {p.started_at && (
            <span>Started: <strong className="text-foreground">{new Date(p.started_at).toLocaleString()}</strong></span>
          )}
          {p.completed_at && (
            <span>Completed: <strong className="text-foreground">{new Date(p.completed_at).toLocaleString()}</strong></span>
          )}
        </div>
      </div>
    </Section>
  );
}
