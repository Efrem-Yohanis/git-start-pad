import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, MoreVertical, Pencil, Trash2, PlayCircle, Power, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ReportConfig,
  REPORT_FREQUENCIES,
  fetchReport,
  deleteReport,
  triggerReport,
  runReport,
  toggleReportStatus,
} from "@/lib/api/reports";

const freqLabel = (v: string) => REPORT_FREQUENCIES.find((f) => f.value === v)?.label ?? v;

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"delete" | "trigger" | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setReport(await fetchReport(Number(id)));
    } catch {
      toast.error("Failed to load report");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const doTrigger = async () => {
    if (!id) return;
    setBusy("trigger");
    try {
      const res = await triggerReport(Number(id));
      if (res?.status === "error" || res?.reason) toast.error(res.message || res.reason || "Trigger failed");
      else toast.success(res?.message || `Report sent${res?.sent ? ` to ${res.sent} recipient(s)` : ""}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Trigger failed");
    }
    setBusy(null);
  };

  const doRun = async () => {
    if (!id) return;
    setBusy("run");
    try {
      const res = await runReport(Number(id));
      if (res?.status === "error") toast.error(res.message || "Run failed");
      else toast.success(res?.message || "Report generated");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Run failed");
    }
    setBusy(null);
  };

  const doToggle = async () => {
    if (!id) return;
    setBusy("toggle");
    try {
      await toggleReportStatus(Number(id));
      toast.success(report?.is_active ? "Report deactivated" : "Report activated");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
    setBusy(null);
  };

  const doDelete = async () => {
    if (!id) return;
    setBusy("delete");
    try {
      await deleteReport(Number(id));
      toast.success("Report deleted");
      navigate("/reports");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
      setBusy(null);
    }
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;
  if (!report) return <div className="p-6 text-muted-foreground">Report not found.</div>;

  const info: { label: string; value: React.ReactNode }[] = [
    { label: "Frequency", value: freqLabel(report.frequency) },
    { label: "Email Service", value: report.email_service?.name ?? "Default" },
    { label: "Send to Owners", value: report.send_to_campaign_owners ? "Yes" : "No" },
    { label: "Last Run", value: report.last_run_at ? new Date(report.last_run_at).toLocaleString() : "Never" },
    { label: "Created", value: report.created_at ? new Date(report.created_at).toLocaleString() : "—" },
    { label: "Report ID", value: `#${report.id}` },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <Card>
        <CardHeader className="space-y-3">
          <Link to="/reports" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Reports
          </Link>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-xl">{report.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {freqLabel(report.frequency)}
                {report.description ? ` — ${report.description}` : ""}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant={report.is_active ? "default" : "secondary"}>
                  {report.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={busy !== null}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setConfirm("trigger")}>
                  <Send className="h-4 w-4 mr-2" /> Trigger Now
                </DropdownMenuItem>
                <DropdownMenuItem onClick={doRun}>
                  <PlayCircle className="h-4 w-4 mr-2" /> Run (Preview)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={doToggle}>
                  <Power className="h-4 w-4 mr-2" /> {report.is_active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/reports/${report.id}/edit`)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirm("delete")}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {info.map((i) => (
              <div key={i.label}>
                <p className="text-xs text-muted-foreground">{i.label}</p>
                <p className="text-sm text-foreground">{i.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Campaigns</CardTitle></CardHeader>
          <CardContent>
            {report.campaigns?.length ? (
              <div className="flex flex-wrap gap-2">
                {report.campaigns.map((c) => (
                  <Link key={c.id} to={`/campaigns/${c.id}`}>
                    <Badge variant="secondary">{c.name}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All campaigns included.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recipients</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {report.send_to_campaign_owners && (
              <p className="text-sm text-foreground">Campaign owners</p>
            )}
            {report.recipients?.length ? (
              <div className="flex flex-wrap gap-2">
                {report.recipients.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}
              </div>
            ) : (
              !report.send_to_campaign_owners && <p className="text-sm text-muted-foreground">No recipients configured.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={() => setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "delete" ? "Delete this report?" : "Send this report now?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "delete"
                ? "This action cannot be undone."
                : "The report will be generated and emailed to all configured recipients immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const c = confirm;
                setConfirm(null);
                if (c === "delete") doDelete(); else doTrigger();
              }}
            >
              {confirm === "delete" ? "Delete" : "Send Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
