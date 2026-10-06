export const ACTIVITY_LABELS: Record<string, string> = {
  generation: "Title Analysis",
  battle: "Title Battle",
  hook: "Hook Lab",
  comment: "Audience Compass",
  readiness: "Launch Command",
  gap: "Opportunity Map",
  validation: "Idea Validator",
  repurpose: "Content Atomizer",
};

export function activityLabel(type: string): string {
  return ACTIVITY_LABELS[type] || type;
}
