import {
  computeRealMetrics,
  detectPowerWords,
  detectPatterns,
  computeReadability,
  computeViralityScore,
  runPreAnalysis,
  getWeakestDimension,
  generateNextAction,
} from "./analyzer-engine";

describe("computeRealMetrics", () => {
  it("counts characters and words correctly", () => {
    const result = computeRealMetrics("This is a test title");
    expect(result.characterCount).toBe(20);
    expect(result.wordCount).toBe(5);
  });

  it("detects numbers in title", () => {
    expect(computeRealMetrics("5 Ways to Grow").hasNumber).toBe(true);
    expect(computeRealMetrics("Ways to Grow").hasNumber).toBe(false);
  });

  it("detects question marks", () => {
    expect(computeRealMetrics("Is this good?").hasQuestionMark).toBe(true);
    expect(computeRealMetrics("This is good").hasQuestionMark).toBe(false);
  });

  it("detects colons", () => {
    expect(computeRealMetrics("Title: Subtitle").hasColon).toBe(true);
    expect(computeRealMetrics("Title Subtitle").hasColon).toBe(false);
  });

  it("detects exclamation marks", () => {
    expect(computeRealMetrics("Amazing!").hasExclamation).toBe(true);
    expect(computeRealMetrics("Amazing").hasExclamation).toBe(false);
  });

  it("detects comparisons", () => {
    expect(computeRealMetrics("React vs Vue").isComparison).toBe(true);
    expect(computeRealMetrics("React versus Angular").isComparison).toBe(true);
    expect(computeRealMetrics("React and Vue").isComparison).toBe(false);
  });

  it("detects listicles", () => {
    expect(computeRealMetrics("7 Tips for Better Sleep").isListicle).toBe(true);
    expect(computeRealMetrics("Tip for Better Sleep").isListicle).toBe(false);
  });

  it("detects how-to titles", () => {
    expect(computeRealMetrics("how to make pancakes").startsWithHowTo).toBe(true);
    expect(computeRealMetrics("How To Make Pancakes").startsWithHowTo).toBe(true);
    expect(computeRealMetrics("I show how to make pancakes").startsWithHowTo).toBe(false);
  });

  it("detects question-starting titles", () => {
    expect(computeRealMetrics("What is AI?").startsWithQuestion).toBe(true);
    expect(computeRealMetrics("Why you should learn to code").startsWithQuestion).toBe(true);
    expect(computeRealMetrics("The what and why").startsWithQuestion).toBe(false);
  });

  it("detects number-starting titles", () => {
    expect(computeRealMetrics("10 Ways to Save Money").startsWithNumber).toBe(true);
    expect(computeRealMetrics("Top 10 Ways").startsWithNumber).toBe(false);
  });

  it("classifies length flags", () => {
    expect(computeRealMetrics("Short").lengthFlag).toBe("short");
    expect(computeRealMetrics("A medium length title that fits within the range").lengthFlag).toBe("medium");
    expect(computeRealMetrics("A very very very very long title that exceeds the medium threshold comfortably").lengthFlag).toBe("long");
  });

  it("computes capital ratio", () => {
    const result = computeRealMetrics("ALL CAPS TITLE");
    expect(result.capitalRatio).toBeGreaterThan(0.5);
  });

  it("handles empty string", () => {
    const result = computeRealMetrics("");
    expect(result.wordCount).toBe(0);
    expect(result.characterCount).toBe(0);
  });
});

describe("detectPowerWords", () => {
  it("finds power words in title", () => {
    const result = detectPowerWords("The secret to amazing results");
    expect(result).toContain("secret");
    expect(result).toContain("amazing");
  });

  it("only matches whole words, not substrings", () => {
    const result = detectPowerWords("Secretion and amazement are not power words");
    expect(result).toHaveLength(0);
  });

  it("returns empty array for no matches", () => {
    const result = detectPowerWords("A regular boring title");
    expect(result).toHaveLength(0);
  });

  it("matches case-insensitively", () => {
    const result = detectPowerWords("The SECRET to AMAZING Results");
    expect(result).toContain("secret");
    expect(result).toContain("amazing");
  });
});

