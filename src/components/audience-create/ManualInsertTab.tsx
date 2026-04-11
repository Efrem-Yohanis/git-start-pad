import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Recipient, Language } from "@/types/campaign";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/types/campaign";

interface Props {
  recipients: Recipient[];
  onChange: (r: Recipient[]) => void;
}

const PHONE_REGEX = /^\+251\d{9}$/;

export default function ManualInsertTab({ recipients, onChange }: Props) {
  function addRow() {
    onChange([...recipients, { msisdn: "", lang: "en" }]);
  }

  function removeRow(i: number) {
    onChange(recipients.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof Recipient, value: string) {
    const updated = [...recipients];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  }

  function getError(msisdn: string) {
    if (!msisdn) return null;
    return PHONE_REGEX.test(msisdn) ? null : "Invalid format (+251XXXXXXXXX)";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Manual Entry</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add recipients one by one. Phone must be Ethiopian format: +251XXXXXXXXX
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Row
        </Button>
      </div>

      {recipients.length === 0 && (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground mb-3">No recipients added yet</p>
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add First Recipient
          </Button>
        </div>
      )}

      {recipients.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          <div className="grid grid-cols-[1fr_140px_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>MSISDN</span>
            <span>Language</span>
            <span></span>
          </div>
          {recipients.map((r, i) => {
            const err = getError(r.msisdn);
            return (
              <div key={i} className="grid grid-cols-[1fr_140px_40px] gap-2 items-start">
                <div>
                  <Input
                    value={r.msisdn}
                    onChange={(e) => updateRow(i, "msisdn", e.target.value)}
                    placeholder="+251912345678"
                    className={err ? "border-destructive" : ""}
                  />
                  {err && <p className="text-[11px] text-destructive mt-0.5">{err}</p>}
                </div>
                <Select value={r.lang} onValueChange={(v) => updateRow(i, "lang", v as Language)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  onClick={() => removeRow(i)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
