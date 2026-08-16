import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  SenderIdConfig,
  fetchSenderIds,
  createSenderId,
  updateSenderId,
  deleteSenderId,
} from "@/lib/api/configurations";

const emptyForm = { sender_id: "", description: "", country_code: "ET", is_active: true, is_verified: false, channel: 1 };

export default function SenderIdsTab() {
  const [data, setData] = useState<SenderIdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<SenderIdConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchSenderIds(); setData(res.results); } catch { toast.error("Failed to load sender IDs"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<SenderIdConfig>[] = [
    { header: "Sender ID", accessor: (r) => r.sender_id, searchable: (r) => r.sender_id },
    { header: "Country", accessor: (r) => r.country_code },
    { header: "Channel", accessor: (r) => r.channel_name ?? String(r.channel) },
    { header: "Verified", accessor: (r) => <Badge variant={r.is_verified ? "default" : "outline"}>{r.is_verified ? "Verified" : "Pending"}</Badge> },
  ];

  const openView = (item: SenderIdConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: SenderIdConfig) => { setCurrent(item); setForm({ sender_id: item.sender_id, description: item.description, country_code: item.country_code, is_active: item.is_active, is_verified: item.is_verified, channel: item.channel }); setModal("edit"); };
  const openCreate = () => { setForm(emptyForm); setModal("create"); };

  const handleSave = async () => {
    if (!form.sender_id) { toast.error("Sender ID is required"); return; }
    setSaving(true);
    try {
      if (modal === "create") await createSenderId(form);
      else if (current) await updateSenderId(current.id, form);
      toast.success(modal === "create" ? "Sender ID created" : "Sender ID updated");
      setModal(null); load();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteSenderId(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: SenderIdConfig) => {
    try { await updateSenderId(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  const formContent = (disabled: boolean) => (
    <>
      <div><Label>Sender ID</Label><Input maxLength={11} value={disabled ? current?.sender_id ?? "" : form.sender_id} onChange={(e) => setForm({ ...form, sender_id: e.target.value })} disabled={disabled} /></div>
      <div><Label>Description</Label><Input value={disabled ? current?.description ?? "" : form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={disabled} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Country Code</Label><Input maxLength={2} value={disabled ? current?.country_code ?? "" : form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} disabled={disabled} /></div>
        <div><Label>Channel ID</Label><Input type="number" value={disabled ? current?.channel ?? "" : form.channel} onChange={(e) => setForm({ ...form, channel: Number(e.target.value) })} disabled={disabled} /></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2"><Switch checked={disabled ? current?.is_active ?? false : form.is_active} onCheckedChange={(v) => !disabled && setForm({ ...form, is_active: v })} disabled={disabled} /><Label>Active</Label></div>
        <div className="flex items-center gap-2"><Switch checked={disabled ? current?.is_verified ?? false : form.is_verified} onCheckedChange={(v) => !disabled && setForm({ ...form, is_verified: v })} disabled={disabled} /><Label>Verified</Label></div>
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
