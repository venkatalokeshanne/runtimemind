/**
 * ============================================================================
 * HELP PAGE - Complete Documentation
 * ============================================================================
 * 
 * Comprehensive guide for writers on how to use the platform effectively.
 * Covers writing, SEO, series creation, and best practices.
 * 
 * ============================================================================
 */

import Link from 'next/link';
import { 
  BookOpen, 
  Layers, 
  Search, 
  Image, 
  Tag, 
  Share2, 
  TrendingUp,
  FileText,
  CheckCircle,
  Lightbulb,
  Zap,
  Target,
  Users,
  BarChart,
  Bookmark,
  MessageSquare,
  Heart,
  Globe,
  Rss
} from 'lucide-react';

export const metadata = {
  title: 'Help & Documentation - Getting Started Guide',
  description: 'Complete guide to writing and publishing articles on RuntimeMind. Learn SEO best practices, series creation, and how to reach your audience.',
  keywords: ['help', 'documentation', 'writing guide', 'SEO tips', 'blogging tutorial'],
  alternates: {
    canonical: 'https://runtimemind.vercel.app/help',
  },
  openGraph: {
    title: 'Help & Documentation | RuntimeMind',
    description: 'Complete guide to writing and publishing articles on RuntimeMind.',
    url: 'https://runtimemind.vercel.app/help',
    images: [{ url: '/api/og?title=Help%20%26%20Documentation&type=page', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help & Documentation | RuntimeMind',
    images: ['/api/og?title=Help%20%26%20Documentation&type=page'],
  },
};

// Section component for consistent styling
function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      </div>
      <div className="prose prose-lg max-w-none text-text-secondary">
        {children}
      </div>
    </section>
  );
}

// Tip box component
function Tip({ children }) {
  return (
    <div className="flex gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl my-6">
      <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
      <div className="text-sm text-text-secondary">{children}</div>
    </div>
  );
}

// Checklist item
function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

