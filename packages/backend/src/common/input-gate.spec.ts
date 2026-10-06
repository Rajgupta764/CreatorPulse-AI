import {
  GATE_RULES,
  assessIdea,
  assessText,
  assessTitle,
  countWords,
  nonAlphanumericRatio,
  vowelRatio,
} from "./input-gate";

describe("input-gate helpers", () => {
  it("counts words ignoring extra whitespace", () => {
    expect(countWords("  I   tried  7 AI tools ")).toBe(5);
    expect(countWords("   ")).toBe(0);
  });

  it("measures vowel ratio over alphabetic characters only", () => {
    expect(vowelRatio("jflaklsdgkljaslgj")).toBeCloseTo(2 / 17, 5);
    expect(vowelRatio("create")).toBeCloseTo(3 / 6, 5);
    expect(vowelRatio("123 !!!")).toBe(0);
  });

  it("measures symbol ratio over non-space characters", () => {
    expect(nonAlphanumericRatio("hello world")).toBe(0);
    expect(nonAlphanumericRatio("!!! ???")).toBe(1);
    expect(nonAlphanumericRatio("10 ways: part 2")).toBeCloseTo(1 / 12, 5);
  });
});

describe("assessTitle", () => {
  const rejects = [
    "jflaklsdgkljaslgj",
    "asdfasdfasdf",
    "qqzzxxvvbbnn",
    "jflaklsdgkl jaslgjxq",
    "Unboxing",
    "   ",
    "!!! @@@ ###",
    "a b c d e f g h i j k l",
  ];

  it.each(rejects)("rejects %j", (input) => {
    const result = assessTitle(input);
    expect(result.ok).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  const accepts = [
    "I Tried 30 Days of Cold Swimming",
    "10 Ways to Grow Your YouTube Channel",
    "How I Built a $10k Side Hustle",
    "Why I Quit My Job (Honest Truth)",
    "My Trip",
    "RTX 5080 review: worth it?",
    "El video que cambió mi canal",
  ];

  it.each(accepts)("accepts %j", (input) => {
    expect(assessTitle(input).ok).toBe(true);
  });

  it("requires two words", () => {
    expect(assessTitle("Unboxing").reason).toBe(GATE_RULES.title.emptyReason);
  });

  it("flags random keystrokes", () => {
    const result = assessTitle("jflaklsdgkl jaslgjxq");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("random keystrokes");
  });
});

describe("assessIdea", () => {
  const rejects = [
    "jflaklsdgkljaslgj",
    "this is bad",
    "short idea",
    "   ",
    "!!! @@@ ### ???",
  ];

  it.each(rejects)("rejects %j", (input) => {
    expect(assessIdea(input).ok).toBe(false);
  });

  const accepts = [
    "How to edit videos faster using keyboard shortcuts",
    "A documentary about underground tunnel cities",
    "Testing every budget microphone under $50",
    "Why most productivity advice fails for creators",
  ];

  it.each(accepts)("accepts %j", (input) => {
    expect(assessIdea(input).ok).toBe(true);
  });

  it("asks for more detail on thin input", () => {
    expect(assessIdea("this is bad").reason).toBe(GATE_RULES.idea.emptyReason);
  });
});

describe("assessText", () => {
  it("leaves non-latin scripts to the word count rule", () => {
    expect(assessText("एक छोटा विचार यहाँ लिखें", GATE_RULES.idea).ok).toBe(true);
    expect(assessText("日本語 の テキスト です", GATE_RULES.idea).ok).toBe(true);
  });
});
