import { useParams, Link, useNavigate } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Radio, Loader2 } from "lucide-react";
import type { CampaignStatus, Channel, Campaign } from "@/types/campaign";
import { CHANNEL_LABELS, SCHEDULE_TYPE_LABELS } from "@/types/campaign";
import { useState, useEffect, useCallback } from "react";

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
  const { campaigns, fetchSingleCampaign, refetch } = useCampaigns();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);

  const loadCampaign = useCallback(async () => {
    // Try from context first
    const fromCtx = campaigns.find((x) => x.id === id);
    if (fromCtx) {
      setCampaign(fromCtx);
    }
    // Always fetch fresh from API
    if (id) {
      const fresh = await fetchSingleCampaign(id);
      if (fresh) setCampaign(fresh);
      else if (!fromCtx) setCampaign(null);
    }
  }, [id, campaigns, fetchSingleCampaign]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleActionComplete = useCallback(() => {
    // Refetch both list and detail
    refetch();
    if (id) fetchSingleCampaign(id).then((c) => c && setCampaign(c));
  }, [id, refetch, fetchSingleCampaign]);

  if (campaign === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Campaign not found.</p>
        <Link to="/campaigns" className="text-primary hover:underline mt-2 inline-block">Back to campaigns</Link>
      </div>
    );
  }

  const c = campaign;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{c.name}</h1>
            <p className="text-sm text-muted-foreground">Created {new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={STATUS_COLORS[c.status]}>{c.status}</Badge>
          {c.execution_status_display && (
            <Badge variant="outline">{c.execution_status_display}</Badge>
          )}
          {c.schedule && (
            <Badge variant="outline" className="capitalize">
              {SCHEDULE_TYPE_LABELS[c.schedule.schedule_type]}
            </Badge>
          )}
          <Link to={`/campaigns/${c.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>
      </div>

      <CampaignActions campaign={c} onActionComplete={handleActionComplete} />

      {c.progress && (
        <ProgressSection
          progress={c.progress}
          schedule={c.schedule}
          rounds={c.execution_rounds}
          campaignName={c.name}
          senderId={c.sender_id}
        />
      )}

      {c.execution_rounds && c.execution_rounds.length > 0 && (
        <ExecutionHistory
          rounds={c.execution_rounds}
          isOneTime={c.schedule?.schedule_type === "once"}
        />
      )}

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

      {c.schedule && <ScheduleSection schedule={c.schedule} />}
      {c.message_content && <MessageSection messageContent={c.message_content} />}
      {c.audience && <AudienceSection audience={c.audience} />}
    </div>
  );
}
