import { POWER_WORDS } from "./power-words";

describe("POWER_WORDS dictionary", () => {
  it("contains power words", () => {
    expect(POWER_WORDS.length).toBeGreaterThan(100);
  });

  it("has no duplicate entries", () => {
    const lower = POWER_WORDS.map((w) => w.toLowerCase());
    const unique = new Set(lower);
    if (unique.size !== POWER_WORDS.length) {
      const seen = new Set();
      const dupes = POWER_WORDS.filter((w) => {
        const lw = w.toLowerCase();
        if (seen.has(lw)) return true;
        seen.add(lw);
        return false;
      });
      throw new Error(`Duplicate power words found: ${dupes.join(", ")}`);
    }
    expect(unique.size).toBe(POWER_WORDS.length);
  });

  it("contains expected categories of words", () => {
    const set = new Set(POWER_WORDS.map((w) => w.toLowerCase()));
    const secretWords = ["secret", "hidden", "revealed", "exposed", "confidential"];
    secretWords.forEach((w) => expect(set.has(w)).toBe(true));
  });

  it("all entries are non-empty strings", () => {
    POWER_WORDS.forEach((w) => {
      expect(typeof w).toBe("string");
      expect(w.trim().length).toBeGreaterThan(0);
    });
  });
});
