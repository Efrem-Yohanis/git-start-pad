import { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { CampaignStatus } from "@/types/campaign";
import { SCHEDULE_TYPE_LABELS } from "@/types/campaign";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Search, TrendingUp, Zap, Clock, RotateCcw,
  Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-primary/10 text-primary border-primary/20",
  archived: "bg-secondary text-secondary-foreground",
};

export default function CampaignList() {
  const { campaigns, deleteCampaign, loading, error, refetch, totalCount, page, setPage, pageSize, setPageSize } = useCampaigns();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === "active").length;
  const oneTime = campaigns.filter((c) => c.schedule?.schedule_type === "once").length;
  const recurring = campaigns.filter((c) => c.schedule?.schedule_type !== "once" && c.schedule).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your campaigns</p>
        </div>
        <Link to="/campaigns/new">
          <Button className="gap-2 shadow-soft">
            <Plus className="h-4 w-4" />
            Create campaign
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard icon={TrendingUp} label="Total" value={total} />
        <SummaryCard icon={Zap} label="Active" value={active} accent />
        <SummaryCard icon={Clock} label="One-time" value={oneTime} />
        <SummaryCard icon={RotateCcw} label="Recurring" value={recurring} />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Card className="shadow-card overflow-hidden">
          <div className="border-b bg-muted/50 px-5 py-3.5">
            <div className="grid grid-cols-9 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b last:border-b-0 px-5 py-4">
              <div className="grid grid-cols-9 gap-4 items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </Card>
      ) : error ? (
        <Card className="shadow-card">
          <CardContent className="py-16 text-center">
            <p className="text-destructive mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Execution</th>
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Sender</th>
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Channels</th>
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Recipients</th>
                  <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start</th>
                  <th className="text-right px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center text-muted-foreground">
                      No campaigns found.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium">
                      <Link to={`/campaigns/${c.id}`} className="hover:text-primary transition-colors">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={`${STATUS_STYLES[c.status]} text-xs border`}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.execution_status_display ? (
                        <Badge variant="outline" className="text-xs">{c.execution_status_display}</Badge>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-xs capitalize">
                        {SCHEDULE_TYPE_LABELS[c.schedule?.schedule_type] || c.schedule?.schedule_type || "—"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.sender_id || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {c.channels?.map((ch) => (
                          <Badge key={ch} variant="secondary" className="text-xs">
                            {ch === "sms" ? "SMS" : ch === "app_notification" ? "App" : "Flash"}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.audience?.total_count?.toLocaleString() ?? "0"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.schedule?.start_date || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 justify-end">
                        <Link to={`/campaigns/${c.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link to={`/campaigns/${c.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} · {totalCount} campaigns
            </p>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The campaign will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteCampaign(deleteId); setDeleteId(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; accent?: boolean }) {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${accent ? "bg-primary/10" : "bg-muted"}`}>
            <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
