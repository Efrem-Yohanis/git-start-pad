import { useCampaigns } from "@/context/CampaignContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FREQUENCY_LABELS, DAY_LABELS } from "@/types/campaign";

export default function ScheduleList() {
  const { campaigns } = useCampaigns();

  const schedules = campaigns
    .filter((c) => c.schedule)
    .map((c) => ({
      campaignId: c.id,
      campaignName: c.name,
      status: c.status,
      schedule: c.schedule,
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Schedules</h1>
        <Link to="/campaigns/new">
          <Button>Create Campaign with Schedule</Button>
        </Link>
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Frequency</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Run Days</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">End</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Active</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No schedules found.
                </td>
              </tr>
            )}
            {schedules.map((s) => (
              <tr key={s.campaignId} className="border-b last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{s.campaignName}</td>
                <td className="px-4 py-3 capitalize">{s.status}</td>
                <td className="px-4 py-3 capitalize">{FREQUENCY_LABELS[s.schedule.frequency] ?? s.schedule.frequency}</td>
                <td className="px-4 py-3 text-xs">
                  {s.schedule.run_days.map((d) => DAY_LABELS[d]?.slice(0, 3)).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.schedule.start_date ? new Date(s.schedule.start_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.schedule.end_date ? new Date(s.schedule.end_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={s.schedule.is_active ? "text-green-600" : "text-muted-foreground"}>
                    {s.schedule.is_active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/schedules/${s.campaignId}`} className="text-sm text-primary hover:underline">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
