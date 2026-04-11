import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/types/campaign";
import type { Language } from "@/types/campaign";
import { toast } from "sonner";
import { Pencil, Save, X, ArrowLeft } from "lucide-react";
import { fetchMessageContentDetail, updateMessageContentById } from "@/lib/api/messages";
import type { ApiMessageContentListItem } from "@/lib/api/messages";

export default function MessageContentDetail() {
  const { id } = useParams<{ id: string }>();
  const [mc, setMc] = useState<ApiMessageContentListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState<Record<string, string>>({});
  const [draftDefaultLang, setDraftDefaultLang] = useState<string>("en");

  useEffect(() => { if (id) loadData(); }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchMessageContentDetail(Number(id));
      setMc(data);
    } catch (e) {
      console.error("Failed to load message content", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  }

  if (!mc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Message content not found</p>
        <Link to="/messages"><Button variant="outline">Back to Messages</Button></Link>
      </div>
    );
  }

  const content = editing ? draftContent : mc.content;
  const defaultLang = editing ? draftDefaultLang : mc.default_language;

  function startEdit() {
    setDraftContent({ ...mc!.content });
    setDraftDefaultLang(mc!.default_language);
    setEditing(true);
  }

  function cancelEdit() { setEditing(false); }

  async function saveEdit() {
    try {
      const updated = await updateMessageContentById(Number(id), {
        content: draftContent,
        default_language: draftDefaultLang,
      });
      setMc(updated);
      setEditing(false);
      toast.success("Message content updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/messages" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Messages
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Messages — {mc.campaign_info?.name ?? `Campaign #${mc.campaign}`}
          </h1>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} className="gap-1.5"><X className="h-3.5 w-3.5" /> Cancel</Button>
              <Button size="sm" onClick={saveEdit} className="gap-1.5"><Save className="h-3.5 w-3.5" /> Save</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
          )}
        </div>
      </div>

      <Card className="p-5 shadow-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Default Language</p>
        {editing ? (
          <Select value={defaultLang} onValueChange={setDraftDefaultLang}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map(l => (
                <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline">{LANGUAGE_LABELS[defaultLang as Language] ?? defaultLang}</Badge>
        )}
      </Card>

      {/* Completeness */}
      {mc.language_completeness && (
        <Card className="p-5 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Language Completeness</p>
          <div className="flex items-center gap-4">
            <span className={`text-2xl font-semibold ${mc.language_completeness.completeness_percentage === 100 ? "text-emerald-600" : "text-amber-600"}`}>
              {mc.language_completeness.completeness_percentage.toFixed(0)}%
            </span>
            <span className="text-sm text-muted-foreground">
              {mc.language_completeness.languages_with_content} / {mc.language_completeness.total_languages} languages
            </span>
            {mc.language_completeness.missing_languages.length > 0 && (
              <div className="flex gap-1">
                {mc.language_completeness.missing_languages.map(l => (
                  <Badge key={l} variant="destructive" className="text-xs">{LANGUAGE_LABELS[l as Language] ?? l} missing</Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const text = content[lang] || "";
          const isDefault = lang === defaultLang;
          return (
            <Card key={lang} className="p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium">{LANGUAGE_LABELS[lang]}</Label>
                {isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
              </div>
              {editing ? (
                <>
                  <Textarea
                    value={text}
                    onChange={(e) => setDraftContent({ ...draftContent, [lang]: e.target.value })}
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
