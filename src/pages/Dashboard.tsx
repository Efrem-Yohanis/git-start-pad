import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampaignStatus, Channel } from "@/types/campaign";
import { CHANNEL_LABELS, SCHEDULE_TYPE_LABELS } from "@/types/campaign";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, Zap, CheckCircle2, Users, Plus, ArrowRight,
} from "lucide-react";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "hsl(220 10% 60%)",
  active: "hsl(152 60% 45%)",
  paused: "hsl(40 90% 50%)",
  completed: "hsl(220 72% 50%)",
  archived: "hsl(220 10% 75%)",
};

const CHANNEL_COLORS: Record<Channel, string> = {
  sms: "hsl(220 72% 50%)",
  app_notification: "hsl(152 60% 45%)",
  flash_sms: "hsl(270 60% 55%)",
};

export default function Dashboard() {
  const { campaigns, loading } = useCampaigns();

  const statusData = useMemo(() => {
    const counts: Record<CampaignStatus, number> = { draft: 0, active: 0, paused: 0, completed: 0, archived: 0 };
    campaigns.forEach((c) => counts[c.status]++);
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({ name: status.charAt(0).toUpperCase() + status.slice(1), value: count, fill: STATUS_COLORS[status as CampaignStatus] }));
  }, [campaigns]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    campaigns.forEach((c) => c.channels?.forEach((ch) => { counts[ch] = (counts[ch] || 0) + 1; }));
    return Object.entries(counts).map(([ch, count]) => ({
      name: CHANNEL_LABELS[ch as Channel] ?? ch,
      count,
      fill: CHANNEL_COLORS[ch as Channel] ?? "hsl(220 72% 50%)",
    }));
  }, [campaigns]);

  const scheduleData = useMemo(() => {
    const counts: Record<string, number> = {};
    campaigns.forEach((c) => {
      const t = c.schedule?.schedule_type;
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: SCHEDULE_TYPE_LABELS[type as keyof typeof SCHEDULE_TYPE_LABELS] ?? type,
      count,
    }));
  }, [campaigns]);

  const recentCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5),
    [campaigns]
  );

  const active = campaigns.filter((c) => c.status === "active").length;
  const total = campaigns.length;
  const totalRecipients = campaigns.reduce((s, c) => s + (c.audience?.total_count ?? 0), 0);
  const completedCount = campaigns.filter((c) => c.status === "completed").length;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-soft">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="shadow-soft"><CardContent className="pt-6"><Skeleton className="h-56 w-full rounded-lg" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your campaign performance</p>
        </div>
        <Link to="/campaigns/new">
          <Button className="gap-2 shadow-soft">
            <Plus className="h-4 w-4" />
            Create campaign
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard icon={TrendingUp} label="Total Campaigns" value={total} />
        <KPICard icon={Zap} label="Active" value={active} accent />
        <KPICard icon={CheckCircle2} label="Completed" value={completedCount} />
        <KPICard icon={Users} label="Total Recipients" value={totalRecipients.toLocaleString()} />
      </div>

      {total === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">No campaigns yet. Create your first campaign to see analytics.</p>
            <Link to="/campaigns/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3} strokeWidth={0} label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(220 13% 91%)", boxShadow: "var(--shadow-md)" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Channel Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {channelData.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No channel data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={channelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(220 13% 91%)", boxShadow: "var(--shadow-md)" }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {channelData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Schedule + Recent */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Schedule Types</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduleData.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No schedule data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={scheduleData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} stroke="hsl(220 10% 46%)" />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(220 13% 91%)", boxShadow: "var(--shadow-md)" }} />
                      <Bar dataKey="count" fill="hsl(220 72% 50%)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Campaigns</CardTitle>
                <Link to="/campaigns" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentCampaigns.map((c) => (
                    <Link key={c.id} to={`/campaigns/${c.id}`} className="flex items-center justify-between py-2.5 hover:bg-accent rounded-lg px-3 -mx-3 transition-colors">
                      <span className="text-sm font-medium truncate mr-3">{c.name}</span>
                      <Badge variant="secondary" className="text-xs capitalize shrink-0">{c.status}</Badge>
                    </Link>
                  ))}
                  {recentCampaigns.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No campaigns</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; accent?: boolean }) {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? "bg-primary/10" : "bg-muted"}`}>
            <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${accent ? "text-primary" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
