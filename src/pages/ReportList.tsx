import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Eye, FileBarChart, PlayCircle, CheckCircle2, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchReports, ReportConfig, REPORT_FREQUENCIES } from "@/lib/api/reports";

const freqLabel = (v: string) => REPORT_FREQUENCIES.find((f) => f.value === v)?.label ?? v;

export default function ReportList() {
  const [data, setData] = useState<ReportConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchReports({ page_size: 100 });
      setData(res.results ?? []);
    } catch {
      toast.error("Failed to load reports");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = data.filter((r) => r.is_active).length;

  const stats = [
    { label: "Total Reports", value: data.length, icon: FileBarChart },
    { label: "Active", value: active, icon: CheckCircle2 },
    { label: "Inactive", value: data.length - active, icon: PauseCircle },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Scheduled campaign performance reports</p>
        </div>
        <Button asChild>
          <Link to="/reports/create"><Plus className="h-4 w-4 mr-1" /> New Report</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{loading ? "—" : s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Frequency</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Campaigns</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Recipients</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Run</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No reports yet</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-3">{freqLabel(r.frequency)}</td>
                  <td className="px-4 py-3">
                    {r.campaigns?.length ? r.campaigns.map((c) => c.name).join(", ") : <span className="text-muted-foreground">All</span>}
                  </td>
                  <td className="px-4 py-3">
                    {(r.recipients?.length ?? 0) + (r.send_to_campaign_owners ? 1 : 0) === 0
                      ? <span className="text-muted-foreground">—</span>
                      : `${r.recipients?.length ?? 0} email(s)${r.send_to_campaign_owners ? " + owners" : ""}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.last_run_at ? new Date(r.last_run_at).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/reports/${r.id}`}><Eye className="h-3.5 w-3.5 mr-1" /> View</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
