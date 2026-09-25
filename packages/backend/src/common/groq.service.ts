import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class GroqService {
  private client: OpenAI;
  private readonly model = "openai/gpt-oss-20b";

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  async call(prompt: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from Groq");
    return content;
  }

  extractJson(text: string): string {
    const cleaned = text.replace(/```[\w]*\n?/g, "").trim();
    let braceCount = 0;
    let start = -1;
    let inString = false;
    let prevChar = "";
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === '"' && prevChar !== "\\") inString = !inString;
      if (!inString) {
        if (ch === "{") { if (start === -1) start = i; braceCount++; }
        else if (ch === "}") { braceCount--; if (braceCount === 0 && start !== -1) return cleaned.slice(start, i + 1); }
      }
      prevChar = ch;
    }
    throw new Error("No valid JSON found in response");
  }

  safeParse(raw: string) {
    try { return JSON.parse(raw); }
    catch {
      const repaired = raw
        .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
      return JSON.parse(repaired);
    }
  }
}
