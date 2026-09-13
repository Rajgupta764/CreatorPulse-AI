import Link from "next/link";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "How to Write YouTube Titles That Get Clicked",
    excerpt: "Data-backed patterns, power words, and psychology tactics that increase CTR without resorting to clickbait.",
    date: "Coming Soon",
    slug: "#",
  },
  {
    title: "The Science of YouTube Hooks: What Makes Viewers Stay",
    excerpt: "Why the first 30 seconds matter more than your thumbnail, and how to engineer hooks that reduce drop-off.",
    date: "Coming Soon",
    slug: "#",
  },
  {
    title: "How to Validate a Video Idea Before You Film",
    excerpt: "A 6-dimension framework for scoring video ideas — competition, demand, virality, difficulty, gap, and opportunity.",
    date: "Coming Soon",
    slug: "#",
  },
  {
    title: "Cross-Platform Content Strategy: One Video, Four Platforms",
    excerpt: "How to atomize your YouTube content for TikTok, Instagram, X, and LinkedIn without doubling your workload.",
    date: "Coming Soon",
    slug: "#",
  },
];

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <div className="mb-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Creator strategies, data-driven insights, and platform playbooks — from the CreatorPulse AI team.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <Link
            key={post.title}
            href={post.slug}
            className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
          >
            <p className="mb-1 text-xs font-medium text-primary">{post.date}</p>
            <h2 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">{post.excerpt}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read more <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold">More articles coming soon</h2>
        <p className="text-muted-foreground">
          We&apos;re working on deep dives into creator analytics, title psychology, and audience growth strategies.
        </p>
      </div>
    </main>
  );
}
