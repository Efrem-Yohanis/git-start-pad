import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Plug } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  EmailServiceConfig,
  fetchEmailServices,
  createEmailService,
  updateEmailService,
  deleteEmailService,
  testEmailService,
} from "@/lib/api/configurations";

const emptyForm = {
  name: "", smtp_host: "", smtp_port: 587, use_tls: true, use_ssl: false,
  username: "", password: "", sender_email: "", sender_name: "", is_active: true,
};

export default function EmailServicesTab() {
  const [data, setData] = useState<EmailServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<EmailServiceConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchEmailServices(); setData(res.results ?? []); } catch { toast.error("Failed to load email services"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      const res = await testEmailService(id);
      if (res?.status === "error") toast.error(res.message || "Connection failed");
      else toast.success(res?.message || "Connection successful");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Connection failed"); }
    setTestingId(null);
  };

  const columns: Column<EmailServiceConfig>[] = [
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "SMTP Host", accessor: (r) => `${r.smtp_host}:${r.smtp_port}`, searchable: (r) => r.smtp_host },
    { header: "Sender", accessor: (r) => r.sender_email, searchable: (r) => r.sender_email },
    { header: "Security", accessor: (r) => (r.use_ssl ? "SSL" : r.use_tls ? "TLS" : "None") },
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

  const openView = (item: EmailServiceConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: EmailServiceConfig) => {
    setCurrent(item);
    setForm({
      name: item.name ?? "", smtp_host: item.smtp_host ?? "", smtp_port: item.smtp_port ?? 587,
      use_tls: item.use_tls ?? false, use_ssl: item.use_ssl ?? false, username: item.username ?? "",
      password: "", sender_email: item.sender_email ?? "", sender_name: item.sender_name ?? "",
      is_active: item.is_active ?? true,
    });
    setModal("edit");
  };
  const openCreate = () => { setForm(emptyForm); setCurrent(null); setModal("create"); };

  const handleSave = async () => {
    if (!form.name || !form.smtp_host || !form.sender_email) { toast.error("Name, SMTP host, and sender email are required"); return; }
    setSaving(true);
    try {
      const payload: Partial<EmailServiceConfig> = { ...form, smtp_port: Number(form.smtp_port) };
      if (!form.password) delete payload.password;
      if (modal === "create") await createEmailService(payload);
      else if (current) await updateEmailService(current.id, payload);
      toast.success(modal === "create" ? "Email service created" : "Email service updated");
      setModal(null); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteEmailService(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: EmailServiceConfig) => {
    try { await updateEmailService(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  const formContent = (disabled: boolean) => (
    <>
      <div><Label>Name</Label><Input value={disabled ? current?.name ?? "" : form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={disabled} /></div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2"><Label>SMTP Host</Label><Input value={disabled ? current?.smtp_host ?? "" : form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} disabled={disabled} /></div>
        <div><Label>Port</Label><Input type="number" value={disabled ? current?.smtp_port ?? "" : form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })} disabled={disabled} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Sender Email</Label><Input type="email" value={disabled ? current?.sender_email ?? "" : form.sender_email} onChange={(e) => setForm({ ...form, sender_email: e.target.value })} disabled={disabled} /></div>
        <div><Label>Sender Name</Label><Input value={disabled ? current?.sender_name ?? "" : form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} disabled={disabled} /></div>
      </div>
      <div><Label>Username</Label><Input value={disabled ? current?.username ?? "" : form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={disabled} /></div>
      {!disabled && (
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input type={showPw ? "text" : "password"} value={form.password} placeholder={modal === "edit" ? "Leave blank to keep current" : ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2"><Switch checked={disabled ? current?.use_tls ?? false : form.use_tls} onCheckedChange={(v) => !disabled && setForm({ ...form, use_tls: v, use_ssl: v ? false : form.use_ssl })} disabled={disabled} /><Label>Use TLS</Label></div>
        <div className="flex items-center gap-2"><Switch checked={disabled ? current?.use_ssl ?? false : form.use_ssl} onCheckedChange={(v) => !disabled && setForm({ ...form, use_ssl: v, use_tls: v ? false : form.use_tls })} disabled={disabled} /><Label>Use SSL</Label></div>
        <div className="flex items-center gap-2"><Switch checked={disabled ? current?.is_active ?? false : form.is_active} onCheckedChange={(v) => !disabled && setForm({ ...form, is_active: v })} disabled={disabled} /><Label>Active</Label></div>
      </div>
    </>
  );

  return (
    <>
      <ConfigTable title="Email Service Configurations" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />
      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="Email Service Details" readOnly>{formContent(true)}</ConfigFormModal>
      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add Email Service" : "Edit Email Service"} onSubmit={handleSave} loading={saving}>{formContent(false)}</ConfigFormModal>
    </>
  );
}
