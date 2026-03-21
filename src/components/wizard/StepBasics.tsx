import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WizardData } from "@/types/campaign";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

export default function StepBasics({ data, errors, update }: Props) {
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
    </div>
  );
}