describe("detectPatterns", () => {
  it("detects how-to pattern", () => {
    const metrics = computeRealMetrics("how to bake bread");
    const patterns = detectPatterns("how to bake bread", metrics);
    expect(patterns).toContain("How-To");
  });

  it("detects listicle pattern", () => {
    const metrics = computeRealMetrics("5 tips for success");
    const patterns = detectPatterns("5 tips for success", metrics);
    expect(patterns).toContain("Number/Listicle");
  });

  it("detects comparison pattern", () => {
    const metrics = computeRealMetrics("React vs Vue comparison");
    const patterns = detectPatterns("React vs Vue comparison", metrics);
    expect(patterns).toContain("Comparison");
  });

  it("detects question pattern", () => {
    const metrics = computeRealMetrics("What is your favorite food?");
    const patterns = detectPatterns("What is your favorite food?", metrics);
    expect(patterns).toContain("Question");
  });

  it("detects colon pattern", () => {
    const metrics = computeRealMetrics("Title: The Subtitle");
    const patterns = detectPatterns("Title: The Subtitle", metrics);
    expect(patterns).toContain("Colon/Specificity");
  });

  it("detects exclamation pattern", () => {
    const metrics = computeRealMetrics("You won't believe this!");
    const patterns = detectPatterns("You won't believe this!", metrics);
    expect(patterns).toContain("Exclamation/Urgency");
  });

  it("detects direct address pattern", () => {
    const metrics = computeRealMetrics("What you need to know");
    const patterns = detectPatterns("What you need to know", metrics);
    expect(patterns).toContain("Direct Address");
  });

  it("detects bracket pattern", () => {
    const metrics = computeRealMetrics("The Best [EXCLUSIVE] Tips");
    const patterns = detectPatterns("The Best [EXCLUSIVE] Tips", metrics);
    expect(patterns).toContain("Bracket/Format");
  });

  it("detects ultra-short pattern", () => {
    const metrics = computeRealMetrics("Just Do It");
    const patterns = detectPatterns("Just Do It", metrics);
    expect(patterns).toContain("Ultra-Short");
  });

  it("detects long-form pattern", () => {
    const metrics = computeRealMetrics("The absolutely complete and comprehensive guide to everything you need to know about this topic");
    const patterns = detectPatterns("The absolutely complete and comprehensive guide to everything you need to know about this topic", metrics);
    expect(patterns).toContain("Long-Form");
  });
});

describe("computeReadability", () => {
  it("returns a score between 0 and 100", () => {
    const score = computeReadability("How to Code Better");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives higher score to shorter simpler titles", () => {
    const shortScore = computeReadability("Easy Words");
    const longScore = computeReadability("Phenomenologically incomprehensible bureaucracy manifestation");
    expect(shortScore).toBeGreaterThan(longScore);
  });

  it("handles empty title", () => {
    expect(computeReadability("")).toBe(0);
  });

  it("handles single word", () => {
    const score = computeReadability("Hello");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("computeViralityScore", () => {
  it("returns a score between 0 and 100", () => {
    const metrics = computeRealMetrics("How to Grow Your Channel Fast");
    const powerWords = detectPowerWords("How to Grow Your Channel Fast");
    const patterns = detectPatterns("How to Grow Your Channel Fast", metrics);
    const readability = computeReadability("How to Grow Your Channel Fast");
    const score = computeViralityScore(metrics, powerWords, patterns, readability);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives higher score to titles with more patterns", () => {
    const plain = computeRealMetrics("Some Title");
    const plainPW = detectPowerWords("Some Title");
    const plainPat = detectPatterns("Some Title", plain);
    const plainRead = computeReadability("Some Title");
    const plainScore = computeViralityScore(plain, plainPW, plainPat, plainRead);

    const rich = computeRealMetrics("7 Secret Tips: How to Dominate Your Market [2024]");
    const richPW = detectPowerWords("7 Secret Tips: How to Dominate Your Market [2024]");
    const richPat = detectPatterns("7 Secret Tips: How to Dominate Your Market [2024]", rich);
    const richRead = computeReadability("7 Secret Tips: How to Dominate Your Market [2024]");
    const richScore = computeViralityScore(rich, richPW, richPat, richRead);

    expect(richScore).toBeGreaterThan(plainScore);
  });

  it("penalizes titles over 100 characters", () => {
    const long = computeRealMetrics("A very very very very very very very very very very very very very very very very very very very very very very very long title that exceeds one hundred characters without breaking a sweat or stopping at all");
    const longPW = detectPowerWords("A very very very very very very very very very very very very very very very very very very very very very very very long title");
    const longPat = detectPatterns("A very very very very very very very very very very very very very very very very very very very very very very very long title", long);
    const longRead = computeReadability("A very very very very very very very very very very very very very very very very very very very very very very very long title");
    const score = computeViralityScore(long, longPW, longPat, longRead);
    expect(score).toBeLessThan(50);
  });
});

describe("runPreAnalysis", () => {
  it("combines all analysis into a single result", () => {
    const result = runPreAnalysis("How to Code Better");
    expect(result.characterCount).toBeGreaterThan(0);
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.powerWords).toBeDefined();
    expect(result.detectedPatterns).toBeDefined();
    expect(result.readabilityScore).toBeDefined();
    expect(result.computedViralityScore).toBeDefined();
    expect(result.computedViralityScore).toBeGreaterThanOrEqual(0);
    expect(result.computedViralityScore).toBeLessThanOrEqual(100);
  });
});

describe("getWeakestDimension", () => {
  it("returns the dimension with the lowest score", () => {
    const psychology = {
      curiosity: 75,
      authority: 30,
      novelty: 80,
      emotion: 60,
      conflict: 50,
      specificity: 90,
      urgency: 70,
    };
    const result = getWeakestDimension(psychology);
    expect(result.name).toBe("authority");
    expect(result.score).toBe(30);
  });

  it("handles single entry", () => {
    const result = getWeakestDimension({ curiosity: 42 });
    expect(result.name).toBe("curiosity");
    expect(result.score).toBe(42);
  });
});

describe("generateNextAction", () => {
  it("returns a suggestion for a known dimension", () => {
    const result = generateNextAction("curiosity", [], 70, 70, []);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns fallback for unknown dimension", () => {
    const result = generateNextAction("nonexistent", [], 70, 70, []);
    expect(result).toBe("Try a different pattern or angle.");
  });
});
