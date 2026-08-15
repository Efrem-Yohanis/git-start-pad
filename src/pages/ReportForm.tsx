import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ReportFrequency,
  REPORT_FREQUENCIES,
  createReport,
  updateReport,
  fetchReport,
} from "@/lib/api/reports";
import { fetchEmailServices, EmailServiceConfig } from "@/lib/api/configurations";
import { fetchCampaigns } from "@/lib/api";

interface CampaignOption { id: number; name: string }

export default function ReportForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [emailServices, setEmailServices] = useState<EmailServiceConfig[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [frequency, setFrequency] = useState<ReportFrequency>("daily");
  const [sendToOwners, setSendToOwners] = useState(true);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [emailService, setEmailService] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCampaigns({ pageSize: 100 })
      .then((r) => setCampaigns((r.results ?? []).map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => undefined);
    fetchEmailServices().then((r) => setEmailServices(r.results ?? [])).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchReport(Number(id))
      .then((r) => {
        setName(r.name ?? "");
        setDescription(r.description ?? "");
        setSelected((r.campaigns ?? []).map((c) => c.id));
        setFrequency(r.frequency ?? "daily");
        setSendToOwners(r.send_to_campaign_owners ?? false);
        setRecipients(r.recipients ?? []);
        setEmailService(r.email_service?.id ?? null);
        setIsActive(r.is_active ?? true);
      })
      .catch(() => toast.error("Failed to load report"))
      .finally(() => setLoading(false));
  }, [id]);

  const addRecipient = () => {
    const value = recipientInput.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { toast.error("Enter a valid email address"); return; }
    if (recipients.includes(value)) { setRecipientInput(""); return; }
    setRecipients([...recipients, value]);
    setRecipientInput("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!sendToOwners && recipients.length === 0) {
      toast.error("Add at least one recipient or enable sending to campaign owners");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description,
        campaigns: selected,
        frequency,
        send_to_campaign_owners: sendToOwners,
        recipients,
        email_service: emailService,
        is_active: isActive,
      };
      if (isEdit && id) {
        await updateReport(Number(id), payload);
        toast.success("Report updated");
        navigate(`/reports/${id}`);
      } else {
        const created = await createReport(payload);
        toast.success("Report created");
        navigate(`/reports/${created.id}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <Link to="/reports" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Reports
      </Link>
      <h1 className="text-2xl font-bold text-foreground">{isEdit ? "Edit Report" : "New Report"}</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Daily campaign performance" /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as ReportFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Email Service</Label>
              <Select value={emailService ? String(emailService) : ""} onValueChange={(v) => setEmailService(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Default service" /></SelectTrigger>
                <SelectContent>
                  {emailServices.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Campaigns</CardTitle></CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns available. The report will cover all campaigns.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto">
              {campaigns.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selected.includes(c.id)}
                    onCheckedChange={(v) =>
                      setSelected(v ? [...selected, c.id] : selected.filter((x) => x !== c.id))
                    }
                  />
                  <span className="text-foreground">{c.name}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">Leave empty to include all campaigns.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recipients</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch checked={sendToOwners} onCheckedChange={setSendToOwners} />
            <Label>Send to campaign owners</Label>
          </div>
          <div className="flex gap-2">
            <Input
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRecipient(); } }}
              placeholder="name@example.com"
            />
            <Button type="button" variant="outline" onClick={addRecipient}>Add</Button>
          </div>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipients.map((r) => (
                <Badge key={r} variant="secondary" className="gap-1">
                  {r}
                  <button type="button" onClick={() => setRecipients(recipients.filter((x) => x !== r))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Active</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : isEdit ? "Save Changes" : "Create Report"}</Button>
        <Button variant="outline" onClick={() => navigate("/reports")}>Cancel</Button>
      </div>
    </div>
  );
}