export default function HelpPage() {
  const tableOfContents = [
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'writing-articles', label: 'Writing Articles', icon: FileText },
    { id: 'editor-guide', label: 'Using the Editor', icon: BookOpen },
    { id: 'cover-images', label: 'Cover Images', icon: Image },
    { id: 'tags-categories', label: 'Tags & Categories', icon: Tag },
    { id: 'seo-optimization', label: 'SEO Optimization', icon: Search },
    { id: 'creating-series', label: 'Creating Series', icon: Layers },
    { id: 'engagement', label: 'Engagement Features', icon: Users },
    { id: 'analytics', label: 'Understanding Analytics', icon: BarChart },
    { id: 'sharing', label: 'Sharing & Distribution', icon: Share2 },
    { id: 'best-practices', label: 'Best Practices', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Help & Getting Started
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Everything you need to know about writing, publishing, and growing your audience on RuntimeMind.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl space-y-16">
            
            {/* Getting Started */}
            <Section id="getting-started" icon={Zap} title="Getting Started">
              <p>
                Welcome to RuntimeMind! This guide will help you become a successful writer on our platform. 
                Whether you're new to blogging or an experienced writer, you'll find everything you need here.
              </p>
              
              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Quick Start Checklist</h3>
              <ul className="space-y-3 list-none pl-0">
                <CheckItem>Create an account and complete your profile</CheckItem>
                <CheckItem>Set up your author bio and profile picture</CheckItem>
                <CheckItem>Write your first article using the rich text editor</CheckItem>
                <CheckItem>Add a compelling cover image</CheckItem>
                <CheckItem>Optimize your SEO settings</CheckItem>
                <CheckItem>Publish and share with the world!</CheckItem>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Accessing the Dashboard</h3>
              <p>
                Once logged in, click your profile picture in the top right corner and select "Dashboard". 
                From here you can:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Write new articles</strong> - Create and publish your content</li>
                <li><strong>Manage posts</strong> - Edit, unpublish, or delete existing articles</li>
                <li><strong>Create series</strong> - Group related articles together</li>
                <li><strong>View bookmarks</strong> - Access your saved articles</li>
                <li><strong>Track followers</strong> - See who's following your work</li>
              </ul>
            </Section>

            {/* Writing Articles */}
            <Section id="writing-articles" icon={FileText} title="Writing Articles">
              <p>
                Great articles start with great content. Here's how to craft articles that resonate with readers.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Article Structure</h3>
              <p>A well-structured article typically includes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Compelling Title</strong> - Clear, descriptive, and keyword-rich (50-60 characters ideal)</li>
                <li><strong>Engaging Introduction</strong> - Hook readers in the first paragraph</li>
                <li><strong>Organized Body</strong> - Use headings (H2, H3) to break up content</li>
                <li><strong>Practical Examples</strong> - Code snippets, images, or real-world applications</li>
                <li><strong>Strong Conclusion</strong> - Summarize key points and include a call-to-action</li>
              </ul>

              <Tip>
                <strong>Pro tip:</strong> Write your title last! Once you've finished your article, 
                you'll have a clearer idea of the perfect title that captures its essence.
              </Tip>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Writing the Excerpt</h3>
              <p>
                The excerpt is a short summary (150-160 characters) that appears in article previews 
                and search results. Make it compelling and include your main keyword.
              </p>
              
              <div className="bg-surface-inset p-4 rounded-lg mt-4">
                <p className="text-sm text-text-muted mb-2">Good excerpt example:</p>
                <p className="text-text-primary">
                  "Learn how to build a modern REST API with Node.js and Express. 
                  This step-by-step guide covers authentication, validation, and deployment."
                </p>
              </div>
            </Section>

            {/* Editor Guide */}
            <Section id="editor-guide" icon={BookOpen} title="Using the Editor">
              <p>
                Our rich text editor makes it easy to create beautiful, formatted content. 
                Here's what you can do:
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Text Formatting</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Bold</strong> - Select text and click B or use Ctrl/Cmd + B</li>
                <li><em>Italic</em> - Select text and click I or use Ctrl/Cmd + I</li>
                <li><strong>Headings</strong> - Use H1 for title, H2 for sections, H3 for subsections</li>
                <li><strong>Lists</strong> - Create bullet points or numbered lists</li>
                <li><strong>Quotes</strong> - Highlight important quotes with blockquotes</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Adding Code</h3>
              <p>
                For inline code, wrap text in backticks. For code blocks, use the code block button 
                and select your programming language for syntax highlighting.
              </p>
              
              <div className="bg-[#1e1e1e] text-gray-300 p-4 rounded-lg font-mono text-sm mt-4">
                <pre>{`function greet(name) {
  return \`Hello, \${name}!\`;
}`}</pre>
              </div>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Adding Images</h3>
              <p>
                Click the image button in the toolbar to upload images. Images are automatically 
                optimized and served from our CDN for fast loading.
              </p>

              <Tip>
                Use descriptive alt text for images. It helps with SEO and accessibility. 
                For example: "React component lifecycle diagram showing mount, update, and unmount phases"
              </Tip>
            </Section>

            {/* Cover Images */}
            <Section id="cover-images" icon={Image} title="Cover Images">
              <p>
                A great cover image catches attention and encourages clicks. It appears at the top of 
                your article and in social media previews.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Image Guidelines</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Recommended size:</strong> 1200 x 630 pixels (1.91:1 aspect ratio)</li>
                <li><strong>File formats:</strong> JPG, PNG, or WebP</li>
                <li><strong>File size:</strong> Under 2MB for optimal loading</li>
                <li><strong>Content:</strong> Relevant to your article topic</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">No Image? No Problem!</h3>
              <p>
                If you don't upload a cover image, we automatically generate a beautiful placeholder 
                based on your article title. This ensures your content always looks professional when 
                shared on social media.
              </p>

              <Tip>
                Free image resources: <a href="https://unsplash.com" className="text-accent hover:underline">Unsplash</a>, 
                <a href="https://pexels.com" className="text-accent hover:underline ml-1">Pexels</a>, 
                <a href="https://undraw.co" className="text-accent hover:underline ml-1">unDraw</a> (illustrations)
              </Tip>
            </Section>

            {/* Tags */}
            <Section id="tags-categories" icon={Tag} title="Tags & Categories">
              <p>
                Tags help readers discover your content and improve SEO. Choose them wisely!
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Tag Best Practices</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Use 3-5 relevant tags</strong> per article (max 10)</li>
                <li><strong>Be specific:</strong> "react-hooks" is better than just "react"</li>
                <li><strong>Use existing tags</strong> when possible for better discoverability</li>
                <li><strong>Include technology names:</strong> javascript, python, nextjs</li>
                <li><strong>Include topic types:</strong> tutorial, guide, tips, comparison</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2 mt-4">
                {['javascript', 'react', 'nextjs', 'typescript', 'nodejs', 'python', 'tutorial', 'webdev', 'api', 'css'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </Section>

            {/* SEO */}
            <Section id="seo-optimization" icon={Search} title="SEO Optimization">
              <p>
                Search Engine Optimization helps your articles rank higher in Google and other search engines. 
                Here's how to optimize every article for maximum visibility.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Essential SEO Settings</h3>
              <p>
                In the publish panel, you'll find SEO settings. Here's what each field does:
              </p>

              <div className="space-y-4 mt-4">
                <div className="p-4 bg-surface-inset rounded-lg">
                  <h4 className="font-semibold text-text-primary">SEO Title (50-60 characters)</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    This appears in search results. Include your main keyword near the beginning. 
                    If left empty, your article title is used.
                  </p>
                </div>
                <div className="p-4 bg-surface-inset rounded-lg">
                  <h4 className="font-semibold text-text-primary">SEO Description (150-160 characters)</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    The snippet shown in search results. Write a compelling summary that includes 
                    your keyword and encourages clicks. If empty, your excerpt is used.
                  </p>
                </div>
                <div className="p-4 bg-surface-inset rounded-lg">
                  <h4 className="font-semibold text-text-primary">Featured Toggle</h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Mark your best articles as featured to display them prominently on the homepage.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">SEO Checklist</h3>
              <ul className="space-y-3 list-none pl-0">
                <CheckItem>Include target keyword in title (preferably at the start)</CheckItem>
                <CheckItem>Write a unique, compelling meta description</CheckItem>
                <CheckItem>Use your keyword in the first paragraph</CheckItem>
                <CheckItem>Add relevant tags that match search queries</CheckItem>
                <CheckItem>Use descriptive headings (H2, H3) with keywords</CheckItem>
                <CheckItem>Include internal links to other articles</CheckItem>
                <CheckItem>Add alt text to all images</CheckItem>
                <CheckItem>Ensure content is at least 800 words for comprehensive topics</CheckItem>
              </ul>

              <Tip>
                <strong>Search Preview:</strong> The publish panel shows a live preview of how your 
                article will appear in Google search results. Use this to perfect your title and description!
              </Tip>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Keyword Research Tips</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use <a href="https://trends.google.com" className="text-accent hover:underline">Google Trends</a> to find popular topics</li>
                <li>Check Google's "People also ask" for related questions</li>
                <li>Look at autocomplete suggestions when you search</li>
                <li>Write about problems your target audience is searching for</li>
              </ul>
            </Section>

            {/* Series */}
            <Section id="creating-series" icon={Layers} title="Creating Series">
              <p>
                Series group related articles into a structured learning path. They're perfect for 
                tutorials, courses, or multi-part content.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">When to Create a Series</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Multi-part tutorials (e.g., "Building a Blog with Next.js")</li>
                <li>Topic deep-dives that need multiple articles</li>
                <li>Step-by-step courses or learning paths</li>
                <li>Related articles that should be read in order</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Creating a Series</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Go to Dashboard → Series → New Series</li>
                <li>Add a descriptive title and description</li>
                <li>Upload a cover image (represents the whole series)</li>
                <li>Publish the series</li>
                <li>When writing articles, assign them to the series and set their order</li>
              </ol>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Series Navigation</h3>
              <p>
                Readers who access articles through a series see special navigation with previous/next 
                buttons to move through the content in order. This keeps them engaged longer!
              </p>

              <Tip>
                Plan your series structure before writing. Create an outline with all planned articles 
                and their order. This helps maintain consistency and prevents gaps.
              </Tip>
            </Section>

            {/* Engagement */}
            <Section id="engagement" icon={Users} title="Engagement Features">
              <p>
                Building an audience requires engagement. Here are the features that help you 
                connect with readers.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <h4 className="font-semibold text-text-primary">Likes</h4>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Readers can like your articles. More likes = more visibility on the homepage.
                  </p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-text-primary">Comments</h4>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Engage with readers through comments. Respond to questions and feedback!
                  </p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-semibold text-text-primary">Bookmarks</h4>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Readers can save articles and series to their reading list for later.
                  </p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-text-primary">Followers</h4>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Readers can follow you to see your new content in their feed.
                  </p>
                </div>
              </div>

              <Tip>
                Respond to comments within 24 hours when possible. Engaged authors build loyal audiences!
              </Tip>
            </Section>

            {/* Analytics */}
            <Section id="analytics" icon={BarChart} title="Understanding Analytics">
              <p>
                Track how your content performs to understand what resonates with your audience.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Key Metrics</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Views:</strong> How many times your article was opened</li>
                <li><strong>Read time:</strong> Average time spent reading</li>
                <li><strong>Likes:</strong> How many readers liked your content</li>
                <li><strong>Comments:</strong> Number of discussions started</li>
                <li><strong>Bookmarks:</strong> How many saved for later reading</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Improving Performance</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>High views but low read time? Your intro might need work</li>
                <li>Low views? Focus on SEO and better titles</li>
                <li>High views but few likes? Content might not meet expectations</li>
                <li>Lots of bookmarks? Great reference content!</li>
              </ul>
            </Section>

            {/* Sharing */}
            <Section id="sharing" icon={Share2} title="Sharing & Distribution">
              <p>
                Don't just publish—promote! Here's how to get your content in front of more readers.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Built-in Sharing</h3>
              <p>
                Every article has share buttons for Twitter/X, LinkedIn, Facebook, and a copy link option. 
                These appear below the article header.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">RSS Feed</h3>
              <p>
                RuntimeMind provides an RSS feed at <Link href="/rss" className="text-accent hover:underline">/rss</Link>. 
                Readers can subscribe to get notified of new articles in their favorite RSS reader.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Promotion Tips</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Share on Twitter with relevant hashtags</li>
                <li>Post in relevant subreddits (follow their rules!)</li>
                <li>Share in Discord communities and Slack groups</li>
                <li>Post on LinkedIn for professional content</li>
                <li>Submit to newsletters like JavaScript Weekly</li>
                <li>Cross-post excerpts on Dev.to or Hashnode with a canonical link back</li>
              </ul>

              <Tip>
                When sharing on social media, don't just post the link. Add a hook—a question, 
                a surprising fact, or a key takeaway that makes people want to click.
              </Tip>
            </Section>

            {/* Best Practices */}
            <Section id="best-practices" icon={Target} title="Best Practices">
              <p>
                Follow these guidelines to create content that stands out and grows your audience.
              </p>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Content Quality</h3>
              <ul className="space-y-3 list-none pl-0">
                <CheckItem>Write original, valuable content (no AI-generated fluff)</CheckItem>
                <CheckItem>Proofread for grammar and spelling errors</CheckItem>
                <CheckItem>Include practical examples and code samples</CheckItem>
                <CheckItem>Update old articles when information becomes outdated</CheckItem>
                <CheckItem>Cite sources and give credit where due</CheckItem>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Consistency</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Publish regularly (weekly or bi-weekly is great)</li>
                <li>Maintain a consistent writing style</li>
                <li>Build on previous content (internal linking)</li>
                <li>Engage with your audience consistently</li>
              </ul>

              <h3 className="text-xl font-semibold text-text-primary mt-8 mb-4">Accessibility</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use descriptive alt text for images</li>
                <li>Use proper heading hierarchy (H1 → H2 → H3)</li>
                <li>Ensure sufficient color contrast</li>
                <li>Provide text alternatives for visual content</li>
              </ul>

              <div className="mt-12 p-6 bg-accent/5 border border-accent/20 rounded-xl">
                <h3 className="text-xl font-semibold text-text-primary mb-3">Ready to Start Writing?</h3>
                <p className="text-text-secondary mb-4">
                  You have all the knowledge you need. Now it's time to create something amazing!
                </p>
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <FileText className="w-4 h-4" />
                  Write Your First Article
                </Link>
              </div>
            </Section>

          </main>
        </div>
      </div>
    </div>
  );
}
