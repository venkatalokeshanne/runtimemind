/**
 * ============================================================================
 * MOCK DATA FOR DEVELOPMENT
 * ============================================================================
 * 
 * Sample data for UI development when Supabase is not configured.
 * 
 * This allows developers to work on UI without setting up a database.
 * In production, this data is replaced by real Supabase queries.
 * 
 * ============================================================================
 */

export const mockAuthor = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Alex Writer',
  bio: 'A thoughtful writer exploring ideas at the intersection of technology and humanity.',
  avatar_url: null,
};

export const mockPosts = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'welcome-to-ink-blog',
    title: 'Welcome to Ink Blog',
    content: `
      <h2>A New Beginning</h2>
      <p>
        Welcome to Ink Blog, a modern platform designed for thoughtful writing. 
        In a world of endless notifications and infinite scrolls, we believe 
        there's still a place for calm, focused reading.
      </p>
      
      <h2>What Makes Ink Different</h2>
      <p>
        Most blog platforms optimize for engagement metrics—time on site, 
        clicks, shares. We optimize for something different: the reading 
        experience itself.
      </p>
      
      <ul>
        <li><strong>Typography first:</strong> Every font choice, line height, 
        and margin is intentional.</li>
        <li><strong>No distractions:</strong> No popups, no recommended 
        articles, no engagement hacks.</li>
        <li><strong>Respect for readers:</strong> Dark mode, fast loading, 
        and accessibility are defaults.</li>
      </ul>
      
      <h2>The Technology</h2>
      <p>
        Built with Next.js for performance and SEO, Supabase for a simple 
        yet powerful backend, and Tailwind CSS for maintainable styling. 
        The entire stack is designed to be self-hosted at minimal cost.
      </p>
      
      <blockquote>
        <p>Good design is as little design as possible.</p>
        <cite>— Dieter Rams</cite>
      </blockquote>
      
      <h2>What's Next</h2>
      <p>
        Start writing. Edit this post or delete it and create your own. 
        The platform is yours to shape.
      </p>
    `,
    excerpt: 'A modern blog platform designed for thoughtful writing. Clean design, focused reading, and respect for both writers and readers.',
    cover_image_url: null,
    author_id: '00000000-0000-0000-0000-000000000001',
    author: mockAuthor,
    published: true,
    published_at: '2025-01-01T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    slug: 'designing-for-readability',
    title: 'Designing for Readability',
    content: `
      <p>
        Typography is not about choosing pretty fonts. It's about 
        communication—ensuring that words reach readers with minimum 
        friction and maximum clarity.
      </p>
      
      <h2>The Ideal Line Length</h2>
      <p>
        Research suggests that the optimal line length for reading is 
        between 45 and 75 characters. Too short, and the eye has to 
        jump too frequently. Too long, and it becomes difficult to 
        track to the next line.
      </p>
      
      <h2>Line Height Matters</h2>
      <p>
        Generous line height (1.5 to 1.75 for body text) creates 
        visual breathing room. Each line becomes easier to distinguish, 
        reducing the cognitive load of reading.
      </p>
      
      <h2>Contrast Without Harshness</h2>
      <p>
        Pure black text on pure white backgrounds creates excessive 
        contrast that can cause eye strain over long reading sessions. 
        A slightly off-white background and slightly off-black text 
        is gentler while maintaining readability.
      </p>
    `,
    excerpt: 'The principles behind comfortable long-form reading. Typography choices that reduce eye strain and improve comprehension.',
    cover_image_url: null,
    author_id: '00000000-0000-0000-0000-000000000001',
    author: mockAuthor,
    published: true,
    published_at: '2025-01-02T00:00:00Z',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    slug: 'the-case-for-simplicity',
    title: 'The Case for Simplicity',
    content: `
      <p>
        Every feature has a cost. Every option creates cognitive load. 
        Every setting is a decision the user must make. Good software 
        doesn't just add features—it carefully considers what to leave out.
      </p>
      
      <h2>Feature Creep</h2>
      <p>
        It's tempting to add every feature users request. But each addition 
        makes the product harder to learn, harder to maintain, and often 
        harder to use for the majority of users who didn't need that feature.
      </p>
      
      <h2>The 80/20 Rule</h2>
      <p>
        Most users use 20% of features 80% of the time. The question isn't 
        "can we add this?" but "should we add this?" Will this feature 
        benefit most users, or just a vocal minority?
      </p>
      
      <h2>Simplicity is Hard</h2>
      <p>
        It's easy to add complexity. It's hard to achieve simplicity. 
        Simple doesn't mean lacking features—it means every feature 
        earns its place, every interaction is intuitive, every design 
        choice is intentional.
      </p>
    `,
    excerpt: 'Why less is often more in software design. The discipline of simplicity and the hidden costs of feature creep.',
    cover_image_url: null,
    author_id: '00000000-0000-0000-0000-000000000001',
    author: mockAuthor,
    published: true,
    published_at: '2025-01-03T00:00:00Z',
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
];

// Additional mock posts to support richer homepage sections
for (let i = 4; i <= 16; i++) {
  const id = String(i).padStart(12, '0');
  mockPosts.push({
    id: `00000000-0000-0000-0000-00000000${id}`,
    slug: `sample-post-${i}`,
    title: `Sample Post ${i}: Insights & Notes`,
    content: `
      <p>This is a short sample post to populate the UI for demos and development.</p>
      <p>Post number ${i} contains example content used across the homepage sections.</p>
    `,
    excerpt: `Short summary for sample post ${i}.`,
    cover_image_url: null,
    author_id: mockAuthor.id,
    author: mockAuthor,
    published: true,
    published_at: new Date(Date.now() - i * 86400000).toISOString(),
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
  });
}

/**
 * Get mock posts (simulates database query)
 */
export function getMockPosts({ limit = 10, offset = 0 } = {}) {
  return {
    data: mockPosts.slice(offset, offset + limit),
    error: null,
  };
}

/**
 * Get mock post by slug
 */
export function getMockPostBySlug(slug) {
  const post = mockPosts.find(p => p.slug === slug);
  return {
    data: post || null,
    error: post ? null : { message: 'Post not found', code: 'NOT_FOUND' },
  };
}
