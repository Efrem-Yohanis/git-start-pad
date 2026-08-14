import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  ChannelConfig,
  fetchChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from "@/lib/api/configurations";

const CHANNEL_TYPES = ["sms", "flash_sms", "app_notification", "email"];

const emptyForm = { code: "", name: "", description: "", channel_type: "sms", is_default: false, is_active: true };

export default function ChannelsTab() {
  const [data, setData] = useState<ChannelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<ChannelConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchChannels(); setData(res.results ?? []); } catch { toast.error("Failed to load channels"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<ChannelConfig>[] = [
    { header: "Code", accessor: (r) => r.code, searchable: (r) => r.code },
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "Type", accessor: (r) => r.channel_type },
    { header: "Default", accessor: (r) => (r.is_default ? <Badge>Default</Badge> : <span className="text-muted-foreground">—</span>) },
  ];

  const openView = (item: ChannelConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: ChannelConfig) => {
    setCurrent(item);
    setForm({ code: item.code, name: item.name, description: item.description ?? "", channel_type: item.channel_type ?? "sms", is_default: item.is_default, is_active: item.is_active });
    setModal("edit");
  };
  const openCreate = () => { setCurrent(null); setForm(emptyForm); setModal("create"); };

  const handleSave = async () => {
    if (!form.code || !form.name) { toast.error("Code and name are required"); return; }
    setSaving(true);
    try {
      if (modal === "create") await createChannel(form);
      else if (current) await updateChannel(current.id, form);
      toast.success(modal === "create" ? "Channel created" : "Channel updated");
      setModal(null); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteChannel(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: ChannelConfig) => {
    try { await updateChannel(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  return (
    <>
      <ConfigTable title="Channels" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />

      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="Channel Details" readOnly>
        <div><Label>Code</Label><Input value={current?.code ?? ""} disabled /></div>
        <div><Label>Name</Label><Input value={current?.name ?? ""} disabled /></div>
        <div><Label>Type</Label><Input value={current?.channel_type ?? ""} disabled /></div>
        <div><Label>Description</Label><Textarea value={current?.description ?? ""} disabled /></div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><Switch checked={current?.is_default ?? false} disabled /><Label>Default</Label></div>
          <div className="flex items-center gap-2"><Switch checked={current?.is_active ?? false} disabled /><Label>Active</Label></div>
        </div>
      </ConfigFormModal>

      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add Channel" : "Edit Channel"} onSubmit={handleSave} loading={saving}>
        <div><Label>Code</Label><Input placeholder="sms" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div><Label>Name</Label><Input placeholder="SMS" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div>
          <Label>Channel Type</Label>
          <Select value={form.channel_type} onValueChange={(v) => setForm({ ...form, channel_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CHANNEL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} /><Label>Default</Label></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
        </div>
      </ConfigFormModal>
    </>
  );
}
