import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WizardData, Language } from "@/types/campaign";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/types/campaign";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
}

export default function StepMessages({ data, errors, update }: Props) {
  function updateContent(lang: Language, text: string) {
    update({ content: { ...data.content, [lang]: text } });
  }

  return (
    <div className="space-y-5">
      {/* Default language */}
      <div className="space-y-1.5">
        <Label>Default language</Label>
        <Select
          value={data.default_language}
          onValueChange={(v) => update({ default_language: v as Language })}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((l) => (
              <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* All language messages */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <div key={lang} className="space-y-1.5">
          <Label>
            {LANGUAGE_LABELS[lang]}
            {lang === data.default_language && (
              <span className="ml-2 text-xs text-primary font-normal">(default)</span>
            )}
          </Label>
          <Textarea
            value={data.content[lang]}
            onChange={(e) => updateContent(lang, e.target.value)}
            placeholder={`Message in ${LANGUAGE_LABELS[lang]}`}
            rows={3}
            maxLength={1600}
          />
          <p className="text-xs text-muted-foreground">
            {data.content[lang].length}/1600 characters
          </p>
        </div>
      ))}

      {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
    </div>
  );
}
