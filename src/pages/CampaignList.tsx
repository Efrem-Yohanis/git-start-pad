import { useState } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { CampaignStatus } from "@/types/campaign";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-secondary text-secondary-foreground",
};

export default function CampaignList() {
  const { campaigns, deleteCampaign } = useCampaigns();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* Summary stats */
  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === "active").length;
  const oneTime = campaigns.filter((c) => c.schedule?.schedule_type === "one_time").length;
  const recurring = campaigns.filter((c) => c.schedule?.schedule_type === "recurring").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Campaigns</h1>
        <Link to="/campaigns/new">
          <Button>Create campaign</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Total" value={total} />
        <SummaryCard label="Active" value={active} />
        <SummaryCard label="One-time" value={oneTime} />
        <SummaryCard label="Recurring" value={recurring} />
      </div>

      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as CampaignStatus | "all")}
        >
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

      <div className="bg-card border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Sender</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Channels</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Recipients</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No campaigns found.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">
                  <Link to={`/campaigns/${c.id}`} className="hover:underline text-primary">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_COLORS[c.status]} text-xs`}>{c.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs capitalize">
                    {c.schedule?.schedule_type === "one_time" ? "One-time" : "Recurring"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{c.sender_id || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {c.channels?.map((ch) => (
                      <Badge key={ch} variant="secondary" className="text-xs">
                        {ch === "sms" ? "SMS" : ch === "app_notification" ? "App" : "Flash"}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{c.audience?.total_count?.toLocaleString() ?? "0"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.schedule?.start_date ? new Date(c.schedule.start_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link to={`/campaigns/${c.id}`} className="text-sm text-primary hover:underline">View</Link>
                  <Link to={`/campaigns/${c.id}/edit`} className="text-sm text-primary hover:underline">Edit</Link>
                  <button onClick={() => setDeleteId(c.id)} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border rounded-sm px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
