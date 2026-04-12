import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Radio, Loader2, Play, Pause, Square, CheckCircle, Archive,
  Trash2, Edit, MoreVertical, BarChart3, Layers, Clock, Send, CheckCircle2,
  XCircle, Mail, Users, MessageSquare, CalendarClock, AlertTriangle
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import {
  fetchCampaign, fetchCampaignProgress, fetchCampaignBatches,
  startCampaign, pauseCampaign, resumeCampaign, stopCampaign,
  completeCampaign, archiveCampaign, softDeleteCampaign,
  type ApiCampaign
} from "@/lib/api";
import type { CampaignStatus, Channel } from "@/types/campaign";
import { CHANNEL_LABELS, SCHEDULE_TYPE_LABELS, LANGUAGE_LABELS, DAY_LABELS } from "@/types/campaign";
import { Section, Field } from "@/components/campaign-detail/Section";

/* ─── Status colors ─── */
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-secondary text-secondary-foreground",
};

const EXEC_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PROCESSING: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  FAILED: "bg-destructive/10 text-destructive",
  STOPPED: "bg-yellow-100 text-yellow-800",
};

/* ─── Helpers ─── */
function pct(v: number, t: number) {
  return t === 0 ? "0%" : `${((v / t) * 100).toFixed(1)}%`;
}

