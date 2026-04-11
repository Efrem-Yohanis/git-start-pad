import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAY_LABELS, SCHEDULE_TYPE_LABELS } from "@/types/campaign";
import type { ScheduleType } from "@/types/campaign";
import { toast } from "sonner";
import { Pencil, Save, X, Plus, Trash2, ArrowLeft, Power, PowerOff, RotateCcw } from "lucide-react";
import { fetchScheduleDetail, updateScheduleById, activateSchedule, deactivateSchedule, resetSchedule } from "@/lib/api/schedules";
import type { ApiScheduleDetail } from "@/lib/api/schedules";

export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const [schedule, setSchedule] = useState<ApiScheduleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { if (id) loadData(); }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchScheduleDetail(Number(id));
      setSchedule(data);
    } catch (e) {
      console.error("Failed to load schedule", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Schedule not found</p>
        <Link to="/schedules"><Button variant="outline">Back to Schedules</Button></Link>
      </div>
    );
  }

  const s = editing && draft ? { ...schedule, ...draft } : schedule;

  function startEdit() {
    setDraft({
      schedule_type: schedule!.schedule_type,
      start_date: schedule!.start_date,
      end_date: schedule!.end_date || "",
      run_days: [...(schedule!.run_days || [])],
      time_windows: schedule!.time_windows.map(tw => ({ ...tw })),
      timezone: schedule!.timezone,
      auto_reset: schedule!.auto_reset,
    });
    setEditing(true);
  }

  function cancelEdit() { setDraft(null); setEditing(false); }

  async function saveEdit() {
    if (!draft) return;
    try {
      const updated = await updateScheduleById(Number(id), draft);
      setSchedule(updated);
      setEditing(false);
      setDraft(null);
      toast.success("Schedule updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update schedule");
    }
  }

  function toggleDay(day: number) {
    if (!draft) return;
    const days = ((draft.run_days as number[]) || []);
    const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort();
    setDraft({ ...draft, run_days: newDays });
  }

  function addTimeWindow() {
    if (!draft) return;
    setDraft({ ...draft, time_windows: [...(draft.time_windows as any[]), { start: "", end: "" }] });
  }

  function removeTimeWindow(i: number) {
    if (!draft) return;
    const tw = draft.time_windows as any[];
    if (tw.length <= 1) return;
    setDraft({ ...draft, time_windows: tw.filter((_, idx) => idx !== i) });
  }

  async function handleActivate() {
    try {
      await activateSchedule(Number(id));
      await loadData();
      toast.success("Schedule activated");
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleDeactivate() {
    try {
      await deactivateSchedule(Number(id));
      await loadData();
      toast.success("Schedule deactivated");
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleReset() {
    try {
      await resetSchedule(Number(id));
      await loadData();
      toast.success("Schedule reset");
    } catch (e: any) { toast.error(e.message); }
  }

  const timeWindows = (editing ? (draft?.time_windows as any[]) : s.time_windows) || [];
  const runDays = (editing ? (draft?.run_days as number[]) : s.run_days) || [];
  const schedType = (editing ? (draft?.schedule_type as string) : s.schedule_type) || "once";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/schedules" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Schedules
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Schedule — {s.campaign_name}</h1>
          {s.schedule_summary && <p className="text-sm text-muted-foreground mt-1">{s.schedule_summary}</p>}
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              {s.is_active ? (
                <Button variant="outline" size="sm" onClick={handleDeactivate} className="gap-1.5"><PowerOff className="h-3.5 w-3.5" /> Deactivate</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleActivate} className="gap-1.5"><Power className="h-3.5 w-3.5" /> Activate</Button>
              )}
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Reset</Button>
              <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
            </>
          )}
          {editing && (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} className="gap-1.5"><X className="h-3.5 w-3.5" /> Cancel</Button>
              <Button size="sm" onClick={saveEdit} className="gap-1.5"><Save className="h-3.5 w-3.5" /> Save</Button>
            </>
          )}
        </div>
      </div>

      {/* Execution info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase mb-1">Current Round</p>
          <p className="text-2xl font-semibold">{s.current_round}</p>
        </Card>
        <Card className="p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase mb-1">Windows Completed</p>
          <p className="text-2xl font-semibold">{s.total_windows_completed}</p>
        </Card>
        <Card className="p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase mb-1">Next Run</p>
          <p className="text-sm font-medium">{s.next_run_date || "—"}</p>
        </Card>
        <Card className="p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase mb-1">Status</p>
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${s.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
            {s.is_active ? "Active" : "Inactive"}
          </span>
        </Card>
      </div>

      {/* Schedule config */}
      <Card className="p-5 shadow-card space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Schedule Type</Label>
          {editing ? (
            <Select value={schedType} onValueChange={(v) => setDraft({ ...draft!, schedule_type: v })}>
              <SelectTrigger className="w-48 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["once", "daily", "weekly", "monthly"] as ScheduleType[]).map(t => (
                  <SelectItem key={t} value={t}>{SCHEDULE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-medium mt-1">{s.schedule_type_display}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</Label>
            {editing ? (
              <Input type="date" value={(draft?.start_date as string) || ""} onChange={e => setDraft({ ...draft!, start_date: e.target.value })} className="mt-1" />
            ) : (
              <p className="text-sm mt-1">{s.start_date}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">End Date</Label>
            {editing ? (
              <Input type="date" value={(draft?.end_date as string) || ""} onChange={e => setDraft({ ...draft!, end_date: e.target.value })} className="mt-1" />
            ) : (
              <p className="text-sm mt-1">{s.end_date || "—"}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Timezone</Label>
            {editing ? (
              <Input value={(draft?.timezone as string) || ""} onChange={e => setDraft({ ...draft!, timezone: e.target.value })} className="mt-1" />
            ) : (
              <p className="text-sm mt-1">{s.timezone}</p>
            )}
          </div>
        </div>

        {schedType === "weekly" && (
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Run Days</Label>
            {editing ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {[0,1,2,3,4,5,6].map(d => (
                  <label key={d} className="flex items-center gap-1.5 text-sm">
                    <Checkbox checked={runDays.includes(d)} onCheckedChange={() => toggleDay(d)} />
                    {DAY_LABELS[d]?.slice(0, 3)}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm mt-1">{runDays.length > 0 ? runDays.map(d => DAY_LABELS[d]).join(", ") : "—"}</p>
            )}
          </div>
        )}

        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Time Windows</Label>
          {editing ? (
            <div className="space-y-2 mt-1">
              {timeWindows.map((tw: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="time" value={tw.start} onChange={e => { const w = [...timeWindows]; w[i] = { ...w[i], start: e.target.value }; setDraft({ ...draft!, time_windows: w }); }} className="w-32" />
                  <span className="text-muted-foreground">→</span>
                  <Input type="time" value={tw.end} onChange={e => { const w = [...timeWindows]; w[i] = { ...w[i], end: e.target.value }; setDraft({ ...draft!, time_windows: w }); }} className="w-32" />
                  {timeWindows.length > 1 && <button onClick={() => removeTimeWindow(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTimeWindow} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Window</Button>
            </div>
          ) : (
            <div className="space-y-1 mt-1">
              {s.time_windows.map((tw, i) => (
                <p key={i} className="text-sm font-mono">{tw.start} → {tw.end}</p>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
