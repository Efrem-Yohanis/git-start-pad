import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FREQUENCY_LABELS, DAY_LABELS } from "@/types/campaign";
import type { Schedule, Frequency, ScheduleType } from "@/types/campaign";
import { toast } from "sonner";
import { Pencil, Save, X, Plus, Trash2 } from "lucide-react";

export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const { campaigns, updateCampaign } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Schedule | null>(null);

  if (!campaign || !campaign.schedule) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Schedule not found</p>
        <Link to="/schedules"><Button variant="outline">Back to Schedules</Button></Link>
      </div>
    );
  }

  const s = editing && draft ? draft : campaign.schedule;

  function startEdit() {
    setDraft({ ...campaign!.schedule, run_days: [...campaign!.schedule.run_days], send_times: [...campaign!.schedule.send_times], end_times: [...campaign!.schedule.end_times] });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
  }

  function saveEdit() {
    if (!draft) return;
    updateCampaign(id!, { schedule: draft });
    setEditing(false);
    setDraft(null);
    toast.success("Schedule updated");
  }

  function toggleDay(day: number) {
    if (!draft) return;
    const days = draft.run_days.includes(day) ? draft.run_days.filter((d) => d !== day) : [...draft.run_days, day].sort();
    setDraft({ ...draft, run_days: days });
  }

  function addTimeWindow() {
    if (!draft) return;
    setDraft({ ...draft, send_times: [...draft.send_times, ""], end_times: [...draft.end_times, ""] });
  }

  function removeTimeWindow(i: number) {
    if (!draft) return;
    setDraft({ ...draft, send_times: draft.send_times.filter((_, idx) => idx !== i), end_times: draft.end_times.filter((_, idx) => idx !== i) });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/schedules" className="text-sm text-muted-foreground hover:text-foreground">← Back to Schedules</Link>
          <h1 className="text-xl font-medium mt-1">Schedule — {campaign.name}</h1>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEdit} className="gap-1.5"><X className="h-4 w-4" /> Cancel</Button>
              <Button onClick={saveEdit} className="gap-1.5"><Save className="h-4 w-4" /> Save Changes</Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEdit} className="gap-1.5"><Pencil className="h-4 w-4" /> Edit Schedule</Button>
          )}
        </div>
      </div>

      {/* Schedule Type */}
      <div className="bg-card border rounded-sm p-4 mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Schedule Type</p>
        {editing ? (
          <div className="flex gap-3">
            {(["one_time", "recurring"] as ScheduleType[]).map((t) => (
              <button key={t} type="button" onClick={() => setDraft({ ...draft!, schedule_type: t })}
                className={`px-4 py-2 rounded-sm border text-sm font-medium transition-colors ${s.schedule_type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                {t === "one_time" ? "One Time" : "Recurring"}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-lg font-medium">{s.schedule_type === "one_time" ? "One Time" : "Recurring"}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-card border rounded-sm p-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</Label>
          {editing ? (
            <Input type="datetime-local" value={s.start_date} onChange={(e) => setDraft({ ...draft!, start_date: e.target.value })} className="mt-1" />
          ) : (
            <p className="text-sm mt-1">{s.start_date ? new Date(s.start_date).toLocaleString() : "—"}</p>
          )}
        </div>
        {(s.schedule_type === "recurring" || !editing) && (
          <div className="bg-card border rounded-sm p-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">End Date</Label>
            {editing ? (
              <Input type="datetime-local" value={s.end_date} onChange={(e) => setDraft({ ...draft!, end_date: e.target.value })} className="mt-1" />
            ) : (
              <p className="text-sm mt-1">{s.end_date ? new Date(s.end_date).toLocaleString() : "—"}</p>
            )}
          </div>
        )}
      </div>

      {(s.schedule_type === "recurring") && (
        <div className="bg-card border rounded-sm p-4 mb-4 space-y-4">
          {/* Frequency */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Frequency</Label>
            {editing ? (
              <Select value={s.frequency} onValueChange={(v) => setDraft({ ...draft!, frequency: v as Frequency })}>
                <SelectTrigger className="w-48 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["daily", "weekly", "monthly"] as Frequency[]).map((f) => (
                    <SelectItem key={f} value={f}>{FREQUENCY_LABELS[f]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm mt-1">{FREQUENCY_LABELS[s.frequency] ?? s.frequency}</p>
            )}
          </div>

          {/* Run Days */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Run Days</Label>
            {editing ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <label key={d} className="flex items-center gap-1.5 text-sm">
                    <Checkbox checked={s.run_days.includes(d)} onCheckedChange={() => toggleDay(d)} />
                    {DAY_LABELS[d]?.slice(0, 3)}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm mt-1">{s.run_days.length > 0 ? s.run_days.map((d) => DAY_LABELS[d]).join(", ") : "—"}</p>
            )}
          </div>

          {/* Time Windows */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Time Windows</Label>
            {editing ? (
              <div className="space-y-2 mt-1">
                {s.send_times.map((st, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input type="time" value={st} onChange={(e) => { const t = [...draft!.send_times]; t[i] = e.target.value; setDraft({ ...draft!, send_times: t }); }} className="w-32" />
                    <span className="text-muted-foreground">→</span>
                    <Input type="time" value={s.end_times[i] || ""} onChange={(e) => { const t = [...draft!.end_times]; t[i] = e.target.value; setDraft({ ...draft!, end_times: t }); }} className="w-32" />
                    {s.send_times.length > 1 && (
                      <button onClick={() => removeTimeWindow(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addTimeWindow} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Window</Button>
              </div>
            ) : s.send_times.length > 0 ? (
              <div className="space-y-1 mt-1">
                {s.send_times.map((st, i) => (
                  <p key={i} className="text-sm font-mono">{st || "—"} → {s.end_times[i] || "—"}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">—</p>
            )}
          </div>
        </div>
      )}

      {/* Active status */}
      <div className="bg-card border rounded-sm p-4">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Active</Label>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <Checkbox checked={s.is_active} onCheckedChange={(v) => setDraft({ ...draft!, is_active: !!v })} />
            <span className="text-sm">{s.is_active ? "Active" : "Inactive"}</span>
          </div>
        ) : (
          <p className={`text-lg font-medium mt-1 ${s.is_active ? "text-green-600" : "text-destructive"}`}>{s.is_active ? "Yes" : "No"}</p>
        )}
      </div>
    </div>
  );
}