/* ─── Main Component ─── */
export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const numId = Number(id);

  const [confirmAction, setConfirmAction] = useState<{
    label: string; description: string; variant: "default" | "destructive";
    action: () => Promise<any>;
  } | null>(null);
  const [acting, setActing] = useState(false);
  const [batchPage, setBatchPage] = useState(1);

  // Campaign detail
  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["campaign", numId],
    queryFn: () => fetchCampaign(numId),
    enabled: !!numId,
    refetchInterval: 15000,
  });

  // Progress
  const { data: progressData } = useQuery({
    queryKey: ["campaign-progress", numId],
    queryFn: () => fetchCampaignProgress(numId),
    enabled: !!numId,
    refetchInterval: 10000,
  });

  // Batches
  const { data: batchesData } = useQuery({
    queryKey: ["campaign-batches", numId, batchPage],
    queryFn: () => fetchCampaignBatches(numId),
    enabled: !!numId,
    refetchInterval: 15000,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["campaign", numId] });
    queryClient.invalidateQueries({ queryKey: ["campaign-progress", numId] });
    queryClient.invalidateQueries({ queryKey: ["campaign-batches", numId] });
  }, [queryClient, numId]);

  async function execAction(action: () => Promise<any>, label: string) {
    setActing(true);
    try {
      const res = await action();
      toast.success(res?.message || `${label} successful`);
      invalidate();
    } catch (err: any) {
      toast.error(`Failed to ${label.toLowerCase()}: ${err.message}`);
    } finally {
      setActing(false);
      setConfirmAction(null);
    }
  }

  function confirmAndExec(label: string, description: string, action: () => Promise<any>, variant: "default" | "destructive" = "default") {
    setConfirmAction({ label, description, variant, action });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Campaign not found.</p>
        <Link to="/campaigns" className="text-primary hover:underline mt-2 inline-block">Back to campaigns</Link>
      </div>
    );
  }

  const c = campaign;
  const p = progressData?.progress;
  const batches = progressData?.batches;
  const recentBatches = (progressData as any)?.recent_batches || [];
  const batchList = Array.isArray(batchesData) ? batchesData : (batchesData as any)?.results || recentBatches;

  const channels: string[] = Array.isArray(c.channels)
    ? c.channels
    : Object.values(c.channels || {});

  return (
    <div className="space-y-6 w-full">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/campaigns")}>
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
          <Badge className={STATUS_COLORS[c.status] || "bg-muted"}>{c.status}</Badge>
          {c.execution_status_display && (
            <Badge className={EXEC_STATUS_COLORS[c.execution_status] || ""} variant="outline">
              {c.execution_status_display}
            </Badge>
          )}
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to={`/campaigns/${c.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
        </Link>

        {c.can_start && (
          <Button size="sm" disabled={acting} className="gap-1.5"
            onClick={() => confirmAndExec("Start Campaign", "This will begin sending messages to the audience. Make sure schedule, audience, and content are configured.", () => startCampaign(numId))}>
            <Play className="h-3.5 w-3.5" /> Start
          </Button>
        )}
        {c.can_pause && (
          <Button size="sm" variant="outline" disabled={acting} className="gap-1.5"
            onClick={() => confirmAndExec("Pause Campaign", "Pause this campaign? You can resume later.", () => pauseCampaign(numId))}>
            <Pause className="h-3.5 w-3.5" /> Pause
          </Button>
        )}
        {c.can_resume && (
          <Button size="sm" disabled={acting} className="gap-1.5"
            onClick={() => confirmAndExec("Resume Campaign", "Resume sending messages from where it left off.", () => resumeCampaign(numId))}>
            <Play className="h-3.5 w-3.5" /> Resume
          </Button>
        )}
        {c.can_stop && (
          <Button size="sm" variant="destructive" disabled={acting} className="gap-1.5"
            onClick={() => confirmAndExec("Stop Campaign", "This will permanently stop the campaign. It cannot be resumed. Are you sure?", () => stopCampaign(numId), "destructive")}>
            <Square className="h-3.5 w-3.5" /> Stop
          </Button>
        )}

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {c.can_complete && (
              <DropdownMenuItem onClick={() => confirmAndExec("Complete Campaign", "Mark this campaign as completed.", () => completeCampaign(numId))}>
                <CheckCircle className="h-4 w-4 mr-2" /> Mark Complete
              </DropdownMenuItem>
            )}
            {c.status === "completed" && (
              <DropdownMenuItem onClick={() => confirmAndExec("Archive Campaign", "Archive this campaign? It will be hidden from the active list.", () => archiveCampaign(numId))}>
                <Archive className="h-4 w-4 mr-2" /> Archive
              </DropdownMenuItem>
            )}
            {c.status !== "active" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive"
                  onClick={() => confirmAndExec("Delete Campaign", "This campaign will be moved to trash. Are you sure?", async () => { await softDeleteCampaign(numId); navigate("/campaigns"); }, "destructive")}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ─── Readiness Check ─── */}
      {c.status === "draft" && (
        <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" /> Campaign Readiness
          </h3>
          <div className="flex gap-4 text-sm">
            <span className={c.schedule ? "text-green-600" : "text-destructive"}>
              {c.schedule ? "✓" : "✗"} Schedule
            </span>
            <span className={c.audience ? "text-green-600" : "text-destructive"}>
              {c.audience ? "✓" : "✗"} Audience
            </span>
            <span className={c.message_content ? "text-green-600" : "text-destructive"}>
              {c.message_content ? "✓" : "✗"} Message Content
            </span>
          </div>
        </div>
      )}

      {/* ─── Progress Section ─── */}
      {p && (
        <Section icon={BarChart3} title="Execution Progress">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{Number(p.progress_percent ?? 0).toFixed(1)}%</span>
              </div>
              <Progress value={p.progress_percent ?? 0} className="h-3" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatBox icon={Mail} label="Total" value={p.total_messages} color="text-foreground" />
              <StatBox icon={Send} label="Sent" value={p.sent_count} color="text-green-600" />
              <StatBox icon={CheckCircle2} label="Delivered" value={p.delivered_count} color="text-blue-600" />
              <StatBox icon={XCircle} label="Failed" value={p.failed_count} color="text-destructive" />
              <StatBox icon={Clock} label="Pending" value={p.pending_count} color="text-muted-foreground" />
            </div>

            {p.total_messages > 0 && (
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                <span>Delivery Rate: <strong className="text-foreground">{pct(p.delivered_count, p.total_messages)}</strong></span>
                <span>Send Rate: <strong className="text-foreground">{pct(p.sent_count, p.total_messages)}</strong></span>
                <span>Failure Rate: <strong className="text-foreground">{pct(p.failed_count, p.total_messages)}</strong></span>
              </div>
            )}

            {/* Batch summary */}
            {batches && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-4">
                <StatBox icon={Layers} label="Total Batches" value={batches.total_batches} color="text-foreground" />
                <StatBox icon={CheckCircle2} label="Completed" value={batches.completed_batches} color="text-green-600" />
                <StatBox icon={Loader2} label="In Progress" value={batches.in_progress_batches} color="text-yellow-600" />
                <StatBox icon={XCircle} label="Failed" value={batches.failed_batches} color="text-destructive" />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ─── Batches Table ─── */}
      {batchList.length > 0 && (
        <Section icon={Layers} title="Recent Batches">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Success</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchList.map((b: any, i: number) => (
                  <TableRow key={b.batch_id || i}>
                    <TableCell className="font-mono text-xs">{b.batch_id || `#${i + 1}`}</TableCell>
                    <TableCell className="text-right">{b.total_messages?.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">{b.success_count?.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-destructive">{b.failed_count?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${EXEC_STATUS_COLORS[b.status] || "bg-muted"}`}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.created_at ? new Date(b.created_at).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>
      )}

      {/* ─── Campaign Info ─── */}
      <Section icon={Radio} title="Campaign Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Campaign Name" value={c.name} />
          <Field label="Sender ID" value={c.sender_id || "—"} />
          <Field label="Status" value={c.status} className="capitalize" />
          <Field label="Execution Status" value={c.execution_status_display || c.execution_status || "—"} />
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wider">Channels</span>
            <div className="mt-1 flex gap-1 flex-wrap">
              {channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-xs">
                  {CHANNEL_LABELS[ch as Channel] || ch}
                </Badge>
              ))}
            </div>
          </div>
          <Field label="Created" value={new Date(c.created_at).toLocaleString()} />
          <Field label="Last Updated" value={new Date(c.updated_at).toLocaleString()} />
          {(c as any).execution_started_at && (
            <Field label="Execution Started" value={new Date((c as any).execution_started_at).toLocaleString()} />
          )}
          <Field label="Total Processed" value={String(c.total_processed ?? 0)} />
          <Field label="Last Processed ID" value={String(c.last_processed_id ?? 0)} />
        </div>
      </Section>

      {/* ─── Schedule ─── */}
      {c.schedule && <ScheduleInfo schedule={c.schedule} />}

      {/* ─── Message Content ─── */}
      {c.message_content && <MessageInfo mc={c.message_content} />}

      {/* ─── Audience ─── */}
      {c.audience && <AudienceInfo audience={c.audience} />}

      {/* ─── Confirm Dialog ─── */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={acting}
              className={confirmAction?.variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => confirmAction && execAction(confirmAction.action, confirmAction.label)}
            >
              {acting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Sub-components ─── */

function StatBox({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-card border rounded-sm px-4 py-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-xl font-semibold ${color}`}>{(value ?? 0).toLocaleString()}</p>
    </div>
  );
}

function ScheduleInfo({ schedule: s }: { schedule: NonNullable<ApiCampaign["schedule"]> }) {
  const isOneTime = s.schedule_type === "once";
  const tw = s.time_windows;
  const windows = Array.isArray(tw) ? tw : Object.values(tw || {});

  return (
    <Section icon={CalendarClock} title="Schedule">
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3 pb-3 border-b">
          <span className="font-medium">
            {s.schedule_type_display || (isOneTime ? "One-time" : s.schedule_type)}
          </span>
          {s.schedule_summary && (
            <span className="text-muted-foreground">— {s.schedule_summary}</span>
          )}
          <Badge className={`ml-auto ${s.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
            {s.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Start Date" value={s.start_date} />
          {s.end_date && <Field label="End Date" value={s.end_date} />}
          <Field label="Timezone" value={s.timezone || "UTC"} />
          {s.next_run_date && <Field label="Next Run" value={s.next_run_date} />}
        </div>

        {windows.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Delivery Windows</span>
            <div className="mt-2 space-y-1.5">
              {windows.map((w: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/40 rounded-sm px-4 py-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{w.start || w}</span>
                  {w.end && <>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{w.end}</span>
                  </>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

function MessageInfo({ mc }: { mc: NonNullable<ApiCampaign["message_content"]> }) {
  const langs = Array.isArray(mc.languages_available)
    ? mc.languages_available
    : typeof mc.languages_available === "string"
      ? [mc.languages_available]
      : [];

  const preview = typeof mc.preview === "object" && mc.preview
    ? mc.preview
    : typeof mc.preview === "string"
      ? { language: mc.default_language, preview: mc.preview }
      : null;

  return (
    <Section icon={MessageSquare} title="Message Content">
      <div className="space-y-3 text-sm">
        <Field label="Default Language" value={LANGUAGE_LABELS[mc.default_language as keyof typeof LANGUAGE_LABELS] || mc.default_language} />
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Languages Available</span>
          <div className="mt-1 flex gap-1 flex-wrap">
            {langs.map((l) => (
              <Badge key={l} variant="secondary" className="text-xs">
                {LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS] || l}
              </Badge>
            ))}
          </div>
        </div>
        {preview && (
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Preview ({preview.language})</span>
            <p className="mt-1 bg-secondary/50 rounded-sm px-3 py-2 whitespace-pre-wrap">{preview.preview}</p>
          </div>
        )}
        {mc.content && typeof mc.content === "object" && Object.keys(mc.content).length > 0 && (
          <div className="space-y-2 border-t pt-3">
            {Object.entries(mc.content).map(([lang, text]) => (
              <div key={lang}>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {LANGUAGE_LABELS[lang as keyof typeof LANGUAGE_LABELS] || lang}
                  {lang === mc.default_language && " (default)"}
                </span>
                <p className="mt-1 bg-secondary/50 rounded-sm px-3 py-2 whitespace-pre-wrap text-sm">{text as string}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

function AudienceInfo({ audience: a }: { audience: NonNullable<ApiCampaign["audience"]> }) {
  const total = a.total_count ?? 0;
  const valid = a.valid_count ?? 0;
  const invalid = a.invalid_count ?? 0;
  const validPct = typeof a.valid_percentage === "number" ? a.valid_percentage : parseFloat(String(a.valid_percentage)) || 0;

  return (
    <Section icon={Users} title="Audience">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox icon={Users} label="Total Recipients" value={total} color="text-foreground" />
          <StatBox icon={CheckCircle2} label="Valid" value={valid} color="text-green-600" />
          <StatBox icon={XCircle} label="Invalid" value={invalid} color="text-destructive" />
          <div className="bg-card border rounded-sm px-4 py-3 space-y-1">
            <span className="text-xs text-muted-foreground">Valid %</span>
            <p className="text-xl font-semibold text-green-600">{validPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
