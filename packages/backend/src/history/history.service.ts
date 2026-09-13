import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface HistoryItem {
  id: string;
  type: string;
  title: string;
  summary: string;
  score?: number;
  date: string;
  link: string;
}

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
    const maxItems = tier === "pro" ? Math.min(limit, 50) : 5;
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

  private async fetchByType(
    userId: string,
    type: string,
    cursor?: string,
    limit = 15,
  ): Promise<HistoryItem[]> {
    const cursorFilter = cursor
      ? { id: { not: cursor }, createdAt: { lte: new Date() } }
      : {};

    const baseQuery: any = {
      where: { userId, ...cursorFilter },
      orderBy: { createdAt: "desc" as const },
      take: limit,
    };

    switch (type) {
      case "generation": {
        const rows = await this.prisma.generation.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "generation",
          title: r.inputTitle || "Untitled",
          summary: `Score: ${r.analysis?.viralityScore ?? "—"} — ${r.generatedTitles?.length ?? 0} alternatives`,
          score: r.analysis?.viralityScore,
          date: r.createdAt.toISOString(),
          link: `/generate?id=${r.id}`,
        }));
      }
      case "battle": {
        const rows = await this.prisma.battle.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "battle",
          title: `${r.titleA} vs ${r.titleB}`,
          summary: `Winner: ${r.winnerTitle} (${r.winnerScore} vs ${r.loserScore})`,
          score: r.winnerScore,
          date: r.createdAt.toISOString(),
          link: `/battle?id=${r.id}`,
        }));
      }
      case "hook": {
        const rows = await this.prisma.hook.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "hook",
          title: r.inputTitle || "Untitled",
          summary: "Hook analysis",
          date: r.createdAt.toISOString(),
          link: `/hook?id=${r.id}`,
        }));
      }
      case "comment": {
        const rows = await this.prisma.commentAnalysis.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "comment",
          title: "Comment Analysis",
          summary: r.inputComments?.slice(0, 80) + (r.inputComments?.length > 80 ? "..." : "") || "Comment analysis",
          date: r.createdAt.toISOString(),
          link: `/comments?id=${r.id}`,
        }));
      }
      case "readiness": {
        const rows = await this.prisma.readinessScore.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "readiness",
          title: "Readiness Check",
          summary: `Score: ${r.analysis?.overallScore ?? "—"}`,
          score: r.analysis?.overallScore,
          date: r.createdAt.toISOString(),
          link: `/readiness?id=${r.id}`,
        }));
      }
      case "gap": {
        const rows = await this.prisma.contentGap.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "gap",
          title: r.inputTopics || r.inputUrls || "Content Gap",
          summary: "Gap analysis",
          date: r.createdAt.toISOString(),
          link: `/content-gap?id=${r.id}`,
        }));
      }
      case "validation": {
        const rows = await this.prisma.validation.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "validation",
          title: r.idea || "Untitled",
          summary: `Score: ${r.analysis?.overallScore ?? "—"}`,
          score: r.analysis?.overallScore,
          date: r.createdAt.toISOString(),
          link: `/validate?id=${r.id}`,
        }));
      }
      case "repurpose": {
        const rows = await this.prisma.repurpose.findMany(baseQuery);
        return rows.map((r: any) => ({
          id: r.id,
          type: "repurpose",
          title: r.title || "Untitled",
          summary: `${r.analysis?.posts?.length ?? 0} platform posts`,
          date: r.createdAt.toISOString(),
          link: `/repurpose?id=${r.id}`,
        }));
      }
      default:
        return [];
    }
  }
}
