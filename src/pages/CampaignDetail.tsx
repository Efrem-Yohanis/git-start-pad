import { useParams, Link, useNavigate } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Radio } from "lucide-react";
import type { CampaignStatus, Channel } from "@/types/campaign";
import { CHANNEL_LABELS } from "@/types/campaign";

import { Section, Field } from "@/components/campaign-detail/Section";
import { ProgressSection } from "@/components/campaign-detail/ProgressSection";
import { ScheduleSection } from "@/components/campaign-detail/ScheduleSection";
import { MessageSection } from "@/components/campaign-detail/MessageSection";
import { AudienceSection } from "@/components/campaign-detail/AudienceSection";
import { ExecutionHistory } from "@/components/campaign-detail/ExecutionHistory";
import { CampaignActions } from "@/components/campaign-detail/CampaignActions";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-secondary text-secondary-foreground",
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, updateCampaign } = useCampaigns();
  const c = campaigns.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Campaign not found.</p>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">
          Back to campaigns
        </Link>
      </div>
    );
  }

  const handleStatusChange = (status: CampaignStatus) => {
    updateCampaign(c.id, { status });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{c.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(c.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
          <Badge variant="outline" className="capitalize">
            {c.schedule.schedule_type === "one_time" ? "One-time" : "Recurring"}
          </Badge>
          <Link to={`/campaigns/${c.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <CampaignActions campaign={c} onStatusChange={handleStatusChange} />

      {/* Progress */}
      {c.progress && <ProgressSection progress={c.progress} />}

      {/* Campaign Info */}
      <Section icon={Radio} title="Campaign Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Campaign Name" value={c.name} />
          <Field label="Sender ID" value={c.sender_id || "—"} />
          <Field label="Status" value={c.status} className="capitalize" />
          <div>
            <span className="text-muted-foreground">Channels</span>
            <div className="mt-1 flex gap-1 flex-wrap">
              {c.channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-xs">
                  {CHANNEL_LABELS[ch as Channel] || ch}
                </Badge>
              ))}
            </div>
          </div>
          <Field label="Created" value={new Date(c.created_at).toLocaleString()} />
          <Field label="Last Updated" value={new Date(c.updated_at).toLocaleString()} />
        </div>
      </Section>

      {/* Schedule */}
      <ScheduleSection schedule={c.schedule} />

      {/* Execution History (recurring only) */}
      <ExecutionHistory schedule={c.schedule} />

      {/* Message Content */}
      <MessageSection messageContent={c.message_content} />

      {/* Audience */}
      <AudienceSection audience={c.audience} />
    </div>
  );
}
