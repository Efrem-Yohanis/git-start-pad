import type { WizardData } from "@/types/campaign";
import { LANGUAGE_LABELS, SCHEDULE_TYPE_LABELS, DAY_LABELS, CHANNEL_LABELS } from "@/types/campaign";
import type { Language } from "@/types/campaign";
import { Users, CalendarClock, MessageSquare, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: WizardData;
}

export default function StepReview({ data }: Props) {
  const filledLangs = (Object.entries(data.content) as [Language, string][]).filter(([, t]) => t.trim());
  const langCounts: Record<string, number> = {};
  data.recipients.forEach((r) => {
    const label = LANGUAGE_LABELS[r.lang] || r.lang;
    langCounts[label] = (langCounts[label] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Campaign Info */}
      <section className="border rounded-sm overflow-hidden">
        <div className="px-4 py-3 bg-secondary/50 border-b flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Campaign Info</span>
        </div>
        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Name</p>
            <p className="font-medium text-foreground">{data.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sender ID</p>
            <p className="font-medium text-foreground">{data.sender_id || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Channels</p>
            <div className="flex gap-1.5 flex-wrap">
              {(data.channels || []).map((ch) => (
                <Badge key={ch} variant="secondary">{CHANNEL_LABELS[ch] || ch}</Badge>
              ))}
              {(!data.channels || data.channels.length === 0) && <span className="text-muted-foreground">—</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="border rounded-sm overflow-hidden">
        <div className="px-4 py-3 bg-secondary/50 border-b flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Schedule</span>
        </div>
        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <Badge variant="secondary">{SCHEDULE_TYPE_LABELS[data.schedule_type]}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{data.schedule_type === "once" ? "Send Date" : "Start Date"}</p>
            <p className="font-medium text-foreground">{data.start_date || "—"}</p>
          </div>
          {data.schedule_type !== "once" && data.end_date && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Date</p>
              <p className="font-medium text-foreground">{data.end_date}</p>
            </div>
          )}
          {data.schedule_type === "weekly" && data.run_days.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Run Days</p>
              <div className="flex flex-wrap gap-1">
                {data.run_days.map((d) => (
                  <Badge key={d} variant="secondary" className="text-xs">
                    {DAY_LABELS[d] || `Day ${d}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Time Windows</p>
            <div className="flex flex-wrap gap-2">
              {data.time_windows.filter((tw) => tw.start || tw.end).length > 0
                ? data.time_windows.map((tw, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-mono">
                      {tw.start || "??"} – {tw.end || "??"}
                    </Badge>
                  ))
                : <span className="text-foreground">—</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Timezone</p>
            <p className="font-medium text-foreground">{data.timezone}</p>
          </div>
        </div>
      </section>

      {/* Message Content */}
      <section className="border rounded-sm overflow-hidden">
        <div className="px-4 py-3 bg-secondary/50 border-b flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Message Content</span>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Default Language</p>
            <Badge variant="secondary">{LANGUAGE_LABELS[data.default_language]}</Badge>
          </div>
          {filledLangs.length === 0 && <p className="text-muted-foreground text-sm">No messages added.</p>}
          {filledLangs.map(([lang, text]) => (
            <div key={lang} className="border rounded-sm p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">
                {LANGUAGE_LABELS[lang]}
                {lang === data.default_language && " (default)"}
                <span className="ml-2 text-muted-foreground">{text.length} chars</span>
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience Statistics */}
      <section className="border rounded-sm overflow-hidden">
        <div className="px-4 py-3 bg-secondary/50 border-b flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Audience</span>
        </div>
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="border rounded-sm p-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{data.recipients.length.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Recipients</p>
            </div>
            <div className="border rounded-sm p-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{Object.keys(langCounts).length}</p>
              <p className="text-xs text-muted-foreground mt-1">Languages</p>
            </div>
            <div className="border rounded-sm p-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{filledLangs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Message Translations</p>
            </div>
          </div>
          {Object.keys(langCounts).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Recipients by Language</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(langCounts).map(([label, count]) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}: {count.toLocaleString()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
