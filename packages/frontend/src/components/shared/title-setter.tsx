"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "CreatorPulse AI — Research Intelligence for YouTube Creators",
  "/generate": "Title Analyzer | CreatorPulse AI",
  "/battle": "Title Battle | CreatorPulse AI",
  "/hook": "Hook Lab | CreatorPulse AI",
  "/validate": "Idea Validator | CreatorPulse AI",
  "/readiness": "Launch Command | CreatorPulse AI",
  "/comments": "Audience Compass | CreatorPulse AI",
  "/content-gap": "Opportunity Map | CreatorPulse AI",
  "/repurpose": "Content Atomizer | CreatorPulse AI",
  "/dashboard": "Command Center | CreatorPulse AI",
  "/login": "Sign In | CreatorPulse AI",
  "/signup": "Get Started | CreatorPulse AI",
};

export default function TitleSetter() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = titles[pathname] ?? "CreatorPulse AI";
  }, [pathname]);

  return null;
}
