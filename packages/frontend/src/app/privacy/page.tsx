export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-4 text-sm text-muted-foreground">Last updated: July 2026</p>

      <h2 className="mb-3 mt-8 text-xl font-semibold">1. Information We Collect</h2>
      <p className="mb-4 text-muted-foreground">
        When you register for CreatorPulse AI, we collect your email address and an optional
        display name. We store the titles you submit for analysis and the results generated
        to improve your personal analytics and provide the dashboard experience.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-semibold">2. How We Use Your Information</h2>
      <p className="mb-4 text-muted-foreground">
        Your data is used exclusively to provide and improve the CreatorPulse AI service.
        Analysis history powers your dashboard insights, pattern detection, and
        cross-feature intelligence. We do not sell or share your data with third parties.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-semibold">3. AI Processing</h2>
      <p className="mb-4 text-muted-foreground">
        Title and content analysis is processed through the Groq API. Your inputs are
        sent to Groq for inference only and are not retained by Groq for training purposes
        (subject to Groq&apos;s privacy policy).
      </p>

      <h2 className="mb-3 mt-8 text-xl font-semibold">4. Data Retention</h2>
      <p className="mb-4 text-muted-foreground">
        Your analysis history is retained as long as your account is active. You may
        request deletion of your data at any time by contacting us.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-semibold">5. Contact</h2>
      <p className="text-muted-foreground">
        For privacy-related inquiries, email us at privacy@creatorpulse.ai.
      </p>
    </main>
  );
}
