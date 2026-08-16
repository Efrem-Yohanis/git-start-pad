import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { WizardData, Channel } from "@/types/campaign";
import { CHANNEL_LABELS } from "@/types/campaign";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

const AVAILABLE_CHANNELS: Channel[] = ["sms", "flash_sms"];

export default function StepBasics({ data, errors, update }: Props) {
  function toggleChannel(channel: Channel) {
    const current = data.channels || [];
    const next = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    update({ channels: next });
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Campaign name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. Summer Sale Kickoff"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Sender ID */}
      <div className="space-y-1.5">
        <Label htmlFor="sender_id">Sender ID</Label>
        <Input
          id="sender_id"
          value={data.sender_id}
          onChange={(e) => update({ sender_id: e.target.value })}
          placeholder="e.g. SHOPNOW (3-11 chars, alphanumeric)"
          maxLength={11}
        />
        <p className="text-xs text-muted-foreground">
          3–11 characters, letters, numbers, and underscores only
        </p>
        {errors.sender_id && <p className="text-sm text-destructive">{errors.sender_id}</p>}
      </div>

      {/* Channels */}
      <div className="space-y-2">
        <Label>Channels</Label>
        <div className="flex flex-wrap gap-4">
          {AVAILABLE_CHANNELS.map((ch) => (
            <label key={ch} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={(data.channels || []).includes(ch)}
                onCheckedChange={() => toggleChannel(ch)}
              />
              <span className="text-sm">{CHANNEL_LABELS[ch]}</span>
            </label>
          ))}
        </div>
        {errors.channels && <p className="text-sm text-destructive">{errors.channels}</p>}
      </div>
    </div>
  );
}
