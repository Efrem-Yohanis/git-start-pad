import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LANGUAGE_LABELS } from "@/types/campaign";
import type { Language } from "@/types/campaign";
import { Plus, MessageSquareText, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchMessageContents, fetchMessageContentSummary, deleteMessageContentById } from "@/lib/api/messages";
import type { ApiMessageContentListItem, MessageContentSummary } from "@/lib/api/messages";
import { toast } from "sonner";

export default function MessageContentList() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ApiMessageContentListItem[]>([]);
  const [summary, setSummary] = useState<MessageContentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [deleteTarget, setDeleteTarget] = useState<ApiMessageContentListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadData(); }, [page]);

  async function loadData() {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetchMessageContents(page, pageSize),
        page === 1 ? fetchMessageContentSummary() : Promise.resolve(null),
      ]);
      setMessages(listRes.results);
      setTotalCount(listRes.count);
      if (summaryRes) setSummary(summaryRes);
    } catch (e) {
      console.error("Failed to load message contents", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMessageContentById(deleteTarget.id);
      toast.success("Message content deleted");
      setDeleteTarget(null);
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Message Content</h1>
          <p className="text-sm text-muted-foreground mt-1">Campaign message templates and translations</p>
        </div>
        <Link to="/messages/create">
          <Button className="gap-2 shadow-soft">
            <Plus className="h-4 w-4" /> Create New
          </Button>
        </Link>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Messages</p>
            <p className="text-2xl font-semibold">{summary.total_message_contents}</p>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">By Default Language</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(summary.by_default_language).map(([lang, count]) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {LANGUAGE_LABELS[lang as Language] ?? lang}: {count}
                </Badge>
              ))}
            </div>
          </Card>
          <Card className="p-4 shadow-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completeness</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(summary.content_completeness).map(([status, count]) => (
                <Badge key={status} variant="secondary" className="text-xs capitalize">{status}: {count}</Badge>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Default</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Languages</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Preview</th>
                <th className="text-right px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>
                  ))}
                </tr>
              ))}
              {!loading && messages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        <MessageSquareText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No message content found.</p>
                      <Link to="/messages/create">
                        <Button variant="outline" size="sm" className="mt-2 gap-1.5">
                          <Plus className="h-3.5 w-3.5" /> Create your first message
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && messages.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">
                    {m.campaign_info?.name ?? `Campaign #${m.campaign}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className="text-xs">{LANGUAGE_LABELS[m.default_language as Language] ?? m.default_language}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {m.languages_available.map((l) => (
                        <Badge key={l} variant="secondary" className="text-xs">{LANGUAGE_LABELS[l as Language] ?? l}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground truncate max-w-[200px] text-xs">
                    {m.preview && typeof m.preview === "object" ? m.preview.preview?.slice(0, 60) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/messages/${m.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/messages/${m.id}/edit`)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(m)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete message content for "{deleteTarget?.campaign_info?.name ?? `Campaign #${deleteTarget?.campaign}`}"? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
