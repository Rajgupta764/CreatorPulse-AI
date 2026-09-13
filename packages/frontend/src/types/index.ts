export interface AnalyzeResponse {
  analysis: {
    viralityScore: number;
    computedViralityScore: number;
    patterns: string[];
    powerWords: string[];
    characterCount: number;
    readabilityScore: number;
    emotionalTriggers: string[];
    hookType: string;
    psychology: {
      curiosity: number;
      authority: number;
      novelty: number;
      emotion: number;
      conflict: number;
      specificity: number;
      urgency: number;
    };
    targetAudience: string;
    ctrExplanation: string;
    whyItWorks: string;
    predictedStrengths?: string[];
    userContext?: UserContext;
    nextAction: string;
  };
  titles: GeneratedTitle[];
  description: GeneratedDescription;
}

export interface UserContext {
  personalAverageVirality: number | null;
  personalBestVirality: number | null;
  mostUsedPattern: string | null;
  bestPerformingPattern: string | null;
  totalAnalyses: number;
}

export interface GeneratedTitle {
  title: string;
  pattern: string;
  whyWorks: string;
  explanation?: string;
}

export interface GeneratedDescription {
  description: string;
  chapters: { time: string; label: string }[];
  hashtags: string[];
}

export interface BattleResponse {
  winner: { title: string; score: number; reason: string; strengths: string[]; weaknesses: string[]; scoreExplanation: string };
  loser: { title: string; score: number; reason: string; strengths: string[]; weaknesses: string[]; scoreExplanation: string };
  summary: string;
  hybridTitle: { title: string; explanation: string };
}

export interface HookResponse {
  hooks: { style: string; hook: string; tone: string; deliveryTip: string; estimatedDuration: string }[];
}

export interface ValidateResponse {
  competition: { score: number; explanation: string };
  demand: { score: number; explanation: string };
  virality: { score: number; explanation: string };
  difficulty: { score: number; explanation: string };
  contentGap: { score: number; explanation: string };
  opportunity: { score: number; explanation: string };
  overallScore: number;
  recommendation: string;
  evolution?: { evolvedIdea: string; estimatedNewScore: number; explanation: string };
  [key: string]: any;
}

export interface ReadinessResponse {
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  hookScore: number;
  thumbnailScore: number;
  weakestArea: string;
  strongestArea: string;
  recommendation: string;
  finalAdvice: string;
  goNoGo: "go" | "no-go";
  improvementChecklist: string[];
}

export interface CommentsResponse {
  summary: string;
  requestedTopics: { topic: string; frequency: string }[];
  questions: { question: string; context: string }[];
  confusion: string[];
  painPoints: string[];
  videoIdeas: { idea: string; reason: string; subscriberPotentialScore: number }[];
  sentiment: string;
  audienceProfile: string;
  contentGapAlerts: string[];
}

export interface ContentGapResponse {
  everyoneCovers: string[];
  nobodyCovers: string[];
  opportunities: { opportunity: string; rationale: string; opportunityScore: number; difficulty: string; timeline: string; firstMoverAdvantage: boolean }[];
  contentGap: string;
  recommendation: string;
}

export interface RepurposeResponse {
  originalTitle: string;
  posts: { platform: string; icon: string; title: string; caption: string; hashtags: string[]; tips: string[]; viralPotentialIndex: number; bestPostingTime: string }[];
}

export interface DashboardData {
  totalGenerations: number;
  totalBattles: number;
  totalCommentAnalyses: number;
  averageViralityScore: number;
  bestViralityScore: number;
  streak: number;
  lastActiveDate: string | null;
  scoreTrend: { direction: "up" | "down" | "flat"; percentChange: number; slope: number };
  weeklyAverages: { week: string; avgScore: number }[];
  mostUsedPattern: string;
  bestPerformingPattern: string;
  patternStats: { pattern: string; count: number; avgScore: number }[];
  weakestDimension: { name: string; avgScore: number };
  strongestDimension: { name: string; avgScore: number };
  crossFeatureInsights: string[];
  recentActivity: { type: string; title: string; score?: number; date: string; link: string }[];
  quickActions: { label: string; description: string; link: string; priority: string }[];
}

export interface UsageResponse {
  isAuthenticated: boolean;
  used: number;
  limit: number;
  remaining: number;
  hasAnalyzedToday: boolean;
}
