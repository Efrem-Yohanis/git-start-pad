import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  RouterConfig,
  fetchRouterConfigs,
  createRouterConfig,
  updateRouterConfig,
  deleteRouterConfig,
} from "@/lib/api/configurations";

const emptyForm = {
  name: "", isp_name: "", provider: "", host: "", port: 8080, username: "", password: "",
  priority: 1, weight: 100, channel: 1, rate_per_message: "0.05", currency: "ETB",
  is_active: true, is_default: false, supports_dlr: true, max_concatenated: 5,
};

export default function RouterConfigsTab() {
  const [data, setData] = useState<RouterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<RouterConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchRouterConfigs(); setData(res.results); } catch { toast.error("Failed to load router configs"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<RouterConfig>[] = [
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "ISP", accessor: (r) => r.isp_name, searchable: (r) => r.isp_name },
    { header: "Provider", accessor: (r) => r.provider },
    { header: "Priority", accessor: (r) => r.priority },
    { header: "Default", accessor: (r) => r.is_default ? <Badge>Default</Badge> : null },
  ];

  const openView = (item: RouterConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: RouterConfig) => {
    setCurrent(item);
    setForm({
      name: item.name, isp_name: item.isp_name, provider: item.provider, host: item.host,
      port: item.port, username: item.username, password: "", priority: item.priority,
      weight: item.weight, channel: item.channel, rate_per_message: item.rate_per_message,
      currency: item.currency, is_active: item.is_active, is_default: item.is_default,
      supports_dlr: item.supports_dlr, max_concatenated: item.max_concatenated,
    });
    setModal("edit");
  };
  const openCreate = () => { setForm(emptyForm); setModal("create"); };

  const handleSave = async () => {
    if (!form.name || !form.isp_name || !form.host) { toast.error("Name, ISP, and host are required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, port: Number(form.port), priority: Number(form.priority), weight: Number(form.weight), channel: Number(form.channel), max_concatenated: Number(form.max_concatenated) };
      if (modal === "create") await createRouterConfig(payload);
      else if (current) await updateRouterConfig(current.id, payload);
      toast.success(modal === "create" ? "Router created" : "Router updated");
      setModal(null); load();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteRouterConfig(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: RouterConfig) => {
    try { await updateRouterConfig(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  const formContent = (disabled: boolean) => {
    const v = disabled ? current : form;
    if (!v) return null;
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Name</Label><Input value={v.name} onChange={(e) => !disabled && setForm({ ...form, name: e.target.value })} disabled={disabled} /></div>
          <div><Label>ISP Name</Label><Input value={v.isp_name} onChange={(e) => !disabled && setForm({ ...form, isp_name: e.target.value })} disabled={disabled} /></div>
        </div>
        <div><Label>Provider</Label><Input value={v.provider} onChange={(e) => !disabled && setForm({ ...form, provider: e.target.value })} disabled={disabled} /></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2"><Label>Host</Label><Input value={v.host} onChange={(e) => !disabled && setForm({ ...form, host: e.target.value })} disabled={disabled} /></div>
          <div><Label>Port</Label><Input type="number" value={v.port} onChange={(e) => !disabled && setForm({ ...form, port: Number(e.target.value) })} disabled={disabled} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Username</Label><Input value={v.username} onChange={(e) => !disabled && setForm({ ...form, username: e.target.value })} disabled={disabled} /></div>
          {!disabled && (
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div><Label>Priority</Label><Input type="number" value={v.priority} onChange={(e) => !disabled && setForm({ ...form, priority: Number(e.target.value) })} disabled={disabled} /></div>
          <div><Label>Weight</Label><Input type="number" value={v.weight} onChange={(e) => !disabled && setForm({ ...form, weight: Number(e.target.value) })} disabled={disabled} /></div>
          <div><Label>Channel ID</Label><Input type="number" value={v.channel} onChange={(e) => !disabled && setForm({ ...form, channel: Number(e.target.value) })} disabled={disabled} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div><Label>Rate/Msg</Label><Input value={v.rate_per_message} onChange={(e) => !disabled && setForm({ ...form, rate_per_message: e.target.value })} disabled={disabled} /></div>
          <div><Label>Currency</Label><Input maxLength={3} value={v.currency} onChange={(e) => !disabled && setForm({ ...form, currency: e.target.value.toUpperCase() })} disabled={disabled} /></div>
          <div><Label>Max Concat</Label><Input type="number" value={v.max_concatenated} onChange={(e) => !disabled && setForm({ ...form, max_concatenated: Number(e.target.value) })} disabled={disabled} /></div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2"><Switch checked={v.is_active} onCheckedChange={(val) => !disabled && setForm({ ...form, is_active: val })} disabled={disabled} /><Label>Active</Label></div>
          <div className="flex items-center gap-2"><Switch checked={v.is_default} onCheckedChange={(val) => !disabled && setForm({ ...form, is_default: val })} disabled={disabled} /><Label>Default</Label></div>
          <div className="flex items-center gap-2"><Switch checked={v.supports_dlr} onCheckedChange={(val) => !disabled && setForm({ ...form, supports_dlr: val })} disabled={disabled} /><Label>DLR Support</Label></div>
        </div>
      </>
    );
  };

  return (
    <>
      <ConfigTable title="Router Configurations" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />
      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="Router Details" readOnly>{formContent(true)}</ConfigFormModal>
      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add Router" : "Edit Router"} onSubmit={handleSave} loading={saving}>{formContent(false)}</ConfigFormModal>
    </>
  );
}
