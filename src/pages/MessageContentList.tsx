import { useCampaigns } from "@/context/CampaignContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/types/campaign";
import type { Language } from "@/types/campaign";

export default function MessageContentList() {
  const { campaigns } = useCampaigns();

  const messages = campaigns
    .filter((c) => c.message_content)
    .map((c) => {
      const filledLangs = SUPPORTED_LANGUAGES.filter(
        (l) => c.message_content.content[l]?.trim()
      );
      return {
        campaignId: c.id,
        campaignName: c.name,
        status: c.status,
        defaultLang: c.message_content.default_language,
        filledLangs,
        preview: c.message_content.content[c.message_content.default_language]?.slice(0, 60) || "—",
      };
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Message Content</h1>
        <Link to="/campaigns/new">
          <Button>Create Campaign with Content</Button>
        </Link>
      </div>

      <div className="bg-card border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Default Language</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Languages</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Preview</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No message content found.
                </td>
              </tr>
            )}
            {messages.map((m) => (
              <tr key={m.campaignId} className="border-b last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{m.campaignName}</td>
                <td className="px-4 py-3 capitalize">{m.status}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">{LANGUAGE_LABELS[m.defaultLang]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {m.filledLangs.map((l) => (
                      <Badge key={l} variant="secondary" className="text-xs">
                        {LANGUAGE_LABELS[l as Language]}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                  {m.preview}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/messages/${m.campaignId}`} className="text-sm text-primary hover:underline">
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
