import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plug } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  DataSourceConfig,
  fetchDataSources,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  testDataSource,
} from "@/lib/api/configurations";

const DB_TYPES = ["postgresql", "mysql", "oracle", "mssql", "sqlite"];

const emptyForm = {
  name: "", database_type: "postgresql", host: "", port: 5432,
  database_name: "", username: "", password: "", ssl_required: false, is_active: true,
};

export default function DataSourcesTab() {
  const [data, setData] = useState<DataSourceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<DataSourceConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchDataSources(); setData(res.results ?? []); } catch { toast.error("Failed to load data sources"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      const res = await testDataSource(id);
      if (res?.status === "error") toast.error(res.message || "Connection failed");
      else toast.success(res?.message || "Connection successful");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Connection failed"); }
    setTestingId(null);
  };

  const columns: Column<DataSourceConfig>[] = [
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "Type", accessor: (r) => r.database_type },
    { header: "Host", accessor: (r) => `${r.host}:${r.port}`, searchable: (r) => r.host },
    { header: "Database", accessor: (r) => r.database_name },
    {
      header: "Connection",
      accessor: (r) => (
        <Button variant="outline" size="sm" disabled={testingId === r.id} onClick={(e) => { e.stopPropagation(); handleTest(r.id); }}>
          <Plug className="h-3.5 w-3.5 mr-1" />{testingId === r.id ? "Testing..." : "Test"}
        </Button>
      ),
    },
  ];

  const openView = (item: DataSourceConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: DataSourceConfig) => {
    setCurrent(item);
    setForm({
      name: item.name, database_type: item.database_type, host: item.host, port: item.port,
      database_name: item.database_name, username: item.username, password: "",
      ssl_required: item.ssl_required, is_active: item.is_active,
    });
    setModal("edit");
  };
  const openCreate = () => { setCurrent(null); setForm(emptyForm); setModal("create"); };

  const handleSave = async () => {
    if (!form.name || !form.host || !form.database_name) { toast.error("Name, host and database are required"); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (modal === "edit" && !payload.password) delete (payload as Partial<typeof form>).password;
      if (modal === "create") await createDataSource(payload);
      else if (current) await updateDataSource(current.id, payload);
      toast.success(modal === "create" ? "Data source created" : "Data source updated");
      setModal(null); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteDataSource(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: DataSourceConfig) => {
    try { await updateDataSource(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  return (
    <>
      <ConfigTable title="Data Sources" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />

      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="Data Source Details" readOnly>
        <div><Label>Name</Label><Input value={current?.name ?? ""} disabled /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Type</Label><Input value={current?.database_type ?? ""} disabled /></div>
          <div><Label>Port</Label><Input value={current?.port ?? ""} disabled /></div>
        </div>
        <div><Label>Host</Label><Input value={current?.host ?? ""} disabled /></div>
        <div><Label>Database</Label><Input value={current?.database_name ?? ""} disabled /></div>
        <div><Label>Username</Label><Input value={current?.username ?? ""} disabled /></div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><Switch checked={current?.ssl_required ?? false} disabled /><Label>SSL Required</Label></div>
          <div className="flex items-center gap-2"><Switch checked={current?.is_active ?? false} disabled /><Label>Active</Label></div>
        </div>
        {current && (
          <Button variant="outline" className="w-full" disabled={testingId === current.id} onClick={() => handleTest(current.id)}>
            <Plug className="h-4 w-4 mr-2" />{testingId === current.id ? "Testing..." : "Test Connection"}
          </Button>
        )}
      </ConfigFormModal>

      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add Data Source" : "Edit Data Source"} onSubmit={handleSave} loading={saving}>
        <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Database Type</Label>
            <Select value={form.database_type} onValueChange={(v) => setForm({ ...form, database_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Port</Label><Input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} /></div>
        </div>
        <div><Label>Host</Label><Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} /></div>
        <div><Label>Database Name</Label><Input value={form.database_name} onChange={(e) => setForm({ ...form, database_name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div><Label>Password</Label><Input type="password" placeholder={modal === "edit" ? "Unchanged" : ""} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><Switch checked={form.ssl_required} onCheckedChange={(v) => setForm({ ...form, ssl_required: v })} /><Label>SSL Required</Label></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
        </div>
      </ConfigFormModal>
    </>
  );
}
