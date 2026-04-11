import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { createAudience } from "@/lib/api/audiences";
import type { Recipient } from "@/types/campaign";
import ManualInsertTab from "@/components/audience-create/ManualInsertTab";
import CsvUploadTab from "@/components/audience-create/CsvUploadTab";
import DatabaseTab from "@/components/audience-create/DatabaseTab";

export default function AudienceCreate() {
  const navigate = useNavigate();
  const [campaignId, setCampaignId] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  const campaignIdNum = parseInt(campaignId, 10);
  const isValid = !isNaN(campaignIdNum) && campaignIdNum > 0 && recipients.length > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await createAudience({
        campaign: campaignIdNum,
        database_table: "",
        id_field: "",
        filter_condition: "",
      });
      toast.success(`Audience created with ${recipients.length} recipients`);
      navigate("/audiences");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create audience");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/audiences")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Audience</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add recipients via manual entry, file upload, or database connection
          </p>
        </div>
      </div>

      {/* Campaign ID */}
      <Card className="p-5 shadow-card">
        <div className="space-y-1.5">
          <Label htmlFor="campaign-id" className="flex items-center gap-1.5">
            Campaign ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="campaign-id"
            type="number"
            min={1}
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Enter campaign ID"
            className="max-w-xs"
          />
          {campaignId && isNaN(campaignIdNum) && (
            <p className="text-xs text-destructive">Please enter a valid number</p>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="manual">Manual Insert</TabsTrigger>
          <TabsTrigger value="csv">CSV / Excel Upload</TabsTrigger>
          <TabsTrigger value="database">Database Table</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="p-5 shadow-card">
            <ManualInsertTab recipients={recipients} onChange={setRecipients} />
          </Card>
        </TabsContent>

        <TabsContent value="csv">
          <Card className="p-5 shadow-card">
            <CsvUploadTab recipients={recipients} onChange={setRecipients} />
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card className="p-5 shadow-card">
            <DatabaseTab recipients={recipients} onChange={setRecipients} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary & Submit */}
      {recipients.length > 0 && (
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{recipients.length.toLocaleString()} recipients ready</p>
                <p className="text-xs text-muted-foreground">
                  Will be submitted to campaign #{campaignId || "—"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setRecipients([])}
              >
                Clear All
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isValid || submitting}
              >
                {submitting ? "Creating..." : "Create Audience"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
