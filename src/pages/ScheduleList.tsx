import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, CalendarClock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_LABELS } from "@/types/campaign";
import { fetchSchedules, fetchScheduleSummary } from "@/lib/api/schedules";
import type { ApiScheduleListItem, ScheduleSummary } from "@/lib/api/schedules";

const WINDOW_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function ScheduleList() {
  const [schedules, setSchedules] = useState<ApiScheduleListItem[]>([]);
  const [summary, setSummary] = useState<ScheduleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => { loadData(); }, [page]);

  async function loadData() {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetchSchedules(page, pageSize),
        page === 1 ? fetchScheduleSummary() : Promise.resolve(null),
      ]);
      setSchedules(listRes.results);
      setTotalCount(listRes.count);
      if (summaryRes) setSummary(summaryRes);
    } catch (e) {
      console.error("Failed to load schedules", e);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
          <p className="text-sm text-muted-foreground mt-1">Campaign scheduling and timing configuration</p>
        </div>
        <Link to="/campaigns/new">
          <Button className="gap-2 shadow-soft">
            <Plus className="h-4 w-4" /> Create with Schedule
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Schedules</p>
            <p className="text-2xl font-semibold">{summary.total_schedules}</p>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active</p>
            <p className="text-2xl font-semibold text-emerald-600">{summary.active_schedules}</p>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Running Today</p>
            <p className="text-2xl font-semibold text-blue-600">{summary.running_today}</p>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Inactive</p>
            <p className="text-2xl font-semibold text-muted-foreground">{summary.inactive_schedules}</p>
          </Card>
        </div>
      )}

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Summary</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Run Days</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Window Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Active</th>
                <th className="text-right px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>
                  ))}
                </tr>
              ))}
              {!loading && schedules.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        <CalendarClock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No schedules found.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && schedules.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{s.campaign_name}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className="text-xs">{s.schedule_type_display}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs max-w-[250px] truncate">{s.schedule_summary}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {s.run_days?.length > 0 ? s.run_days.map((d) => DAY_LABELS[d]?.slice(0, 3)).join(", ") : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge className={`text-xs border ${WINDOW_STATUS_COLORS[s.current_window_status] ?? "bg-muted text-muted-foreground"}`}>
                      {s.current_window_status_display}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/schedules/${s.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
