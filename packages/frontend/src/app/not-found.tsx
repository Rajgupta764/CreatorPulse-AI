import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <span className="text-3xl font-bold text-primary">
          404
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="btn btn-primary mt-8 px-6 py-3"
      >
        Back to Home
      </Link>
    </main>
  );
}
