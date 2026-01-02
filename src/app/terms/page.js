export const metadata = {
  title: 'Terms of Service | RuntimeMind',
  description: 'Read the terms and conditions for using RuntimeMind.',
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-text-secondary">
        Welcome to RuntimeMind! By using this website, you agree to the following terms and conditions. Please read them carefully.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4">By accessing or using RuntimeMind, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">2. User Content</h2>
      <p className="mb-4">You are responsible for the content you post. Do not post anything illegal, harmful, or infringing on others' rights.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">3. Intellectual Property</h2>
      <p className="mb-4">All content on this site, except user submissions, is the property of RuntimeMind or its licensors.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">4. Termination</h2>
      <p className="mb-4">We reserve the right to suspend or terminate your access at any time for violations of these terms.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">5. Changes to Terms</h2>
      <p className="mb-4">We may update these terms at any time. Continued use of the site means you accept the new terms.</p>
      <h2 className="text-xl font-semibold mt-8 mb-2">6. Contact</h2>
      <p>If you have questions about these terms, please contact us via the Help page.</p>
    </main>
  );
}
