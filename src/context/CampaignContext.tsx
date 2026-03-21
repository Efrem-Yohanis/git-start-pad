import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Campaign } from "@/types/campaign";

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Kickoff",
    status: "active",
    sender_id: "SHOPNOW",
    channels: ["sms"],
    schedule: {
      schedule_type: "recurring",
      start_date: "2024-08-01T09:00",
      end_date: "2024-08-05T17:00",
      frequency: "daily",
      run_days: [0, 1, 2, 3, 4],
      send_times: ["09:00"],
      end_times: ["17:00"],
      is_active: true,
      status: "running",
    },
    message_content: {
      content: {
        en: "Don't miss our Summer Sale! Up to 50% off.",
        am: "የበጋ ሽያጫችንን አይዝሩ! እስከ 50% ቅናሽ።",
        ti: "",
        om: "",
        so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [
        { msisdn: "+251912345678", lang: "en" },
        { msisdn: "+251911111111", lang: "am" },
        { msisdn: "+251913333333", lang: "en" },
        { msisdn: "+251914444444", lang: "ti" },
        { msisdn: "+251915555555", lang: "om" },
      ],
      total_count: 1428,
      valid_count: 1428,
      invalid_count: 0,
    },
    progress: {
      total_messages: 1428,
      sent_count: 856,
      failed_count: 12,
      pending_count: 560,
      progress_percent: 60.78,
      status: "ACTIVE",
      started_at: "2024-08-01T09:00:00Z",
      completed_at: null,
    },
    created_at: "2024-07-20T10:00:00Z",
    updated_at: "2024-07-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Account Verification",
    status: "completed",
    sender_id: "VERIFY",
    channels: ["sms", "flash_sms"],
    schedule: {
      schedule_type: "one_time",
      start_date: "2024-06-15T08:00",
      end_date: "2024-06-15T18:00",
      frequency: "daily",
      run_days: [0, 1, 2, 3, 4, 5, 6],
      send_times: ["08:00"],
      end_times: ["18:00"],
      is_active: false,
      status: "completed",
    },
    message_content: {
      content: {
        en: "Verify your account by dialing *123#",
        am: "",
        ti: "",
        om: "",
        so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [
        { msisdn: "+251922222222", lang: "en" },
        { msisdn: "+251923333333", lang: "am" },
      ],
      total_count: 342,
      valid_count: 342,
      invalid_count: 0,
    },
    progress: {
      total_messages: 342,
      sent_count: 340,
      failed_count: 2,
      pending_count: 0,
      progress_percent: 100,
      status: "COMPLETED",
      started_at: "2024-06-15T08:00:00Z",
      completed_at: "2024-06-15T18:00:00Z",
    },
    created_at: "2024-06-15T08:30:00Z",
    updated_at: "2024-06-15T08:30:00Z",
  },
  {
    id: "3",
    name: "Loyalty Rewards Update",
    status: "paused",
    sender_id: "LOYALTY",
    channels: ["sms", "app_notification"],
    schedule: {
      schedule_type: "recurring",
      start_date: "2024-09-01T06:00",
      end_date: "2024-09-30T23:59",
      frequency: "weekly",
      run_days: [0, 2, 4],
      send_times: ["06:00"],
      end_times: ["20:00"],
      is_active: false,
      status: "stop",
    },
    message_content: {
      content: {
        en: "Your loyalty points are about to expire. Redeem them now!",
        am: "",
        ti: "",
        om: "",
        so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [
        { msisdn: "+251931111111", lang: "en" },
        { msisdn: "+251932222222", lang: "so" },
      ],
      total_count: 5891,
      valid_count: 5891,
      invalid_count: 0,
    },
    progress: {
      total_messages: 5891,
      sent_count: 2100,
      failed_count: 45,
      pending_count: 3746,
      progress_percent: 36.41,
      status: "STOPPED",
      started_at: "2024-09-01T06:00:00Z",
      completed_at: null,
    },
    created_at: "2024-08-25T14:00:00Z",
    updated_at: "2024-08-25T14:00:00Z",
  },
];

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id" | "created_at" | "updated_at">) => void;
  updateCampaign: (id: string, partial: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const addCampaign = useCallback((data: Omit<Campaign, "id" | "created_at" | "updated_at">) => {
    setCampaigns((prev) => [
      {
        ...data,
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const updateCampaign = useCallback((id: string, partial: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...partial, updated_at: new Date().toISOString() } : c
      )
    );
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign, updateCampaign, deleteCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaigns must be used within CampaignProvider");
  return ctx;
}
