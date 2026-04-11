import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createAudience, updateAudience, fetchAudienceDetail } from "@/lib/api/audiences";
import type { AudienceCreatePayload, ApiAudienceDetail } from "@/lib/api/audiences";

interface AudienceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audienceId?: number | null; // null/undefined = create mode
  onSuccess: () => void;
}

export default function AudienceFormDialog({
  open,
  onOpenChange,
  audienceId,
  onSuccess,
}: AudienceFormDialogProps) {
  const isEdit = !!audienceId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [campaign, setCampaign] = useState("");
  const [databaseTable, setDatabaseTable] = useState("");
  const [idField, setIdField] = useState("");
  const [filterCondition, setFilterCondition] = useState("");

  // Pre-fill for edit
  useEffect(() => {
    if (open && audienceId) {
      setFetching(true);
      fetchAudienceDetail(audienceId)
        .then((d: ApiAudienceDetail) => {
          setCampaign(String(d.campaign));
          setDatabaseTable(d.database_table || "");
          setIdField(d.id_field || "");
          setFilterCondition(d.filter_condition || "");
        })
        .catch(() => toast.error("Failed to load audience data"))
        .finally(() => setFetching(false));
    } else if (open) {
      // Reset for create
      setCampaign("");
      setDatabaseTable("");
      setIdField("");
      setFilterCondition("");
    }
  }, [open, audienceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign || !databaseTable || !idField) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload: AudienceCreatePayload = {
      campaign: Number(campaign),
      database_table: databaseTable,
      id_field: idField,
      ...(filterCondition ? { filter_condition: filterCondition } : {}),
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateAudience(audienceId!, payload);
        toast.success("Audience updated successfully");
      } else {
        await createAudience(payload);
        toast.success("Audience created successfully");
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Audience" : "Create Audience"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the audience configuration below."
              : "Fill in the details to create a new audience."}
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign ID *</Label>
              <Input
                id="campaign"
                type="number"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="e.g. 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="database_table">Database Table *</Label>
              <Input
                id="database_table"
                value={databaseTable}
                onChange={(e) => setDatabaseTable(e.target.value)}
                placeholder="e.g. recipients"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_field">ID Field *</Label>
              <Input
                id="id_field"
                value={idField}
                onChange={(e) => setIdField(e.target.value)}
                placeholder="e.g. msisdn"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter_condition">Filter Condition</Label>
              <Textarea
                id="filter_condition"
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                placeholder="e.g. status = 'active'"
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
