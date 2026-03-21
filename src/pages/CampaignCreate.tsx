import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
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

const STEPS = [
  { label: "Campaign Info", icon: ClipboardList },
  { label: "Audience", icon: Users },
  { label: "Message", icon: MessageSquare },
  { label: "Schedule", icon: CalendarClock },
  { label: "Review", icon: Eye },
];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const { addCampaign } = useCampaigns();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({ ...EMPTY_WIZARD, content: { ...EMPTY_WIZARD.content } });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors({});
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!data.name.trim()) errs.name = "Name is required";
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
      if (data.schedule_type === "recurring") {
        if (!data.end_date) errs.end_date = "End date is required";
        if (data.start_date && data.end_date && data.start_date >= data.end_date) {
          errs.end_date = "End date must be after start date";
        }
        if (!data.frequency) errs.frequency = "Frequency is required";
        if (data.run_days.length === 0) errs.run_days = "Select at least one run day";
        const hasTime = data.send_times.some((t) => t.trim()) && data.end_times.some((t) => t.trim());
        if (!hasTime) errs.send_times = "At least one time window is required";
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

  function handleSubmit() {
    addCampaign({
      name: data.name,
      status: "draft",
      sender_id: data.sender_id,
      channels: ["sms"],
      schedule: {
        schedule_type: data.schedule_type,
        start_date: data.start_date,
        end_date: data.end_date,
        frequency: data.frequency as any,
        run_days: data.run_days,
        send_times: data.send_times,
        end_times: data.end_times,
        is_active: true,
        status: "pending",
      },
      message_content: {
        content: data.content,
        default_language: data.default_language,
      },
      audience: {
        recipients: data.recipients,
        total_count: data.recipients.length,
        valid_count: data.recipients.length,
        invalid_count: 0,
      },
    });
    navigate("/");
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
                {/* Connector line */}
                {i > 0 && (
                  <div
                    className={cn(
                      "absolute top-5 -left-1/2 w-full h-0.5",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                    style={{ zIndex: 0 }}
                  />
                )}
                {/* Circle */}
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
            onClick={step === 0 ? () => navigate("/") : goBack}
          >
            {step === 0 ? "Cancel" : "← Back"}
          </Button>

          {step === 4 ? (
            <Button onClick={handleSubmit}>Submit Campaign</Button>
          ) : (
            <Button onClick={goNext}>Next →</Button>
          )}
        </div>
      </div>
    </div>
  );
}
