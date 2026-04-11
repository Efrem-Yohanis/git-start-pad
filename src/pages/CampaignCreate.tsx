import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { WizardData } from "@/types/campaign";
import { EMPTY_WIZARD, SUPPORTED_LANGUAGES } from "@/types/campaign";
import StepBasics from "@/components/wizard/StepBasics";
import StepAudience from "@/components/wizard/StepAudience";
import StepMessages from "@/components/wizard/StepMessages";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepReview from "@/components/wizard/StepReview";
import { Check, ClipboardList, Users, MessageSquare, CalendarClock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createCampaign, createSchedule, updateMessageContent, createAudience } from "@/lib/api";

const STEPS = [
  { label: "Campaign Info", icon: ClipboardList },
  { label: "Audience", icon: Users },
  { label: "Message", icon: MessageSquare },
  { label: "Schedule", icon: CalendarClock },
  { label: "Review", icon: Eye },
];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({ ...EMPTY_WIZARD, content: { ...EMPTY_WIZARD.content }, time_windows: [...EMPTY_WIZARD.time_windows] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function update(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors({});
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!data.name.trim()) errs.name = "Name is required";
      if (data.channels.length === 0) errs.channels = "Select at least one channel";
      if (data.sender_id) {
        if (data.sender_id.length < 3 || data.sender_id.length > 11) {
          errs.sender_id = "Sender ID must be 3–11 characters";
        } else if (!/^[A-Za-z0-9_]+$/.test(data.sender_id)) {
          errs.sender_id = "Only letters, numbers, and underscores allowed";
        }
      }
    }

    if (step === 1) {
      if (data.recipients.length === 0) errs.recipients = "Add at least one recipient";
      const phonePattern = /^\+?[1-9]\d{1,14}$/;
      const invalid = data.recipients.findIndex((r) => !phonePattern.test(r.msisdn));
      if (invalid >= 0) errs.recipients = `Recipient ${invalid + 1} has an invalid phone number`;
    }

    if (step === 2) {
      const hasContent = SUPPORTED_LANGUAGES.some((l) => data.content[l].trim().length > 0);
      if (!hasContent) errs.content = "At least one language message is required";
    }

    if (step === 3) {
      if (!data.start_date) errs.start_date = "Start date is required";
      const hasTimeWindow = data.time_windows.some((tw) => tw.start.trim() && tw.end.trim());
      if (!hasTimeWindow) errs.time_windows = "At least one time window is required";
      if (data.schedule_type === "weekly" && data.run_days.length === 0) {
        errs.run_days = "Select at least one run day";
      }
      if (data.schedule_type !== "once" && data.end_date && data.start_date && data.start_date >= data.end_date) {
        errs.end_date = "End date must be after start date";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    if (step < 4) setStep(step + 1);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // 1. Create campaign
      const campaign = await createCampaign({
        name: data.name,
        sender_id: data.sender_id,
        channels: data.channels,
        status: "draft",
      });
      const campaignId = campaign.id;

      // 2. Add schedule
      await createSchedule(campaignId, {
        schedule_type: data.schedule_type,
        start_date: data.start_date,
        ...(data.end_date ? { end_date: data.end_date } : {}),
        ...(data.run_days.length > 0 ? { run_days: data.run_days } : {}),
        time_windows: data.time_windows.filter((tw) => tw.start && tw.end),
        timezone: data.timezone,
        auto_reset: data.auto_reset,
      });

      // 3. Add message content
      const contentEntries = Object.entries(data.content).filter(([, v]) => v.trim());
      if (contentEntries.length > 0) {
        await updateMessageContent(campaignId, {
          content: Object.fromEntries(contentEntries),
          default_language: data.default_language,
        });
      }

      // 4. Add audience
      if (data.recipients.length > 0) {
        await createAudience(campaignId, {
          recipients: data.recipients.map((r) => ({
            msisdn: r.msisdn,
            lang: r.lang,
          })),
        });
      }

      toast.success(`Campaign "${data.name}" created successfully!`);
      navigate("/campaigns");
    } catch (err: any) {
      toast.error("Failed to create campaign: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <div key={i} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <div
                    className={cn(
                      "absolute top-5 -left-1/2 w-full h-0.5",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                    style={{ zIndex: 0 }}
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-background text-primary"
                      : "border-muted bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card border rounded-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{STEPS[step].label}</h2>
          <span className="text-sm text-muted-foreground">Step {step + 1} of 5</span>
        </div>

        <div className="px-6 py-6 min-h-[320px]">
          {step === 0 && <StepBasics data={data} errors={errors} update={update} />}
          {step === 1 && <StepAudience data={data} errors={errors} update={update} />}
          {step === 2 && <StepMessages data={data} errors={errors} update={update} />}
          {step === 3 && <StepSchedule data={data} errors={errors} update={update} />}
          {step === 4 && <StepReview data={data} />}
        </div>

        <div className="px-6 py-4 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={step === 0 ? () => navigate("/campaigns") : goBack}
          >
            {step === 0 ? "Cancel" : "← Back"}
          </Button>

          {step === 4 ? (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Campaign"}
            </Button>
          ) : (
            <Button onClick={goNext}>Next →</Button>
          )}
        </div>
      </div>
    </div>
  );
}
