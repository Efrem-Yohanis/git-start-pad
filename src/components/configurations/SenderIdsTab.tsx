import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Plug } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  SenderIDConfig,
  ChannelConfig,
  DataSourceConfig,
  fetchSenderIds,
  createSenderId,
  updateSenderId,
  deleteSenderId,
  testSenderId,
  fetchChannels,
  fetchDataSources,
} from "@/lib/api/configurations";

const emptyForm = {
  sender_id: "",
  name: "",
  channel: null as number | null,
  data_source: null as number | null,
  provider_name: "",
  provider_url: "",
  api_key: "",
  username: "",
  password: "",
  description: "",
  is_default: false,
  is_active: true,
};

export default function SenderIdsTab() {
  const [data, setData] = useState<SenderIDConfig[]>([]);
  const [channels, setChannels] = useState<ChannelConfig[]>([]);
  const [sources, setSources] = useState<DataSourceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<SenderIDConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSenderIds();
      setData(res.results ?? []);
    } catch {
      toast.error("Failed to load sender IDs");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchChannels().then((r) => setChannels(r.results ?? [])).catch(() => undefined);
    fetchDataSources().then((r) => setSources(r.results ?? [])).catch(() => undefined);
  }, [load]);

  const channelName = (id: number | null, fallback?: string) =>
    fallback ?? channels.find((c) => c.id === id)?.name ?? (id ? `#${id}` : "—");

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      const res = await testSenderId(id);
      if (res?.status === "error") toast.error(res.message || "Connection failed");
      else toast.success(res?.message || "Connection successful");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Connection failed");
    }
    setTestingId(null);
  };

  const columns: Column<SenderIDConfig>[] = [
    { header: "Sender ID", accessor: (r) => r.sender_id, searchable: (r) => r.sender_id },
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "Channel", accessor: (r) => channelName(r.channel, r.channel_name) },
    { header: "Provider", accessor: (r) => r.provider_name || "—", searchable: (r) => r.provider_name ?? "" },
    { header: "Default", accessor: (r) => (r.is_default ? <Badge>Default</Badge> : <span className="text-muted-foreground">—</span>) },
    {
      header: "Connection",
      accessor: (r) => (
        <Button variant="outline" size="sm" disabled={testingId === r.id} onClick={() => handleTest(r.id)}>
          <Plug className="h-3.5 w-3.5 mr-1" />
          {testingId === r.id ? "Testing..." : "Test"}
        </Button>
      ),
    },
  ];

  const openView = (item: SenderIDConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: SenderIDConfig) => {
    setCurrent(item);
    setForm({
      sender_id: item.sender_id ?? "",
      name: item.name ?? "",
      channel: item.channel ?? null,
      data_source: item.data_source ?? null,
      provider_name: item.provider_name ?? "",
      provider_url: item.provider_url ?? "",
      api_key: "",
      username: item.username ?? "",
      password: "",
      description: item.description ?? "",
      is_default: item.is_default ?? false,
      is_active: item.is_active ?? true,
    });
    setModal("edit");
  };
  const openCreate = () => { setForm(emptyForm); setCurrent(null); setModal("create"); };

  const handleSave = async () => {
    if (!form.sender_id || !form.name) { toast.error("Sender ID and name are required"); return; }
    setSaving(true);
    try {
      const payload: Partial<SenderIDConfig> = {
        sender_id: form.sender_id,
        name: form.name,
        channel: form.channel,
        data_source: form.data_source,
        provider_name: form.provider_name,
        provider_url: form.provider_url,
        username: form.username,
        description: form.description,
        is_default: form.is_default,
        is_active: form.is_active,
      };
      if (form.api_key) payload.api_key = form.api_key;
      if (form.password) payload.password = form.password;
      if (modal === "create") await createSenderId(payload);
      else if (current) await updateSenderId(current.id, payload);
      toast.success(modal === "create" ? "Sender ID created" : "Sender ID updated");
      setModal(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteSenderId(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: SenderIDConfig) => {
    try { await updateSenderId(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  const formContent = (disabled: boolean) => (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Sender ID</Label>
          <Input maxLength={11} value={disabled ? current?.sender_id ?? "" : form.sender_id} onChange={(e) => setForm({ ...form, sender_id: e.target.value })} disabled={disabled} />
        </div>
        <div>
          <Label>Name</Label>
          <Input value={disabled ? current?.name ?? "" : form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={disabled} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Channel</Label>
          {disabled ? (
            <Input value={channelName(current?.channel ?? null, current?.channel_name)} disabled />
          ) : (
            <Select value={form.channel ? String(form.channel) : ""} onValueChange={(v) => setForm({ ...form, channel: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger>
              <SelectContent>
                {channels.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label>Data Source</Label>
          {disabled ? (
            <Input value={sources.find((s) => s.id === current?.data_source)?.name ?? "—"} disabled />
          ) : (
            <Select value={form.data_source ? String(form.data_source) : ""} onValueChange={(v) => setForm({ ...form, data_source: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Select data source" /></SelectTrigger>
              <SelectContent>
                {sources.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div><Label>Provider Name</Label><Input value={disabled ? current?.provider_name ?? "" : form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} disabled={disabled} /></div>
      <div><Label>Provider URL</Label><Input value={disabled ? current?.provider_url ?? "" : form.provider_url} onChange={(e) => setForm({ ...form, provider_url: e.target.value })} disabled={disabled} /></div>
      <div><Label>Username</Label><Input value={disabled ? current?.username ?? "" : form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={disabled} /></div>
      {!disabled && (
        <>
          <div><Label>API Key</Label><Input value={form.api_key} placeholder={modal === "edit" ? "Leave blank to keep current" : ""} onChange={(e) => setForm({ ...form, api_key: e.target.value })} /></div>
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={form.password} placeholder={modal === "edit" ? "Leave blank to keep current" : ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      )}
      <div><Label>Description</Label><Input value={disabled ? current?.description ?? "" : form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={disabled} /></div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2"><Switch checked={disabled ? current?.is_default ?? false : form.is_default} onCheckedChange={(v) => !disabled && setForm({ ...form, is_default: v })} disabled={disabled} /><Label>Default</Label></div>
        <div className="flex items-center gap-2"><Switch checked={disabled ? current?.is_active ?? false : form.is_active} onCheckedChange={(v) => !disabled && setForm({ ...form, is_active: v })} disabled={disabled} /><Label>Active</Label></div>
      </div>
    </>
  );

  return (
    <>
      <ConfigTable title="Sender ID Configurations" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />
      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="Sender ID Details" readOnly>{formContent(true)}</ConfigFormModal>
      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add Sender ID" : "Edit Sender ID"} onSubmit={handleSave} loading={saving}>{formContent(false)}</ConfigFormModal>
    </>
  );
}
