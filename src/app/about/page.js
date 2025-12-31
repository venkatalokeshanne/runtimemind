/**
 * ============================================================================
 * ABOUT PAGE
 * ============================================================================
 * 
 * Static about page for the blog.
 * 
 * ============================================================================
 */

import { ArrowRight, Feather, Eye, Zap, Heart, Code, Mail, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About',
  description: 'Learn more about RuntimeMind and the philosophy behind it.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5" />
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
              We write about ideas
              <span className="text-accent"> that matter</span>
            </h1>
            <p className="text-xl text-text-muted leading-relaxed">
              RuntimeMind is a space for thoughtful exploration of technology, creativity, 
              and the human experience. We believe in depth over speed, clarity over complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-12">
            What we believe
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ValueCard 
              icon={Feather}
              title="Content First"
              description="Beautiful typography and generous whitespace let words breathe. No clutter, no distractions."
            />
            <ValueCard 
              icon={Eye}
              title="Distraction Free"
              description="No popups, no infinite scroll, no engagement hacks. Just pure, focused reading."
            />
            <ValueCard 
              icon={Heart}
              title="Respectful Design"
              description="Dark mode, fast loading, and accessibility are defaults, not afterthoughts."
            />
            <ValueCard 
              icon={Zap}
              title="Performance"
              description="Lightning fast page loads. Every millisecond matters for the reading experience."
            />
            <ValueCard 
              icon={Code}
              title="Open Source"
              description="Built in public, transparent, and designed to be customized and self-hosted."
            />
            <ValueCard 
              icon={ArrowRight}
              title="Continuous Growth"
              description="Always learning, always improving. We share our journey openly."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="100+" label="Articles Published" />
            <StatItem number="10K+" label="Monthly Readers" />
            <StatItem number="5+" label="Series Collections" />
            <StatItem number="2024" label="Year Started" />
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                Built with modern tech
              </h2>
              <p className="text-text-muted mb-6 leading-relaxed">
                We use the best tools available to create a fast, reliable, and beautiful 
                reading experience. Our stack is optimized for both developers and readers.
              </p>
              <div className="flex flex-wrap gap-3">
                <TechBadge>Next.js</TechBadge>
                <TechBadge>React</TechBadge>
                <TechBadge>Supabase</TechBadge>
                <TechBadge>Tailwind CSS</TechBadge>
                <TechBadge>Framer Motion</TechBadge>
                <TechBadge>Vercel</TechBadge>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-8">
              <pre className="text-sm text-text-muted overflow-x-auto">
                <code>{`// Our philosophy in code
const RuntimeMind = {
  focus: "quality over quantity",
  design: "minimal yet powerful",
  goal: "inspire & educate",
  motto: "Think deeper, build better"
};`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-br from-accent/5 to-purple-500/5">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Start reading today
          </h2>
          <p className="text-text-muted mb-8 max-w-xl mx-auto">
            Explore our articles and series. No account required to read, 
            but sign up to bookmark your favorites and follow authors.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/articles" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              Browse Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/series" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-primary font-medium hover:bg-surface transition-colors"
            >
              View Series
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Get in touch</h2>
              <p className="text-text-muted">Have questions or want to collaborate? We'd love to hear from you.</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:hello@runtimemind.com" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-primary hover:bg-surface transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-primary hover:bg-surface transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-primary hover:bg-surface transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ValueCard({ icon: Icon, title, description }) {
  return (
    <div className="group p-6 rounded-xl border border-border bg-surface hover:border-accent/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-accent mb-1">{number}</div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
}

function TechBadge({ children }) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-surface border border-border text-sm text-text-primary">
      {children}
    </span>
  );
}
