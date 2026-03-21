import { useCampaigns } from "@/context/CampaignContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_LABELS } from "@/types/campaign";
import type { Language } from "@/types/campaign";

export default function AudienceList() {
  const { campaigns } = useCampaigns();

  const audiences = campaigns
    .filter((c) => c.audience && c.audience.total_count > 0)
    .map((c) => ({
      campaignId: c.id,
      campaignName: c.name,
      status: c.status,
      audience: c.audience,
    }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium">Audiences</h1>
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Valid</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Invalid</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Languages</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {audiences.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No audiences found.
                </td>
              </tr>
            )}
            {audiences.map((a) => {
              const langs = [...new Set(a.audience.recipients.map((r) => r.lang))];
              return (
                <tr key={a.campaignId} className="border-b last:border-b-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{a.campaignName}</td>
                  <td className="px-4 py-3 capitalize">{a.status}</td>
                  <td className="px-4 py-3">{a.audience.total_count.toLocaleString()}</td>
                  <td className="px-4 py-3">{a.audience.valid_count.toLocaleString()}</td>
                  <td className="px-4 py-3">{a.audience.invalid_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {langs.map((l) => (
                        <Badge key={l} variant="secondary" className="text-xs">
                          {LANGUAGE_LABELS[l as Language] ?? l}
                        </Badge>
                      ))}
                      {langs.length === 0 && <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/audiences/${a.campaignId}`} className="text-sm text-primary hover:underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
