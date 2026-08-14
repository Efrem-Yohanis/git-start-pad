import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ConfigTable, { Column } from "./ConfigTable";
import ConfigFormModal from "./ConfigFormModal";
import {
  LanguageConfig,
  fetchLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "@/lib/api/configurations";

const emptyForm = { code: "", name: "", native_name: "", is_default: false, is_active: true };

export default function LanguagesTab() {
  const [data, setData] = useState<LanguageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [current, setCurrent] = useState<LanguageConfig | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLanguages();
      setData(res.results ?? []);
    } catch { toast.error("Failed to load languages"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<LanguageConfig>[] = [
    { header: "Code", accessor: (r) => r.code, searchable: (r) => r.code },
    { header: "Name", accessor: (r) => r.name, searchable: (r) => r.name },
    { header: "Native Name", accessor: (r) => r.native_name, searchable: (r) => r.native_name ?? "" },
    { header: "Default", accessor: (r) => (r.is_default ? <Badge>Default</Badge> : <span className="text-muted-foreground">—</span>) },
  ];

  const openView = (item: LanguageConfig) => { setCurrent(item); setModal("view"); };
  const openEdit = (item: LanguageConfig) => {
    setCurrent(item);
    setForm({ code: item.code, name: item.name, native_name: item.native_name ?? "", is_default: item.is_default, is_active: item.is_active });
    setModal("edit");
  };
  const openCreate = () => { setCurrent(null); setForm(emptyForm); setModal("create"); };

  const handleSave = async () => {
    if (!form.code || !form.name) { toast.error("Code and name are required"); return; }
    setSaving(true);
    try {
      if (modal === "create") await createLanguage(form);
      else if (current) await updateLanguage(current.id, form);
      toast.success(modal === "create" ? "Language created" : "Language updated");
      setModal(null);
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    try { await deleteLanguage(id); toast.success("Deleted"); load(); } catch { toast.error("Delete failed"); }
  };

  const handleToggle = async (item: LanguageConfig) => {
    try { await updateLanguage(item.id, { is_active: !item.is_active }); load(); } catch { toast.error("Update failed"); }
  };

  return (
    <>
      <ConfigTable title="Languages" columns={columns} data={data} loading={loading} onAdd={openCreate} onView={openView} onEdit={openEdit} onDelete={handleDelete} onToggleActive={handleToggle} />

      <ConfigFormModal open={modal === "view"} onClose={() => setModal(null)} title="Language Details" readOnly>
        <div><Label>Code</Label><Input value={current?.code ?? ""} disabled /></div>
        <div><Label>Name</Label><Input value={current?.name ?? ""} disabled /></div>
        <div><Label>Native Name</Label><Input value={current?.native_name ?? ""} disabled /></div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><Switch checked={current?.is_default ?? false} disabled /><Label>Default</Label></div>
          <div className="flex items-center gap-2"><Switch checked={current?.is_active ?? false} disabled /><Label>Active</Label></div>
        </div>
      </ConfigFormModal>

      <ConfigFormModal open={modal === "edit" || modal === "create"} onClose={() => setModal(null)} title={modal === "create" ? "Add Language" : "Edit Language"} onSubmit={handleSave} loading={saving}>
        <div><Label>Code</Label><Input placeholder="en" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
        <div><Label>Name</Label><Input placeholder="English" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Native Name</Label><Input placeholder="English" value={form.native_name} onChange={(e) => setForm({ ...form, native_name: e.target.value })} /></div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} /><Label>Default</Label></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
        </div>
      </ConfigFormModal>
    </>
  );
}
