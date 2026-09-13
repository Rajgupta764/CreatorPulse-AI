import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface TrendData {
  direction: "up" | "down" | "flat";
  percentChange: number;
  slope: number;
}

export interface ActivityItem {
  type: "generation" | "battle" | "comment";
  title: string;
  score?: number;
  date: string;
  link: string;
}

export interface QuickAction {
  label: string;
  description: string;
  link: string;
  priority: "high" | "medium" | "low";
}

export interface PatternStat {
  pattern: string;
  count: number;
  avgScore: number;
}

export interface WeeklyAverage {
  week: string;
  avgScore: number;
}

export interface DimensionStat {
  name: string;
  avgScore: number;
}

export interface DashboardData {
  totalGenerations: number;
  totalBattles: number;
  totalCommentAnalyses: number;
  averageViralityScore: number;
  bestViralityScore: number;
  streak: number;
  lastActiveDate: string | null;
  scoreTrend: TrendData;
  weeklyAverages: WeeklyAverage[];
  mostUsedPattern: string;
  bestPerformingPattern: string;
  patternStats: PatternStat[];
  weakestDimension: DimensionStat;
  strongestDimension: DimensionStat;
  crossFeatureInsights: string[];
  recentActivity: ActivityItem[];
  quickActions: QuickAction[];
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getData(userId: string): Promise<DashboardData> {
    const [generations, battles, commentAnalyses] = await Promise.all([
      this.prisma.generation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.battle.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      this.prisma.commentAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    if (generations.length === 0) return this.emptyData();

    let totalScore = 0;
    let bestScore = 0;
    const patternScores: Record<string, { total: number; count: number }> = {};
    const dimensionScores: Record<string, { total: number; count: number }> = {};
    const weeklyScores: Record<string, { total: number; count: number }> = {};
    const recentActivity: ActivityItem[] = [];

    for (const gen of generations) {
      const a = gen.analysis as any;
      const score = a.viralityScore ?? 0;
      totalScore += score;
      if (score > bestScore) bestScore = score;

      const patterns: string[] = a.patterns ?? [];
      for (const p of patterns) {
        if (!patternScores[p]) patternScores[p] = { total: 0, count: 0 };
        patternScores[p].total += score;
        patternScores[p].count += 1;
      }

      const psych = a.psychology;
      if (psych) {
        for (const [dim, val] of Object.entries(psych)) {
          if (typeof val === "number") {
            if (!dimensionScores[dim]) dimensionScores[dim] = { total: 0, count: 0 };
            dimensionScores[dim].total += val;
            dimensionScores[dim].count += 1;
          }
        }
      }

      const weekStart = this.getWeekStart(gen.createdAt);
      if (!weeklyScores[weekStart]) weeklyScores[weekStart] = { total: 0, count: 0 };
      weeklyScores[weekStart].total += score;
      weeklyScores[weekStart].count += 1;

      if (recentActivity.length < 10) {
        recentActivity.push({
          type: "generation",
          title: gen.inputTitle,
          score,
          date: gen.createdAt.toISOString(),
          link: "/generate",
        });
      }
    }

    for (const b of battles) {
      if (recentActivity.length >= 10) break;
      recentActivity.push({
        type: "battle",
        title: b.winnerTitle,
        score: b.winnerScore,
        date: b.createdAt.toISOString(),
        link: "/battle",
      });
    }

    for (const c of commentAnalyses) {
      if (recentActivity.length >= 10) break;
      const a = c.analysis as any;
      recentActivity.push({
        type: "comment",
        title: a?.summary?.slice(0, 60) ?? "Comment analysis",
        date: c.createdAt.toISOString(),
        link: "/comments",
      });
    }

    recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentActivity.splice(10);

    const avgScore = Math.round(totalScore / generations.length);

    const patternStats: PatternStat[] = Object.entries(patternScores)
      .map(([pattern, stats]) => ({ pattern, count: stats.count, avgScore: Math.round(stats.total / stats.count) }))
      .sort((a, b) => b.count - a.count);

    const mostUsedPattern = patternStats[0]?.pattern ?? "N/A";
    const bestPerformingPattern = patternStats.filter((p) => p.count >= 2).sort((a, b) => b.avgScore - a.avgScore)[0]?.pattern ?? mostUsedPattern;

    const dimEntries = Object.entries(dimensionScores)
      .map(([name, stats]) => ({ name, avgScore: Math.round(stats.total / stats.count) }))
      .sort((a, b) => a.avgScore - b.avgScore);

    const weakestDimension: DimensionStat = dimEntries[0] ?? { name: "N/A", avgScore: 0 };
    const strongestDimension: DimensionStat = dimEntries[dimEntries.length - 1] ?? { name: "N/A", avgScore: 0 };

    const weeklyEntries: WeeklyAverage[] = Object.entries(weeklyScores)
      .map(([week, stats]) => ({ week, avgScore: Math.round(stats.total / stats.count) }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);

    const scoreTrend = this.computeTrend(weeklyEntries);
    const streak = await this.computeStreak(userId);
    const crossFeatureInsights = this.generateInsights(mostUsedPattern, bestPerformingPattern, weakestDimension, strongestDimension, patternStats, generations.length, battles.length, commentAnalyses.length);
    const quickActions = this.generateQuickActions(generations.length, streak, weakestDimension, battles.length, commentAnalyses.length);

    return {
      totalGenerations: generations.length,
      totalBattles: battles.length,
      totalCommentAnalyses: commentAnalyses.length,
      averageViralityScore: avgScore,
      bestViralityScore: bestScore,
      streak,
      lastActiveDate: generations[0]?.createdAt.toISOString() ?? null,
      scoreTrend,
      weeklyAverages: weeklyEntries,
      mostUsedPattern,
      bestPerformingPattern,
      patternStats,
      weakestDimension,
      strongestDimension,
      crossFeatureInsights,
      recentActivity,
      quickActions,
    };
  }

  private emptyData(): DashboardData {
    return {
      totalGenerations: 0, totalBattles: 0, totalCommentAnalyses: 0,
      averageViralityScore: 0, bestViralityScore: 0, streak: 0,
      lastActiveDate: null,
      scoreTrend: { direction: "flat", percentChange: 0, slope: 0 },
      weeklyAverages: [],
      mostUsedPattern: "N/A", bestPerformingPattern: "N/A",
      patternStats: [],
      weakestDimension: { name: "N/A", avgScore: 0 },
      strongestDimension: { name: "N/A", avgScore: 0 },
      crossFeatureInsights: ["Start by analyzing your first title to unlock personalized insights."],
      recentActivity: [],
      quickActions: [{ label: "Analyze Your First Title", description: "See exactly why a title works", link: "/generate", priority: "high" }],
    };
  }

  private getWeekStart(date: Date): string {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split("T")[0];
  }

  private computeTrend(records: WeeklyAverage[]): TrendData {
    if (records.length < 2) return { direction: "flat", percentChange: 0, slope: 0 };
    const n = records.length;
    const scores = records.map((r) => r.avgScore);
    const meanX = (n - 1) / 2;
    const meanY = scores.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - meanX) * (scores[i] - meanY);
      den += (i - meanX) * (i - meanX);
    }
    const slope = den === 0 ? 0 : num / den;
    const first = records[0].avgScore;
    const last = records[records.length - 1].avgScore;
    const percentChange = first === 0 ? 0 : Math.round(((last - first) / first) * 100);
    const direction: "up" | "down" | "flat" = slope > 1 ? "up" : slope < -1 ? "down" : "flat";
    return { direction, percentChange, slope: Math.round(slope * 100) / 100 };
  }

  private async computeStreak(userId: string): Promise<number> {
    const records = await this.prisma.generation.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    if (records.length === 0) return 0;
    const activeDates = new Set(records.map((r) => r.createdAt.toISOString().split("T")[0]));
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (!activeDates.has(today) && !activeDates.has(yesterday)) return 0;
    let streak = 0;
    const check = new Date();
    while (true) {
      const ds = check.toISOString().split("T")[0];
      if (activeDates.has(ds)) { streak++; check.setDate(check.getDate() - 1); }
      else break;
    }
    return streak;
  }

  private generateInsights(
    mostUsedPattern: string, bestPerformingPattern: string,
    weakest: DimensionStat, strongest: DimensionStat,
    patternStats: PatternStat[], totalGenerations: number,
    totalBattles: number, totalCommentAnalyses: number
  ): string[] {
    const insights: string[] = [];
    if (totalGenerations >= 3) {
      if (mostUsedPattern !== "N/A") insights.push(`Your most used pattern is "${mostUsedPattern}".`);
      if (bestPerformingPattern !== mostUsedPattern && bestPerformingPattern !== "N/A") insights.push(`Your best performing pattern is "${bestPerformingPattern}".`);
      if (weakest.name !== "N/A") insights.push(`Your weakest dimension is "${weakest.name}" (avg ${weakest.avgScore}/100).`);
      if (strongest.name !== "N/A") insights.push(`Your strongest dimension is "${strongest.name}" (avg ${strongest.avgScore}/100).`);
    }
    if (totalBattles >= 3) insights.push(`You've battle-tested ${totalBattles} titles.`);
    if (totalCommentAnalyses >= 1) insights.push(`You've analyzed comments ${totalCommentAnalyses} time(s).`);
    if (totalGenerations >= 3 && totalCommentAnalyses >= 1) insights.push("Use Comment Intelligence to find audience topics, then analyze them in the Title Analyzer.");
    if (insights.length === 0) insights.push("Analyze 3+ titles to unlock personalized insights.");
    return insights;
  }

  private generateQuickActions(
    totalGenerations: number, streak: number,
    weakest: DimensionStat, totalBattles: number,
    totalCommentAnalyses: number
  ): QuickAction[] {
    const actions: QuickAction[] = [
      { label: "Analyze a Title", description: "Check a title's viral potential", link: "/generate", priority: "high" },
    ];
    if (totalBattles < 3) actions.push({ label: "Battle Two Titles", description: "Compare two title options", link: "/battle", priority: totalBattles === 0 ? "high" : "medium" });
    if (totalCommentAnalyses === 0) actions.push({ label: "Analyze Your Comments", description: "Discover what viewers want next", link: "/comments", priority: totalGenerations >= 3 ? "high" : "medium" });
    if (streak > 0 && streak % 5 === 0) actions.push({ label: `${streak}-Day Streak!`, description: "You're on fire!", link: "/dashboard", priority: "high" });
    return actions;
  }
}
