import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">About CreatorPulse AI</h1>
      <p className="mb-4 text-lg text-muted-foreground">
        CreatorPulse AI is a Research Intelligence Platform built for YouTube creators who want
        to stop guessing and start knowing what makes a video perform.
      </p>
      <p className="mb-4 text-muted-foreground">
        We combine algorithmic pre-analysis with AI-powered deep psychology to score your
        titles, validate ideas, mine audience sentiment, and surface untapped content
        opportunities — all anchored in real data, not generic suggestions.
      </p>
      <h2 className="mb-3 mt-10 text-2xl font-semibold">Why We Built This</h2>
      <p className="mb-4 text-muted-foreground">
        Most creators rely on ChatGPT for title ideas and get back 10 variations of
        &ldquo;You Won&apos;t Believe What Happens Next.&rdquo; CreatorPulse AI replaces generic
        output with personal, data-anchored intelligence that learns your niche, your
        patterns, and your audience over time.
      </p>
      <h2 className="mb-3 mt-10 text-2xl font-semibold">The Team</h2>
      <p className="text-muted-foreground">
        We&apos;re a small team of engineers, content strategists, and data nerds who
        believe every creator deserves a research team they can afford.
      </p>
      <div className="mt-12">
        <Link href="/generate" className="btn-primary px-6 py-2.5 text-sm">
          Try the Title Analyzer
        </Link>
      </div>
    </main>
  );
}
