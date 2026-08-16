import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCampaigns } from "@/lib/api";
import type { ApiCampaign } from "@/lib/api";

interface CampaignSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function CampaignSelector({ value, onValueChange, className }: CampaignSelectorProps) {
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const all: ApiCampaign[] = [];
        let page = 1;
        const pageSize = 100;
        while (true) {
          const res = await fetchCampaigns({ page, pageSize });
          all.push(...res.results);
          if (!res.next || res.results.length < pageSize) break;
          page += 1;
        }
        setCampaigns(all);
      } catch (e) {
        console.error("Failed to load campaigns", e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);


  if (loading) return <Skeleton className="h-10 w-full" />;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a campaign" />
      </SelectTrigger>
      <SelectContent>
        {campaigns.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            #{c.id} — {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
