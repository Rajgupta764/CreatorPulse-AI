"use client";

import { Loader2, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { activityLabel } from "@/lib/activity-labels";
import { HistoryDetail, HistoryItem } from "@/lib/history-types";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  item: HistoryItem | null;
  detail: HistoryDetail | null;
  loading: boolean;
  error: string;
  icon: React.ComponentType<{ className?: string }>;
}

function humanizeKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ValueBlock({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <p className="text-sm text-muted-foreground">—</p>;
  }
  if (typeof value === "string") {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{value}</p>;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <p className="text-sm font-medium">{String(value)}</p>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-muted-foreground">None</p>;
    }
    return (
      <ol className="space-y-2">
        {value.map((entry, i) => (
          <li
            key={i}
            className="rounded-lg border border-border bg-secondary/40 p-3 text-sm"
          >
            <ValueBlock value={entry} />
          </li>
        ))}
      </ol>
    );
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground">None</p>;
    }
    return (
      <div className="space-y-3">
        {entries.map(([k, v]) => (
          <div key={k}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {humanizeKey(k)}
            </p>
            <div className="mt-1">
              <ValueBlock value={v} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm">{String(value)}</p>;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      {children}
    </section>
  );
}

export function PreviewModal({
  open,
  onClose,
  item,
  detail,
  loading,
  error,
  icon: Icon,
}: PreviewModalProps) {
  const score = detail?.score ?? item?.score;

  return (
    <Modal open={open} onClose={onClose} labelledBy="preview-modal-title">
      <header className="flex items-start gap-3 border-b border-border p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {item ? activityLabel(item.type) : ""}
          </p>
          <h2 id="preview-modal-title" className="truncate text-base font-semibold">
            {item?.title || "Details"}
          </h2>
          {item && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(item.date).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="overflow-y-auto p-5">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && detail && (
          <div className="space-y-5">
            {score !== undefined && score !== null && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Score
                  </span>
                  <span className="text-sm font-semibold text-primary">{score}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(Number(score), 100)}%` }}
                  />
                </div>
              </div>
            )}

            {detail.input && (
              <Section label="Input">
                <div className="whitespace-pre-wrap rounded-lg border border-border bg-secondary/40 p-3.5 text-sm leading-relaxed">
                  {detail.input}
                </div>
              </Section>
            )}

            {detail.result !== null && detail.result !== undefined && (
              <Section label="Result">
                <div className="rounded-lg border border-border bg-secondary/40 p-3.5">
                  <ValueBlock value={detail.result} />
                </div>
              </Section>
            )}

            {detail.analysis !== null && detail.analysis !== undefined && (
              <Section label="Analysis">
                <div className="rounded-lg border border-border bg-secondary/40 p-3.5">
                  <ValueBlock value={detail.analysis} />
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
