import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WizardData, Language } from "@/types/campaign";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/types/campaign";
import { fetchSupportedLanguages } from "@/lib/api/messages";
import { Eye, Loader2, MessageSquare } from "lucide-react";

interface Props {
  data: WizardData;
  errors: Record<string, string>;
  update: (partial: Partial<WizardData>) => void;
  messageId?: number | null;
}

export default function StepMessages({ data, errors, update, messageId }: Props) {
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
  const [previewLang, setPreviewLang] = useState<string>(data.default_language);
  const [previewVars, setPreviewVars] = useState<string>('{"name": "Efrem"}');
  const [preview, setPreview] = useState<{ rendered_message: string; character_count: number; sms_segments: number } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load supported languages from API
  useEffect(() => {
    fetchSupportedLanguages()
      .then((res) => {
        setLanguages(res.languages);
      })
      .catch(() => {
        // Fallback to local constants
        setLanguages(SUPPORTED_LANGUAGES.map((l) => ({ code: l, name: LANGUAGE_LABELS[l] })));
      });
  }, []);

  const displayLanguages = languages.length > 0
    ? languages
    : SUPPORTED_LANGUAGES.map((l) => ({ code: l, name: LANGUAGE_LABELS[l] }));

  function updateContent(lang: Language, text: string) {
    update({ content: { ...data.content, [lang]: text } });
  }

  const loadPreview = useCallback(() => {
    const template = data.content[previewLang as Language] || "";
    if (!template.trim()) { setPreview(null); return; }
    setLoadingPreview(true);
    try {
      let vars: Record<string, string> = {};
      try { vars = JSON.parse(previewVars); } catch { /* ignore */ }
      let rendered = template;
      Object.entries(vars).forEach(([k, v]) => {
        rendered = rendered.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      });
      const charCount = rendered.length;
      const segments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
      setPreview({ rendered_message: rendered, character_count: charCount, sms_segments: segments });
    } catch {
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  }, [data.content, previewLang, previewVars]);

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
            {displayLanguages.map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language message inputs */}
      {displayLanguages.map((lang) => {
        const code = lang.code as Language;
        const charCount = (data.content[code] || "").length;
        const segments = Math.ceil(charCount / 160) || 0;
        return (
          <div key={code} className="space-y-1.5">
            <Label className="flex items-center gap-2">
              {lang.name}
              {code === data.default_language && (
                <Badge variant="secondary" className="text-xs">default</Badge>
              )}
            </Label>
            <Textarea
              value={data.content[code] || ""}
              onChange={(e) => updateContent(code, e.target.value)}
              placeholder={`Message in ${lang.name}. Use {name} for variables.`}
              rows={3}
              maxLength={1600}
            />
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{charCount}/1600 characters</span>
              {charCount > 0 && <span>{segments} SMS segment{segments !== 1 ? "s" : ""}</span>}
            </div>
          </div>
        );
      })}

      {/* Live Preview Panel */}
      {Object.values(data.content).some(v => v.trim()) && (
        <div className="border rounded-sm p-4 space-y-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Live Preview</Label>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs">Language</Label>
              <Select value={previewLang} onValueChange={setPreviewLang}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {displayLanguages.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label className="text-xs">Variables (JSON)</Label>
              <Input
                value={previewVars}
                onChange={(e) => setPreviewVars(e.target.value)}
                placeholder='{"name": "Efrem"}'
                className="h-8 text-xs font-mono"
              />
            </div>
            <Button size="sm" variant="outline" onClick={loadPreview} disabled={loadingPreview} className="gap-1.5 h-8">
              {loadingPreview ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
              Preview
            </Button>
          </div>
          {preview && (
            <div className="border rounded-sm bg-background p-3 space-y-2">
              <p className="text-sm whitespace-pre-wrap">{preview.rendered_message}</p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{preview.character_count} chars</span>
                <span>{preview.sms_segments} SMS segment{preview.sms_segments !== 1 ? "s" : ""}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
    </div>
  );
}
