/**
 * Privacy Policy Page
 */

export const metadata = {
  title: 'Privacy Policy | RuntimeMind',
  description:
    'Learn how RuntimeMind collects, stores, and protects your data, including analytics, cookies, and user-generated content.',
  alternates: {
    canonical: 'https://www.runtimemind.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | RuntimeMind',
    description:
      'Understand how RuntimeMind handles your data, cookies, analytics, and user rights.',
    url: 'https://www.runtimemind.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Privacy</p>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Privacy Policy</h1>
          <p className="text-text-secondary max-w-3xl">
            Your privacy matters to us. This policy explains what data we collect, how we use it, and the controls you have when
            using RuntimeMind.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-text-primary">What we collect</h2>
          <ul className="list-disc pl-6 text-text-secondary space-y-2">
            <li>Email, name, and profile details you choose to share.</li>
            <li>Usage analytics (page views, device type) to improve performance.</li>
            <li>Content you publish, including images and comments.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-text-primary">How we use data</h2>
          <ul className="list-disc pl-6 text-text-secondary space-y-2">
            <li>Provide core features like publishing, bookmarking, and following authors.</li>
            <li>Improve site reliability, security, and Core Web Vitals.</li>
            <li>Send account notifications and product updates (you can opt out).</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-text-primary">Your controls</h2>
          <ul className="list-disc pl-6 text-text-secondary space-y-2">
            <li>Update or delete your profile and published content at any time.</li>
            <li>Request data exports or deletion via our contact page.</li>
            <li>Use privacy-friendly browsers or disable cookies; core reading still works.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-text-primary">Security</h2>
          <p className="text-text-secondary">
            RuntimeMind is served over HTTPS, enforces secure session handling, and regularly reviews dependencies for
            vulnerabilities. Access to Supabase and analytics data is limited to authorized maintainers.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-text-primary">Contact</h2>
          <p className="text-text-secondary">
            If you have privacy questions or requests, reach out via our <a className="text-accent underline" href="/contact">contact page</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
