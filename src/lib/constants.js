/**
 * Shared constants used across the application
 */

// Static list of topics for post categorization
export const TOPIC_LIST = [
  // Frontend Frameworks & Libraries
  'React',
  'Next.js',
  'Vue.js',
  'Nuxt.js',
  'Angular',
  'Svelte',
  'SvelteKit',
  'Solid.js',
  'Astro',
  'Remix',
  'Gatsby',
  'Qwik',
  
  // JavaScript & TypeScript
  'JavaScript',
  'TypeScript',
  'ES6+',
  'Node.js',
  'Deno',
  'Bun',
  
  // Java & JVM
  'Java',
  'Spring Boot',
  'Spring Framework',
  'Maven',
  'Gradle',
  'JUnit',
  'Hibernate',
  'JPA',
  'Kotlin',
  'Scala',
  'Groovy',
  'JVM',
  'Java EE',
  'Jakarta EE',
  'Quarkus',
  'Micronaut',
  
  // C/C++/Systems
  'C',
  'C++',
  'Rust',
  'Go',
  'Zig',
  'Assembly',
  'Systems Programming',
  
  // .NET & Microsoft
  'C#',
  '.NET',
  'ASP.NET Core',
  'Blazor',
  'Entity Framework',
  'F#',
  
  // PHP
  'PHP',
  'Laravel',
  'Symfony',
  'WordPress',
  'Composer',
  
  // Ruby
  'Ruby',
  'Ruby on Rails',
  'Sinatra',
  
  // CSS & Styling
  'CSS',
  'Tailwind CSS',
  'Sass/SCSS',
  'CSS-in-JS',
  'Styled Components',
  'CSS Modules',
  'PostCSS',
  'CSS Grid',
  'Flexbox',
  'CSS Animations',
  
  // State Management
  'Redux',
  'Zustand',
  'Jotai',
  'Recoil',
  'MobX',
  'XState',
  'Pinia',
  'Vuex',
  
  // Backend Frameworks (Node.js)
  'Express.js',
  'Fastify',
  'NestJS',
  'Hono',
  'Koa',
  
  // Python Web
  'Django',
  'Flask',
  'FastAPI',
  
  // Go Web
  'Gin',
  'Echo',
  'Fiber',
  
  // Rust Web
  'Actix',
  'Axum',
  'Rocket',
  
  // Databases
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'SQLite',
  'Supabase',
  'Firebase',
  'PlanetScale',
  'Prisma',
  'Drizzle ORM',
  'TypeORM',
  'Sequelize',
  'GraphQL',
  
  // Cloud & Infrastructure
  'AWS',
  'Google Cloud',
  'Azure',
  'Vercel',
  'Netlify',
  'Cloudflare',
  'DigitalOcean',
  'Railway',
  'Render',
  'Fly.io',
  
  // DevOps & CI/CD
  'Docker',
  'Kubernetes',
  'GitHub Actions',
  'GitLab CI',
  'Jenkins',
  'Terraform',
  'Ansible',
  'Linux',
  'Nginx',
  
  // Mobile Development
  'React Native',
  'Flutter',
  'Swift',
  'SwiftUI',
  'Kotlin',
  'Jetpack Compose',
  'iOS Development',
  'Android Development',
  'Expo',
  'Capacitor',
  'Ionic',
  
  // AI & Machine Learning
  'OpenAI API',
  'ChatGPT',
  'LangChain',
  'LLMs',
  'Prompt Engineering',
  'RAG',
  'Vector Databases',
  'Hugging Face',
  'TensorFlow',
  'PyTorch',
  'Scikit-learn',
  'Computer Vision',
  'NLP',
  'AI Agents',
  
  // Data & Analytics
  'Python',
  'Pandas',
  'NumPy',
  'Data Visualization',
  'Jupyter Notebooks',
  'Apache Spark',
  'ETL Pipelines',
  'Business Intelligence',
  
  // Testing
  'Jest',
  'Vitest',
  'Playwright',
  'Cypress',
  'React Testing Library',
  'Unit Testing',
  'Integration Testing',
  'E2E Testing',
  'Test-Driven Development',
  
  // Security
  'Web Security',
  'Authentication',
  'OAuth',
  'JWT',
  'OWASP',
  'Penetration Testing',
  'Encryption',
  'Security Best Practices',
  
  // Performance
  'Web Performance',
  'Core Web Vitals',
  'Lazy Loading',
  'Code Splitting',
  'Caching Strategies',
  'CDN',
  'Image Optimization',
  'Bundle Optimization',
  
  // Architecture & Patterns
  'Microservices',
  'Serverless',
  'Monorepo',
  'Clean Architecture',
  'Domain-Driven Design',
  'Event-Driven Architecture',
  'API Design',
  'REST API',
  'tRPC',
  'WebSockets',
  'Real-time Apps',
  
  // Tools & Productivity
  'Git',
  'VS Code',
  'Vim/Neovim',
  'Terminal',
  'CLI Tools',
  'Monorepo Tools',
  'Turborepo',
  'Nx',
  'pnpm',
  'ESLint',
  'Prettier',
  
  // Web3 & Blockchain
  'Solidity',
  'Ethereum',
  'Smart Contracts',
  'Web3.js',
  'Ethers.js',
  'DeFi',
  'NFTs',
  
  // Game Development
  'Unity',
  'Unreal Engine',
  'Godot',
  'Three.js',
  'WebGL',
  'Game Design',
  'Phaser',
  
  // Design & UX
  'UI Design',
  'UX Design',
  'Figma',
  'Design Systems',
  'Accessibility',
  'Responsive Design',
  'Motion Design',
  'Framer Motion',
  
  // Career & Soft Skills
  'Career Advice',
  'Interview Prep',
  'System Design',
  'Technical Writing',
  'Open Source',
  'Freelancing',
  'Remote Work',
  'Developer Productivity',
  'Learning to Code',
  'Side Projects',
  
  // Emerging Tech
  'WebAssembly',
  'Edge Computing',
  'PWAs',
  'Browser Extensions',
  'Electron',
  'Tauri',
  
  // ==========================================
  // NON-TECH / GENERAL TOPICS
  // ==========================================
  
  // Business & Entrepreneurship
  'Startups',
  'Entrepreneurship',
  'Business Strategy',
  'Marketing',
  'Product Management',
  'Leadership',
  'Finance',
  'Investing',
  'Cryptocurrency',
  
  // Writing & Content
  'Writing Tips',
  'Blogging',
  'Content Strategy',
  'Storytelling',
  'Creative Writing',
  'Copywriting',
  'Technical Writing',
  'Journalism',
  
  // Personal Development
  'Productivity',
  'Self Improvement',
  'Mental Health',
  'Mindfulness',
  'Work-Life Balance',
  'Time Management',
  'Motivation',
  'Goal Setting',
  
  // Education & Learning
  'Online Learning',
  'Education',
  'Teaching',
  'Study Tips',
  'Language Learning',
  'Book Reviews',
  
  // Lifestyle
  'Travel',
  'Food & Cooking',
  'Health & Fitness',
  'Photography',
  'Music',
  'Art & Design',
  'Fashion',
  'Sustainability',
  'Minimalism',
  
  // Science & Research
  'Science',
  'Space',
  'Physics',
  'Biology',
  'Psychology',
  'Neuroscience',
  'Climate Change',
  'Research',
  
  // Entertainment
  'Movies',
  'TV Shows',
  'Gaming',
  'Books',
  'Podcasts',
  'Sports',
  'Pop Culture',
  
  // Social & Culture
  'Society',
  'Culture',
  'History',
  'Politics',
  'Philosophy',
  'Ethics',
  'Social Media',
  'Relationships',
  
  // Other
  'Other'
];
