import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database, Loader2, Table2 } from "lucide-react";
import type { Recipient, Language } from "@/types/campaign";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/types/campaign";

interface Props {
  recipients: Recipient[];
  onChange: (r: Recipient[]) => void;
}

const MOCK_CONNECTIONS = [
  { id: "pg-main", name: "Production PostgreSQL", type: "PostgreSQL" },
  { id: "pg-staging", name: "Staging Database", type: "PostgreSQL" },
  { id: "mysql-legacy", name: "Legacy MySQL", type: "MySQL" },
];

const MOCK_TABLES: Record<string, { name: string; rowCount: number }[]> = {
  "pg-main": [
    { name: "subscribers", rowCount: 12450 },
    { name: "vip_customers", rowCount: 842 },
    { name: "new_signups_2024", rowCount: 3210 },
  ],
  "pg-staging": [
    { name: "test_users", rowCount: 500 },
    { name: "beta_testers", rowCount: 120 },
  ],
  "mysql-legacy": [
    { name: "old_subscribers", rowCount: 8900 },
  ],
};

const MOCK_COLUMNS = ["id", "msisdn", "phone_number", "lang", "language", "name", "email", "created_at"];

const LANG_COLORS: Record<string, string> = {
  en: "bg-blue-100 text-blue-700",
  am: "bg-emerald-100 text-emerald-700",
  ti: "bg-orange-100 text-orange-700",
  om: "bg-purple-100 text-purple-700",
  so: "bg-rose-100 text-rose-700",
};

export default function DatabaseTab({ recipients, onChange }: Props) {
  const [connection, setConnection] = useState("");
  const [table, setTable] = useState("");
  const [msisdnCol, setMsisdnCol] = useState("");
  const [langCol, setLangCol] = useState("");
  const [whereClause, setWhereClause] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Recipient[]>([]);

  const tables = connection ? MOCK_TABLES[connection] || [] : [];

  function handlePreview() {
    if (!connection || !table || !msisdnCol || !langCol) return;
    setLoading(true);
    // Simulate DB query
    setTimeout(() => {
      const mock: Recipient[] = Array.from({ length: 10 }, (_, i) => ({
        msisdn: `+2519${String(10000000 + Math.floor(Math.random() * 89999999))}`,
        lang: SUPPORTED_LANGUAGES[i % SUPPORTED_LANGUAGES.length],
      }));
      setPreview(mock);
      onChange(mock);
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-medium">Database Connection</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Import recipients directly from an existing database table
        </p>
      </div>

      {/* Step 1: Connection */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Step 1: Select Connection</Label>
        <Select value={connection} onValueChange={(v) => { setConnection(v); setTable(""); setPreview([]); }}>
          <SelectTrigger>
            <SelectValue placeholder="Choose database connection..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_CONNECTIONS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-muted-foreground" />
                  {c.name}
                  <span className="text-xs text-muted-foreground">({c.type})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 2: Table */}
      {connection && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Step 2: Select Table</Label>
          <Select value={table} onValueChange={(v) => { setTable(v); setPreview([]); }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose table..." />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem key={t.name} value={t.name}>
                  <span className="flex items-center gap-2">
                    <Table2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.name}
                    <span className="text-xs text-muted-foreground">({t.rowCount.toLocaleString()} rows)</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 3: Column mapping */}
      {table && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Step 3: Map Columns</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">MSISDN Column</Label>
              <Select value={msisdnCol} onValueChange={setMsisdnCol}>
                <SelectTrigger><SelectValue placeholder="Select column..." /></SelectTrigger>
                <SelectContent>
                  {MOCK_COLUMNS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Language Column</Label>
              <Select value={langCol} onValueChange={setLangCol}>
                <SelectTrigger><SelectValue placeholder="Select column..." /></SelectTrigger>
                <SelectContent>
                  {MOCK_COLUMNS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: WHERE */}
      {msisdnCol && langCol && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Step 4: Filter (Optional)</Label>
          <Textarea
            value={whereClause}
            onChange={(e) => setWhereClause(e.target.value)}
            placeholder="e.g. status = 'active' AND created_at > '2024-01-01'"
            rows={2}
            className="font-mono text-sm"
          />
        </div>
      )}

      {/* Step 5: Preview */}
      {msisdnCol && langCol && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Step 5: Preview & Import</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={loading}
              className="gap-1.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Loading..." : "Preview Data"}
            </Button>
          </div>

          {preview.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">#</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">MSISDN</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Language</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.msisdn}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary" className={`text-[11px] ${LANG_COLORS[r.lang] || ""}`}>
                          {LANGUAGE_LABELS[r.lang]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
