import type { WizardData } from "@/types/campaign";
import { LANGUAGE_LABELS, FREQUENCY_LABELS, DAY_LABELS } from "@/types/campaign";
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
            <Badge variant="secondary">{data.schedule_type === "one_time" ? "One Time" : "Recurring"}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{data.schedule_type === "one_time" ? "Send Date" : "Start Date"}</p>
            <p className="font-medium text-foreground">
              {data.start_date ? new Date(data.start_date).toLocaleString() : "—"}
            </p>
          </div>
          {data.schedule_type === "recurring" && (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                <p className="font-medium text-foreground">
                  {data.end_date ? new Date(data.end_date).toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                <p className="font-medium text-foreground">
                  {data.frequency ? FREQUENCY_LABELS[data.frequency as keyof typeof FREQUENCY_LABELS] : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Run Days</p>
                <div className="flex flex-wrap gap-1">
                  {data.run_days.length > 0
                    ? data.run_days.map((d) => (
                        <Badge key={d} variant="secondary" className="text-xs">
                          {DAY_LABELS[d] || `Day ${d}`}
                        </Badge>
                      ))
                    : <span className="text-foreground">—</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Time Windows</p>
                <div className="flex flex-wrap gap-2">
                  {data.send_times.filter((t) => t.trim()).length > 0
                    ? data.send_times.map((st, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">
                          {st || "??"} – {data.end_times[i] || "??"}
                        </Badge>
                      ))
                    : <span className="text-foreground">—</span>}
                </div>
              </div>
            </>
          )}
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
              <p className="text-2xl font-semibold text-foreground">
                {Object.keys(langCounts).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Languages</p>
            </div>
            <div className="border rounded-sm p-3 text-center">
              <p className="text-2xl font-semibold text-foreground">
                {filledLangs.length}
              </p>
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
