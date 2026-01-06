/**
 * Contact Page
 */

export const metadata = {
  title: 'Contact | RuntimeMind',
  description:
    'Contact the RuntimeMind team for support, partnerships, or content questions. Expect a response within 2 business days.',
  alternates: {
    canonical: 'https://www.runtimemind.com/contact',
  },
  openGraph: {
    title: 'Contact | RuntimeMind',
    description:
      'Reach the RuntimeMind team for support, partnerships, or privacy requests.',
    url: 'https://www.runtimemind.com/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Support</p>
          <h1 className="text-4xl font-bold text-text-primary mb-4">Contact RuntimeMind</h1>
          <p className="text-text-secondary max-w-3xl">
            Have a question about publishing, privacy, or partnerships? We respond to most messages within two business days.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-text-primary">General inquiries</h2>
            <p className="text-text-secondary">Email us at <a className="text-accent underline" href="mailto:hello@runtimemind.com">hello@runtimemind.com</a>.</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-text-primary">Press & partnerships</h2>
            <p className="text-text-secondary">For collaborations, sponsorships, or guest posts, write to <a className="text-accent underline" href="mailto:partners@runtimemind.com">partners@runtimemind.com</a>.</p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Privacy & data requests</h2>
          <p className="text-text-secondary">
            Request data exports or deletions via <a className="text-accent underline" href="mailto:privacy@runtimemind.com">privacy@runtimemind.com</a>. Include the email tied to your account so we can verify ownership.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Report abuse</h2>
          <p className="text-text-secondary">
            If you spot spam, copyright violations, or security issues, please send details to <a className="text-accent underline" href="mailto:abuse@runtimemind.com">abuse@runtimemind.com</a>. Attach links and screenshots when possible.
          </p>
        </div>
      </section>
    </main>
  );
}
