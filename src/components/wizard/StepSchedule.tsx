import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WizardData, Frequency, ScheduleType } from "@/types/campaign";
import { FREQUENCY_LABELS, DAY_LABELS } from "@/types/campaign";
import { Plus, Trash2, Clock, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

const FREQUENCIES: Frequency[] = ["daily", "weekly", "monthly"];

export default function StepSchedule({ data, errors, update }: Props) {
  const isRecurring = data.schedule_type === "recurring";

  function toggleDay(day: number) {
    const current = data.run_days;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    update({ run_days: updated });
  }

  function addTimeWindow() {
    update({
      send_times: [...data.send_times, ""],
      end_times: [...data.end_times, ""],
    });
  }

  function removeTimeWindow(index: number) {
    if (data.send_times.length <= 1) return;
    update({
      send_times: data.send_times.filter((_, i) => i !== index),
      end_times: data.end_times.filter((_, i) => i !== index),
    });
  }

  function updateSendTime(index: number, value: string) {
    const times = [...data.send_times];
    times[index] = value;
    update({ send_times: times });
  }

  function updateEndTime(index: number, value: string) {
    const times = [...data.end_times];
    times[index] = value;
    update({ end_times: times });
  }

  function setScheduleType(type: ScheduleType) {
    update({
      schedule_type: type,
      // Reset recurring fields when switching to one-time
      ...(type === "one_time" && {
        frequency: "",
        run_days: [],
        end_date: "",
      }),
    });
  }

  return (
    <div className="space-y-5">
      {/* Schedule type toggle */}
      <div className="space-y-1.5">
        <Label>Schedule type</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setScheduleType("one_time")}
            className={cn(
              "flex items-center gap-3 border rounded-sm p-4 transition-colors text-left",
              !isRecurring
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <Clock className={cn("h-5 w-5", !isRecurring ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className={cn("font-medium text-sm", !isRecurring ? "text-primary" : "text-foreground")}>One Time</p>
              <p className="text-xs text-muted-foreground">Send once at a specific date & time</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setScheduleType("recurring")}
            className={cn(
              "flex items-center gap-3 border rounded-sm p-4 transition-colors text-left",
              isRecurring
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <Repeat className={cn("h-5 w-5", isRecurring ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className={cn("font-medium text-sm", isRecurring ? "text-primary" : "text-foreground")}>Recurring</p>
              <p className="text-xs text-muted-foreground">Repeat on a schedule with the same time</p>
            </div>
          </button>
        </div>
      </div>

      {/* One-time: single date/time */}
      {!isRecurring && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Send date & time</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={data.start_date}
              onChange={(e) => update({ start_date: e.target.value })}
            />
            {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
          </div>
        </div>
      )}

      {/* Recurring: full schedule */}
      {isRecurring && (
        <>
          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={data.start_date}
                onChange={(e) => update({ start_date: e.target.value })}
              />
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={data.end_date}
                onChange={(e) => update({ end_date: e.target.value })}
              />
              {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Select
              value={data.frequency}
              onValueChange={(v) => update({ frequency: v as Frequency })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>{FREQUENCY_LABELS[f]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.frequency && <p className="text-sm text-destructive">{errors.frequency}</p>}
          </div>

          {/* Run days */}
          <div className="space-y-1.5">
            <Label>Run days</Label>
            <div className="flex flex-wrap gap-3 pt-1">
              {Object.entries(DAY_LABELS).map(([key, label]) => {
                const day = Number(key);
                return (
                  <div key={day} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`day-${day}`}
                      checked={data.run_days.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <Label htmlFor={`day-${day}`} className="font-normal cursor-pointer text-sm">
                      {label.slice(0, 3)}
                    </Label>
                  </div>
                );
              })}
            </div>
            {errors.run_days && <p className="text-sm text-destructive">{errors.run_days}</p>}
          </div>

          {/* Time windows */}
          <div className="space-y-2">
            <Label>Send / End times</Label>
            {data.send_times.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="time"
                  value={data.send_times[i]}
                  onChange={(e) => updateSendTime(i, e.target.value)}
                  className="w-36"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  type="time"
                  value={data.end_times[i]}
                  onChange={(e) => updateEndTime(i, e.target.value)}
                  className="w-36"
                />
                {data.send_times.length > 1 && (
                  <button onClick={() => removeTimeWindow(i)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTimeWindow}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add time window
            </Button>
            {errors.send_times && <p className="text-sm text-destructive">{errors.send_times}</p>}
          </div>
        </>
      )}
    </div>
  );
}
