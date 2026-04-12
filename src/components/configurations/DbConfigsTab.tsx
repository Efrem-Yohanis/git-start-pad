import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  DatabaseConfig,
  fetchDbConfigs,
  createDbConfig,
  updateDbConfig,
  deleteDbConfig,
} from "@/lib/api/configurations";

const emptyForm = { name: "", connection_type: "postgresql", host: "", port: 5432, database_name: "", username: "", password: "", is_active: true };

export default function DbConfigsTab() {
  const [data, setData] = useState<DatabaseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<DatabaseConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchDbConfigs(); setData(res.results); } catch { toast.error("Failed to load DB configs"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<DatabaseConfig>[] = [
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "Type", accessor: (r) => r.connection_type },
    { header: "Host", accessor: (r) => r.host, searchable: (r) => r.host },
    { header: "Database", accessor: (r) => r.database_name },
  ];

  const openView = (item: DatabaseConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: DatabaseConfig) => {
    setCurrent(item);
    setForm({ name: item.name, connection_type: item.connection_type, host: item.host, port: item.port, database_name: item.database_name, username: item.username, password: "", is_active: item.is_active });
    setModal("edit");
  };
  const openCreate = () => { setForm(emptyForm); setModal("create"); };

  const handleSave = async () => {
    if (!form.name || !form.host || !form.database_name) { toast.error("Name, host, and database name are required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, port: Number(form.port) };
      if (modal === "create") await createDbConfig(payload);
      else if (current) await updateDbConfig(current.id, payload);
      toast.success(modal === "create" ? "Config created" : "Config updated");
      setModal(null); load();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteDbConfig(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: DatabaseConfig) => {
    try { await updateDbConfig(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  const formContent = (disabled: boolean) => (
    <>
      <div><Label>Name</Label><Input value={disabled ? current?.name ?? "" : form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={disabled} /></div>
      <div>
        <Label>Connection Type</Label>
        {disabled ? <Input value={current?.connection_type ?? ""} disabled /> : (
          <Select value={form.connection_type} onValueChange={(v) => setForm({ ...form, connection_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="oracle">Oracle</SelectItem>
              <SelectItem value="mssql">MSSQL</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2"><Label>Host</Label><Input value={disabled ? current?.host ?? "" : form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} disabled={disabled} /></div>
        <div><Label>Port</Label><Input type="number" value={disabled ? current?.port ?? "" : form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} disabled={disabled} /></div>
      </div>
      <div><Label>Database Name</Label><Input value={disabled ? current?.database_name ?? "" : form.database_name} onChange={(e) => setForm({ ...form, database_name: e.target.value })} disabled={disabled} /></div>
      <div><Label>Username</Label><Input value={disabled ? current?.username ?? "" : form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={disabled} /></div>
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
      <div className="flex items-center gap-2"><Switch checked={disabled ? current?.is_active ?? false : form.is_active} onCheckedChange={(v) => !disabled && setForm({ ...form, is_active: v })} disabled={disabled} /><Label>Active</Label></div>
    </>
  );

  return (
    <>
      <ConfigTable title="Database Configurations" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />
      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="DB Config Details" readOnly>{formContent(true)}</ConfigFormModal>
      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add DB Config" : "Edit DB Config"} onSubmit={handleSave} loading={saving}>{formContent(false)}</ConfigFormModal>
    </>
  );
}
