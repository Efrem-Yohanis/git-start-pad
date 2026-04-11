import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Recipient, Language } from "@/types/campaign";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/types/campaign";
import * as XLSX from "xlsx";

interface Props {
  recipients: Recipient[];
  onChange: (r: Recipient[]) => void;
}

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

const LANG_COLORS: Record<string, string> = {
  en: "bg-blue-100 text-blue-700",
  am: "bg-emerald-100 text-emerald-700",
  ti: "bg-orange-100 text-orange-700",
  om: "bg-purple-100 text-purple-700",
  so: "bg-rose-100 text-rose-700",
};

export default function CsvUploadTab({ recipients, onChange }: Props) {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<Recipient[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [stats, setStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErrors([]);
    setPreview([]);
    setStats(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      setErrors(["Unsupported file type. Use .csv, .xlsx, or .xls"]);
      return;
    }

    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let startRow = 0;
      if (rows.length > 0) {
        const first = rows[0][0]?.toString().toLowerCase() ?? "";
        if (["phone", "msisdn", "number", "mobile", "tel", "lang"].some((h) => first.includes(h))) {
          startRow = 1;
        }
      }

      const dataRows = rows.slice(startRow).filter((r) => r.length >= 1);
      const parsed: Recipient[] = [];
      const errs: string[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const [msisdn, lang] = dataRows[i].map((s) => s?.toString().trim() ?? "");
        if (!msisdn) continue;
        if (!PHONE_REGEX.test(msisdn)) {
          errs.push(`Row ${startRow + i + 1}: invalid phone "${msisdn}"`);
          continue;
        }
        const normLang = (lang?.toLowerCase() || "en") as Language;
        if (!SUPPORTED_LANGUAGES.includes(normLang)) {
          errs.push(`Row ${startRow + i + 1}: unsupported language "${lang}"`);
          continue;
        }
        parsed.push({ msisdn, lang: normLang });
      }

      setStats({ total: dataRows.length, valid: parsed.length, invalid: errs.length });
      setPreview(parsed.slice(0, 5));
      if (errs.length) setErrors(errs.slice(0, 10));
      if (parsed.length) onChange(parsed);
    } catch {
      setErrors(["Failed to read file. Please check the format."]);
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">CSV / Excel Upload</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload a file with columns: <code className="bg-muted px-1 rounded text-[11px]">msisdn</code>,{" "}
          <code className="bg-muted px-1 rounded text-[11px]">lang</code> (en, am, ti, om, so)
        </p>
      </div>

      <div
        className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Click to upload or drag & drop</p>
        <p className="text-xs text-muted-foreground mt-1">.csv, .xlsx, .xls supported</p>
        {fileName && (
          <div className="flex items-center justify-center gap-1.5 mt-3 text-sm text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" /> {fileName}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex gap-4 p-3 rounded-md bg-muted/50">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Total:</span>
            <span className="text-sm font-medium">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">{stats.valid} valid</span>
          </div>
          {stats.invalid > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-sm font-medium text-destructive">{stats.invalid} invalid</span>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Preview (first 5 rows)</Label>
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
          {recipients.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              ...and {recipients.length - 5} more recipients
            </p>
          )}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-medium text-destructive mb-1">Validation Errors</p>
          <ul className="text-xs text-destructive space-y-0.5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
