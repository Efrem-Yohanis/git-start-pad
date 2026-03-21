import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "@/types/campaign";
import type { Language, Recipient } from "@/types/campaign";
import { toast } from "sonner";
import { Search, Plus, Trash2, X } from "lucide-react";

export default function AudienceDetail() {
  const { id } = useParams<{ id: string }>();
  const { campaigns, updateCampaign } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newMsisdn, setNewMsisdn] = useState("");
  const [newLang, setNewLang] = useState<Language>("en");

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Audience not found</p>
        <Link to="/audiences"><Button variant="outline">Back to Audiences</Button></Link>
      </div>
    );
  }

  const { audience } = campaign;
  const recipients = audience?.recipients ?? [];
  const filtered = search.trim()
    ? recipients.filter((r) => r.msisdn.includes(search.trim()))
    : recipients;

  function addRecipient() {
    if (!newMsisdn.trim()) return;
    const phonePattern = /^\+?[1-9]\d{1,14}$/;
    if (!phonePattern.test(newMsisdn.trim())) {
      toast.error("Invalid phone number format");
      return;
    }
    if (recipients.some((r) => r.msisdn === newMsisdn.trim())) {
      toast.error("Recipient already exists");
      return;
    }
    const updated: Recipient[] = [...recipients, { msisdn: newMsisdn.trim(), lang: newLang }];
    updateCampaign(id!, {
      audience: {
        ...audience,
        recipients: updated,
        total_count: (audience?.total_count ?? 0) + 1,
        valid_count: (audience?.valid_count ?? 0) + 1,
        invalid_count: audience?.invalid_count ?? 0,
      },
    });
    setNewMsisdn("");
    setNewLang("en");
    setShowAdd(false);
    toast.success("Recipient added");
  }

  function removeRecipient(msisdn: string) {
    const updated = recipients.filter((r) => r.msisdn !== msisdn);
    updateCampaign(id!, {
      audience: {
        ...audience,
        recipients: updated,
        total_count: Math.max(0, (audience?.total_count ?? 0) - 1),
        valid_count: Math.max(0, (audience?.valid_count ?? 0) - 1),
        invalid_count: audience?.invalid_count ?? 0,
      },
    });
    toast.success("Recipient removed");
  }

  function updateRecipientLang(msisdn: string, lang: Language) {
    const updated = recipients.map((r) => r.msisdn === msisdn ? { ...r, lang } : r);
    updateCampaign(id!, { audience: { ...audience, recipients: updated } });
    toast.success("Language updated");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/audiences" className="text-sm text-muted-foreground hover:text-foreground">← Back to Audiences</Link>
          <h1 className="text-xl font-medium mt-1">Audience — {campaign.name}</h1>
        </div>
        <Button variant="outline" onClick={() => setShowAdd(!showAdd)} className="gap-1.5">
          {showAdd ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Add Recipient</>}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Recipients</p>
          <p className="text-2xl font-medium">{audience?.total_count?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valid</p>
          <p className="text-2xl font-medium text-green-600">{audience?.valid_count?.toLocaleString() ?? 0}</p>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invalid</p>
          <p className="text-2xl font-medium text-destructive">{audience?.invalid_count ?? 0}</p>
        </div>
      </div>

      {/* Add recipient form */}
      {showAdd && (
        <div className="bg-card border rounded-sm p-4 mb-4 space-y-3">
          <Label className="text-sm font-medium">Add New Recipient</Label>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Phone (MSISDN)</Label>
              <Input value={newMsisdn} onChange={(e) => setNewMsisdn(e.target.value)} placeholder="+251912345678" className="font-mono" />
            </div>
            <div className="w-40 space-y-1">
              <Label className="text-xs text-muted-foreground">Language</Label>
              <Select value={newLang} onValueChange={(v) => setNewLang(v as Language)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addRecipient} className="gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by phone number..." className="pl-10" />
      </div>

      {/* Recipients table */}
      <div className="bg-card border rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-secondary/50 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recipients {search.trim() && `(${filtered.length} of ${recipients.length})`}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">#</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Phone (MSISDN)</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Language</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  {search.trim() ? "No recipients match your search." : "No recipients in this audience."}
                </td>
              </tr>
            )}
            {filtered.slice(0, 100).map((r, i) => (
              <tr key={r.msisdn} className="border-b last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-2 font-mono">{r.msisdn}</td>
                <td className="px-4 py-2">
                  <Select value={r.lang} onValueChange={(v) => updateRecipientLang(r.msisdn, v as Language)}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => removeRecipient(r.msisdn)} className="text-destructive hover:text-destructive/80 p-1" title="Remove recipient">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length > 100 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground text-xs">
                  Showing first 100 of {filtered.length.toLocaleString()} recipients
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
