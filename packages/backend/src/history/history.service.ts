import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { historyLimitForTier } from "../common/config/limits";

export interface HistoryItem {
  id: string;
  type: string;
  title: string;
  summary: string;
  score?: number;
  date: string;
  link: string;
}

export interface HistoryDetail extends HistoryItem {
  input: string;
  analysis: unknown;
  result: unknown;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getHistory(
    userId: string,
    tier: string,
    cursor?: string,
    limit = 15,
    type = "all",
  ): Promise<{ items: HistoryItem[]; nextCursor: string | null }> {
    const maxItems = Math.min(limit, historyLimitForTier(tier));
    const fetchLimit = maxItems + 1;

    const items: HistoryItem[] = [];
    const types = type === "all"
      ? ["generation", "battle", "hook", "comment", "readiness", "gap", "validation", "repurpose"]
      : [type];

    for (const t of types) {
      if (items.length >= fetchLimit) break;
      const fetched = await this.fetchByType(userId, t, cursor, fetchLimit - items.length);
      items.push(...fetched);
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const hasMore = items.length > maxItems;
    const result = items.slice(0, maxItems);

    return {
      items: result,
      nextCursor: hasMore ? result[result.length - 1]?.id || null : null,
    };
  }

  async getItem(userId: string, type: string, id: string): Promise<HistoryDetail> {
    const model = this.modelFor(type);
    if (!UUID_RE.test(id)) throw new NotFoundException("History item not found");
    const row = await model.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException("History item not found");
    return this.mapDetail(type, row);
  }

  async deleteItem(userId: string, type: string, id: string): Promise<{ deleted: boolean }> {
    const model = this.modelFor(type);
    if (!UUID_RE.test(id)) throw new NotFoundException("History item not found");
    const { count } = await model.deleteMany({ where: { id, userId } });
    if (count === 0) throw new NotFoundException("History item not found");
    return { deleted: true };
  }

  private modelOrNull(type: string): any | null {
    switch (type) {
      case "generation": return this.prisma.generation;
      case "battle": return this.prisma.battle;
      case "hook": return this.prisma.hook;
      case "comment": return this.prisma.commentAnalysis;
      case "readiness": return this.prisma.readinessScore;
      case "gap": return this.prisma.contentGap;
      case "validation": return this.prisma.validation;
      case "repurpose": return this.prisma.repurpose;
      default: return null;
    }
  }

  private modelFor(type: string): any {
    const model = this.modelOrNull(type);
    if (!model) throw new NotFoundException("Unknown history type");
    return model;
  }

  private async fetchByType(
    userId: string,
    type: string,
    cursor?: string,
    limit = 15,
  ): Promise<HistoryItem[]> {
    const model = this.modelOrNull(type);
    if (!model) return [];

    const cursorFilter = cursor
      ? { id: { not: cursor }, createdAt: { lte: new Date() } }
      : {};

    const rows = await model.findMany({
      where: { userId, ...cursorFilter },
      orderBy: { createdAt: "desc" as const },
      take: limit,
    });

    return rows.map((r: any) => this.toItem(type, r));
  }

  private toItem(type: string, r: any): HistoryItem {
    switch (type) {
      case "generation":
        return {
          id: r.id,
          type: "generation",
          title: r.inputTitle || "Untitled",
          summary: `Score: ${r.analysis?.viralityScore ?? "—"} — ${r.generatedTitles?.length ?? 0} alternatives`,
          score: r.analysis?.viralityScore,
          date: r.createdAt.toISOString(),
          link: `/generate?id=${r.id}`,
        };
      case "battle":
        return {
          id: r.id,
          type: "battle",
          title: `${r.titleA} vs ${r.titleB}`,
          summary: `Winner: ${r.winnerTitle} (${r.winnerScore} vs ${r.loserScore})`,
          score: r.winnerScore,
          date: r.createdAt.toISOString(),
          link: `/battle?id=${r.id}`,
        };
      case "hook":
        return {
          id: r.id,
          type: "hook",
          title: r.inputTitle || "Untitled",
          summary: "Hook analysis",
          date: r.createdAt.toISOString(),
          link: `/hook?id=${r.id}`,
        };
      case "comment":
        return {
          id: r.id,
          type: "comment",
          title: "Comment Analysis",
          summary: r.inputComments?.slice(0, 80) + (r.inputComments?.length > 80 ? "..." : "") || "Comment analysis",
          date: r.createdAt.toISOString(),
          link: `/comments?id=${r.id}`,
        };
      case "readiness":
        return {
          id: r.id,
          type: "readiness",
          title: "Readiness Check",
          summary: `Score: ${r.analysis?.overallScore ?? "—"}`,
          score: r.analysis?.overallScore,
          date: r.createdAt.toISOString(),
          link: `/readiness?id=${r.id}`,
        };
      case "gap":
        return {
          id: r.id,
          type: "gap",
          title: r.inputTopics || r.inputUrls || "Content Gap",
          summary: "Gap analysis",
          date: r.createdAt.toISOString(),
          link: `/content-gap?id=${r.id}`,
        };
      case "validation":
        return {
          id: r.id,
          type: "validation",
          title: r.idea || "Untitled",
          summary: `Score: ${r.analysis?.overallScore ?? "—"}`,
          score: r.analysis?.overallScore,
          date: r.createdAt.toISOString(),
          link: `/validate?id=${r.id}`,
        };
      case "repurpose":
        return {
          id: r.id,
          type: "repurpose",
          title: r.title || "Untitled",
          summary: `${r.analysis?.posts?.length ?? 0} platform posts`,
          date: r.createdAt.toISOString(),
          link: `/repurpose?id=${r.id}`,
        };
      default:
        return {
          id: r.id,
          type,
          title: "Untitled",
          summary: "",
          date: r.createdAt?.toISOString?.() || new Date().toISOString(),
          link: "/history",
        };
    }
  }

  private inputFor(type: string, r: any): string {
    switch (type) {
      case "generation":
      case "hook":
        return [r.inputTitle, r.niche].filter(Boolean).join(" — ");
      case "battle":
        return `${r.titleA}\n${r.titleB}`;
      case "comment":
        return r.inputComments || "";
      case "readiness":
        return typeof r.input === "string" ? r.input : JSON.stringify(r.input ?? {}, null, 2);
      case "gap":
        return [r.inputUrls, r.inputTopics].filter(Boolean).join("\n");
      case "validation":
        return [r.idea, r.niche].filter(Boolean).join(" — ");
      case "repurpose":
        return [r.title, r.niche].filter(Boolean).join(" — ");
      default:
        return "";
    }
  }

  private resultFor(type: string, r: any): unknown {
    switch (type) {
      case "generation":
        return { titles: r.generatedTitles ?? [], description: r.generatedDescription ?? null };
      case "battle":
        return { winner: r.winnerTitle, winnerScore: r.winnerScore, loserScore: r.loserScore };
      default:
        return null;
    }
  }

  private mapDetail(type: string, r: any): HistoryDetail {
    return {
      ...this.toItem(type, r),
      input: this.inputFor(type, r),
      analysis: r.analysis ?? null,
      result: this.resultFor(type, r),
    };
  }
}
