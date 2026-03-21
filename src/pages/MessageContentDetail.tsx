import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/types/campaign";
import type { Language, MessageContent } from "@/types/campaign";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";

export default function MessageContentDetail() {
  const { id } = useParams<{ id: string }>();
  const { campaigns, updateCampaign } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MessageContent | null>(null);

  if (!campaign || !campaign.message_content) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Message content not found</p>
        <Link to="/messages"><Button variant="outline">Back to Messages</Button></Link>
      </div>
    );
  }

  const mc = editing && draft ? draft : campaign.message_content;

  function startEdit() {
    setDraft({ ...campaign!.message_content, content: { ...campaign!.message_content.content } });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
  }

  function saveEdit() {
    if (!draft) return;
    updateCampaign(id!, { message_content: draft });
    setEditing(false);
    setDraft(null);
    toast.success("Message content updated");
  }

  function updateContent(lang: Language, text: string) {
    if (!draft) return;
    setDraft({ ...draft, content: { ...draft.content, [lang]: text } });
  }

  function updateDefaultLang(lang: Language) {
    if (!draft) return;
    setDraft({ ...draft, default_language: lang });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/messages" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Message Content
          </Link>
          <h1 className="text-xl font-medium mt-1">Messages — {campaign.name}</h1>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEdit} className="gap-1.5">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={saveEdit} className="gap-1.5">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={startEdit} className="gap-1.5">
              <Pencil className="h-4 w-4" /> Edit Messages
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-sm p-4 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Default Language</p>
        {editing ? (
          <Select value={mc.default_language} onValueChange={(v) => updateDefaultLang(v as Language)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline">{LANGUAGE_LABELS[mc.default_language]}</Badge>
        )}
      </div>

      <div className="space-y-4">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const text = mc.content[lang];
          const isDefault = lang === mc.default_language;
          return (
            <div key={lang} className="bg-card border rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium">{LANGUAGE_LABELS[lang]}</Label>
                {isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
              </div>
              {editing ? (
                <>
                  <Textarea
                    value={text}
                    onChange={(e) => updateContent(lang, e.target.value)}
                    placeholder={`Message in ${LANGUAGE_LABELS[lang]}`}
                    rows={3}
                    maxLength={1600}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{text.length}/1600 characters</p>
                </>
              ) : text?.trim() ? (
                <>
                  <p className="text-sm whitespace-pre-wrap">{text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{text.length} / 1600 characters</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">No content</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
