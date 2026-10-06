"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3, Swords, Lightbulb, MessageSquare, Rocket, Map,
  ClipboardCheck, Shuffle, Loader2, Clock, Sparkles, Eye, Trash2,
} from "lucide-react";
import { apiFetch, apiErrorMessage } from "@/lib/api-client";
import { activityLabel } from "@/lib/activity-labels";
import { HistoryItem, HistoryDetail } from "@/lib/history-types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PreviewModal } from "@/components/history/preview-modal";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "generation", label: "Analysis" },
  { key: "battle", label: "Battles" },
  { key: "hook", label: "Hooks" },
  { key: "comment", label: "Comments" },
  { key: "readiness", label: "Readiness" },
  { key: "gap", label: "Gaps" },
  { key: "validation", label: "Validations" },
  { key: "repurpose", label: "Repurposes" },
] as const;

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  generation: BarChart3,
  battle: Swords,
  hook: Lightbulb,
  comment: MessageSquare,
  readiness: Rocket,
  gap: Map,
  validation: ClipboardCheck,
  repurpose: Shuffle,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [tier, setTier] = useState("free");

  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);
  const [previewDetail, setPreviewDetail] = useState<HistoryDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [confirmItem, setConfirmItem] = useState<HistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchHistory = useCallback(async (filter: string, cursor?: string) => {
    const params = new URLSearchParams({ type: filter, limit: "15" });
    if (cursor) params.set("cursor", cursor);

    const res = await apiFetch(`/api/history?${params}`);
    if (!res.ok) throw new Error("Failed to load history");
    return res.json();
  }, []);

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    setError("");
    try {
      const [historyData, profileRes] = await Promise.all([
        fetchHistory(activeFilter),
        apiFetch("/api/auth/me"),
      ]);
      setItems(historyData.items);
      setNextCursor(historyData.nextCursor);

      if (profileRes.ok) {
        const p = await profileRes.json();
        setTier(p.tier || "free");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter(key: string) {
    setActiveFilter(key);
    setLoading(true);
    setError("");
    try {
      const data = await fetchHistory(key);
      setItems(data.items);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await fetchHistory(activeFilter, nextCursor);
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }

  async function openPreview(item: HistoryItem) {
    setPreviewItem(item);
    setPreviewDetail(null);
    setPreviewError("");
    setPreviewLoading(true);
    try {
      const res = await apiFetch(`/api/history/${item.type}/${item.id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(apiErrorMessage(data, "Failed to load details"));
      }
      setPreviewDetail(await res.json());
    } catch (err: any) {
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewItem(null);
    setPreviewDetail(null);
    setPreviewError("");
  }

  function openConfirm(item: HistoryItem) {
    setConfirmItem(item);
    setDeleteError("");
  }

  function closeConfirm() {
    if (deleting) return;
    setConfirmItem(null);
    setDeleteError("");
  }

  async function handleDelete() {
    if (!confirmItem) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await apiFetch(`/api/history/${confirmItem.type}/${confirmItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(apiErrorMessage(data, "Failed to delete item"));
      }
      const deletedId = confirmItem.id;
      setItems((prev) => prev.filter((i) => i.id !== deletedId));
      setConfirmItem(null);
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every analysis, battle, and insight you&apos;ve run.
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilter(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tier === "free" && !loading && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] to-primary/[0.02] p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Pro users get unlimited history</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Upgrade to unlock pagination, filters, and your complete analysis timeline.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="btn btn-primary mt-3 px-4 py-2 text-xs">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {loading && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-16 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No activity yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run your first analysis to see it here.
          </p>
          <Link href="/generate" className="btn btn-primary mt-4 px-5 py-2 text-sm">
            Start Analyzing
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-4 space-y-2">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type] || BarChart3;
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => openPreview(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openPreview(item);
                  }
                }}
                className="group flex items-start gap-3 rounded-xl border border-border p-3.5 transition-colors hover:border-primary/20 hover:bg-secondary/40 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{activityLabel(item.type)}</span>
                    <span className="text-xs text-muted-foreground/50">&middot;</span>
                    <span className="text-xs text-muted-foreground truncate">{item.summary}</span>
                  </div>
                  {item.score !== undefined && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(item.score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium text-primary">{item.score}</span>
                    </div>
                  )}
                </div>
                <div
                  className="flex shrink-0 items-center gap-1 self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label="View details"
                    title="View details"
                    onClick={() => openPreview(item)}
                    className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete from history"
                    title="Delete from history"
                    onClick={() => openConfirm(item)}
                    className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {nextCursor && tier === "pro" && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn btn-secondary px-6 py-2.5 text-sm"
          >
            {loadingMore ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
            ) : null}
            Load More
          </button>
        </div>
      )}

      <PreviewModal
        open={!!previewItem}
        onClose={closePreview}
        item={previewItem}
        detail={previewDetail}
        loading={previewLoading}
        error={previewError}
        icon={previewItem ? TYPE_ICONS[previewItem.type] || BarChart3 : BarChart3}
      />

      <ConfirmDialog
        open={!!confirmItem}
        title="Delete this item?"
        description={
          confirmItem
            ? `"${confirmItem.title}" will be permanently removed from your history. This can't be undone.`
            : undefined
        }
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </main>
  );
}
