import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  SupportedChannel,
  fetchChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from "@/lib/api/configurations";

const emptyForm = { name: "", code: "", priority: 1, is_active: true };

export default function ChannelsTab() {
  const [data, setData] = useState<SupportedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<SupportedChannel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchChannels(); setData(res.results); } catch { toast.error("Failed to load channels"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<SupportedChannel>[] = [
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "Code", accessor: (r) => r.code, searchable: (r) => r.code },
    { header: "Priority", accessor: (r) => r.priority },
  ];

  const openView = (item: SupportedChannel) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: SupportedChannel) => { setCurrent(item); setForm({ name: item.name, code: item.code, priority: item.priority, is_active: item.is_active }); setModal("edit"); };
  const openCreate = () => { setForm(emptyForm); setModal("create"); };

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error("Name and code are required"); return; }
    setSaving(true);
    try {
      if (modal === "create") await createChannel(form);
      else if (current) await updateChannel(current.id, form);
      toast.success(modal === "create" ? "Channel created" : "Channel updated");
      setModal(null); load();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteChannel(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: SupportedChannel) => {
    try { await updateChannel(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  return (
    <>
      <ConfigTable title="Supported Channels" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />
      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="Channel Details" readOnly>
        <div><Label>Name</Label><Input value={current?.name ?? ""} disabled /></div>
        <div><Label>Code</Label><Input value={current?.code ?? ""} disabled /></div>
        <div><Label>Priority</Label><Input value={current?.priority ?? ""} disabled /></div>
        <div className="flex items-center gap-2"><Switch checked={current?.is_active ?? false} disabled /><Label>Active</Label></div>
      </ConfigFormModal>
      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add Channel" : "Edit Channel"} onSubmit={handleSave} loading={saving}>
        <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div><Label>Priority</Label><Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} /></div>
        <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
      </ConfigFormModal>
    </>
  );
}
