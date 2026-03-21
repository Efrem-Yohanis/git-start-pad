import { Play, Pause, Square, CheckCircle, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/types/campaign";

interface CampaignActionsProps {
  campaign: Campaign;
  onStatusChange: (status: Campaign["status"]) => void;
}

export function CampaignActions({ campaign, onStatusChange }: CampaignActionsProps) {
  const s = campaign.status;
  const isRecurring = campaign.schedule.schedule_type === "recurring";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {s === "draft" && (
        <Button size="sm" onClick={() => onStatusChange("active")} className="gap-1.5">
          <Play className="h-3.5 w-3.5" /> Start Campaign
        </Button>
      )}
      {s === "active" && (
        <>
          <Button size="sm" variant="outline" onClick={() => onStatusChange("paused")} className="gap-1.5">
            <Pause className="h-3.5 w-3.5" /> Pause
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onStatusChange("completed")} className="gap-1.5">
            <Square className="h-3.5 w-3.5" /> Stop
          </Button>
        </>
      )}
      {s === "paused" && (
        <>
          <Button size="sm" onClick={() => onStatusChange("active")} className="gap-1.5">
            <Play className="h-3.5 w-3.5" /> Resume
          </Button>
          <Button size="sm" variant="outline" onClick={() => onStatusChange("completed")} className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Complete
          </Button>
        </>
      )}
      {isRecurring && s !== "archived" && s !== "completed" && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
          <Repeat className="h-3 w-3" /> Auto-resets each cycle
        </span>
      )}
    </div>
  );
}
