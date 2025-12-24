export const docIndex = {
  'system-design': {
    title: 'System Design',
    description: 'Grokking Modern System Design - Complete Guide',
    defaultSlug: 'what-is-a-system-design-interview',
    sections: [
      {
        title: '1. System Design Interviews',
        pages: [
          { slug: 'what-is-a-system-design-interview', title: 'What Is a System Design Interview?' },
          { slug: 'how-to-prepare-for-success', title: 'How to Prepare for Success' },
          { slug: 'how-to-perform-well', title: 'How to Perform Well' },
        ],
      },
      {
        title: '2. Introduction',
        pages: [
          { slug: 'introduction-to-modern-system-design', title: 'Introduction to Modern System Design' },
          { slug: 'course-structure-for-modern-system-design', title: 'Course Structure' },
        ],
      },
      {
        title: '3. Abstractions',
        pages: [
          { slug: 'why-are-abstractions-important', title: 'Why Are Abstractions Important?' },
          { slug: 'network-abstractions-remote-procedure-calls', title: 'Remote Procedure Calls' },
          { slug: 'spectrum-of-consistency-models', title: 'Consistency Models' },
          { slug: 'the-spectrum-of-failure-models', title: 'Failure Models' },
        ],
      },
      {
        title: '4. Non-functional System Characteristics',
        pages: [
          { slug: 'availability', title: 'Availability' },
          { slug: 'reliability', title: 'Reliability' },
          { slug: 'scalability', title: 'Scalability' },
          { slug: 'maintainability', title: 'Maintainability' },
          { slug: 'fault-tolerance', title: 'Fault Tolerance' },
        ],
      },
      {
        title: '5. Back-of-the-envelope Calculations',
        pages: [
          { slug: 'put-back-of-the-envelope-numbers-in-perspective', title: 'Numbers in Perspective' },
          { slug: 'examples-of-resource-estimation', title: 'Resource Estimation Examples' },
        ],
      },
      {
        title: '6. Building Blocks',
        pages: [
          { slug: 'introduction-to-building-blocks-for-modern-system-design', title: 'Introduction to Building Blocks' },
        ],
      },
      {
        title: '7. Domain Name System',
        pages: [
          { slug: 'introduction-to-domain-name-system-dns', title: 'Introduction to DNS' },
          { slug: 'how-the-domain-name-system-works', title: 'How DNS Works' },
        ],
      },
      {
        title: '8. Load Balancers',
        pages: [
          { slug: 'introduction-to-load-balancers', title: 'Introduction to Load Balancers' },
          { slug: 'global-and-local-load-balancing', title: 'Global and Local Load Balancing' },
          { slug: 'advanced-details-of-load-balancers', title: 'Advanced Details' },
        ],
      },
      {
        title: '9. Databases',
        pages: [
          { slug: 'introduction-to-databases', title: 'Introduction to Databases' },
          { slug: 'types-of-databases', title: 'Types of Databases' },
          { slug: 'data-replication', title: 'Data Replication' },
          { slug: 'data-partitioning', title: 'Data Partitioning' },
        ],
      },
      {
        title: '10. Key-value Store',
        pages: [
          { slug: 'system-design-the-key-value-store', title: 'System Design: Key-value Store' },
          { slug: 'design-of-a-key-value-store', title: 'Design of a Key-value Store' },
          { slug: 'ensure-scalability-and-replication', title: 'Scalability and Replication' },
          { slug: 'versioning-data-and-achieving-configurability', title: 'Versioning Data' },
          { slug: 'enable-fault-tolerance-and-failure-detection', title: 'Fault Tolerance' },
        ],
      },
      {
        title: '11. Content Delivery Network (CDN)',
        pages: [
          { slug: 'system-design-the-content-delivery-network-cdn', title: 'System Design: CDN' },
          { slug: 'introduction-to-a-cdn', title: 'Introduction to CDN' },
          { slug: 'design-of-a-cdn', title: 'Design of a CDN' },
          { slug: 'in-depth-investigation-of-cdn-part-1', title: 'In-depth Investigation Part 1' },
          { slug: 'in-depth-investigation-of-cdn-part-2', title: 'In-depth Investigation Part 2' },
          { slug: 'evaluation-of-cdn-design', title: 'Evaluation of CDN Design' },
          { slug: 'quiz-on-cdn-design', title: 'Quiz on CDN Design' },
        ],
      },
      {
        title: '12. Sequencer',
        pages: [
          { slug: 'system-design-sequencer', title: 'System Design: Sequencer' },
          { slug: 'design-of-a-unique-id-generator', title: 'Unique ID Generator' },
          { slug: 'unique-ids-with-causality', title: 'Unique IDs with Causality' },
        ],
      },
      {
        title: '13. Distributed Monitoring',
        pages: [
          { slug: 'system-design-distributed-monitoring', title: 'System Design: Monitoring' },
          { slug: 'introduction-to-distributed-monitoring', title: 'Introduction to Monitoring' },
          { slug: 'prerequisites-of-a-monitoring-system', title: 'Prerequisites' },
        ],
      },
      {
        title: '14. Monitor Server-side Errors',
        pages: [
          { slug: 'design-of-a-monitoring-system', title: 'Design of a Monitoring System' },
          { slug: 'detailed-design-of-a-monitoring-system', title: 'Detailed Design' },
          { slug: 'visualize-data-in-a-monitoring-system', title: 'Visualize Data' },
        ],
      },
      {
        title: '15. Monitor Client-side Errors',
        pages: [
          { slug: 'focus-on-client-side-errors-in-a-monitoring-system', title: 'Focus on Client-side Errors' },
          { slug: 'design-of-a-client-side-monitoring-system', title: 'Design' },
        ],
      },
      {
        title: '16. Distributed Cache',
        pages: [
          { slug: 'system-design-the-distributed-cache', title: 'System Design: Distributed Cache' },
          { slug: 'background-of-distributed-cache', title: 'Background' },
          { slug: 'high-level-design-of-a-distributed-cache', title: 'High-level Design' },
          { slug: 'detailed-design-of-a-distributed-cache', title: 'Detailed Design' },
          { slug: 'evaluation-of-a-distributed-cache-design', title: 'Evaluation' },
          { slug: 'memcached-versus-redis', title: 'Memcached vs Redis' },
        ],
      },
      {
        title: '17. Distributed Messaging Queue',
        pages: [
          { slug: 'system-design-the-distributed-messaging-queue', title: 'System Design: Messaging Queue' },
          { slug: 'requirements-of-a-distributed-messaging-queue-design', title: 'Requirements' },
          { slug: 'considerations-of-a-distributed-messaging-queue-design', title: 'Considerations' },
          { slug: 'design-of-a-distributed-messaging-queue-part-1', title: 'Design Part 1' },
          { slug: 'design-of-a-distributed-messaging-queue-part-2', title: 'Design Part 2' },
          { slug: 'evaluation-of-a-distributed-messaging-queue-design', title: 'Evaluation' },
          { slug: 'quiz-on-the-distributed-messaging-queue-design', title: 'Quiz' },
        ],
      },
      {
        title: '18. Pub-sub',
        pages: [
          { slug: 'system-design-the-pub-sub-abstraction', title: 'System Design: Pub-sub' },
          { slug: 'introduction-to-pub-sub', title: 'Introduction to Pub-sub' },
          { slug: 'design-of-a-pub-sub-system', title: 'Design' },
        ],
      },
      {
        title: '19. Rate Limiter',
        pages: [
          { slug: 'system-design-the-rate-limiter', title: 'System Design: Rate Limiter' },
          { slug: 'requirements-of-a-rate-limiter-design', title: 'Requirements' },
          { slug: 'design-of-a-rate-limiter', title: 'Design' },
          { slug: 'rate-limiter-algorithms', title: 'Algorithms' },
          { slug: 'quiz-on-the-rate-limiter-design', title: 'Quiz' },
        ],
      },
      {
        title: '20. Blob Store',
        pages: [
          { slug: 'system-design-a-blob-store', title: 'System Design: Blob Store' },
          { slug: 'requirements-of-a-blob-store-design', title: 'Requirements' },
          { slug: 'design-of-a-blob-store', title: 'Design' },
          { slug: 'design-considerations-of-a-blob-store', title: 'Design Considerations' },
          { slug: 'evaluation-of-a-blob-store-design', title: 'Evaluation' },
          { slug: 'quiz-on-the-blob-store-design', title: 'Quiz' },
        ],
      },
      {
        title: '21. Distributed Search',
        pages: [
          { slug: 'system-design-the-distributed-search', title: 'System Design: Distributed Search' },
          { slug: 'requirements-of-a-distributed-search-system-design', title: 'Requirements' },
          { slug: 'indexing-in-a-distributed-search', title: 'Indexing' },
          { slug: 'design-of-a-distributed-search', title: 'Design' },
          { slug: 'scaling-search-and-indexing', title: 'Scaling' },
          { slug: 'evaluation-of-a-distributed-search-design', title: 'Evaluation' },
        ],
      },
      {
        title: '22. Distributed Logging',
        pages: [
          { slug: 'system-design-distributed-logging', title: 'System Design: Distributed Logging' },
          { slug: 'introduction-to-distributed-logging', title: 'Introduction' },
          { slug: 'design-of-a-distributed-logging-service', title: 'Design' },
        ],
      },
      {
        title: '23. Distributed Task Scheduler',
        pages: [
          { slug: 'system-design-the-distributed-task-scheduler', title: 'System Design: Task Scheduler' },
          { slug: 'requirements-of-a-distributed-task-scheduler-design', title: 'Requirements' },
          { slug: 'design-of-a-distributed-task-scheduler', title: 'Design' },
          { slug: 'design-considerations-of-a-distributed-task-scheduler', title: 'Considerations' },
          { slug: 'evaluation-of-a-distributed-task-scheduler-design', title: 'Evaluation' },
        ],
      },
      {
        title: '24. Sharded Counters',
        pages: [
          { slug: 'system-design-the-sharded-counters', title: 'System Design: Sharded Counters' },
          { slug: 'high-level-design-of-sharded-counters', title: 'High-level Design' },
          { slug: 'detailed-design-of-sharded-counters', title: 'Detailed Design' },
          { slug: 'quiz-on-the-sharded-counters-design', title: 'Quiz' },
        ],
      },
      {
        title: '25. Concluding the Building Blocks Discussion',
        pages: [
          { slug: 'wrapping-up-the-building-blocks-discussion', title: 'Wrapping Up' },
          { slug: 'the-reshaded-approach-for-system-design', title: 'RESHADED Approach' },
        ],
      },
      {
        title: '26. Design YouTube',
        pages: [
          { slug: 'system-design-youtube', title: 'System Design: YouTube' },
          { slug: 'requirements-of-youtube-design', title: 'Requirements' },
          { slug: 'design-of-youtube', title: 'Design' },
          { slug: 'evaluation-of-youtube-design', title: 'Evaluation' },
          { slug: 'the-reality-is-more-complicated', title: 'The Reality' },
          { slug: 'quiz-on-youtube-design', title: 'Quiz' },
        ],
      },
      {
        title: '27. Design Quora',
        pages: [
          { slug: 'system-design-quora', title: 'System Design: Quora' },
          { slug: 'requirements-of-quora-design', title: 'Requirements' },
          { slug: 'initial-design-of-quora', title: 'Initial Design' },
          { slug: 'final-design-of-quora', title: 'Final Design' },
          { slug: 'evaluation-of-quora-design', title: 'Evaluation' },
        ],
      },
      {
        title: '28. Design Google Maps',
        pages: [
          { slug: 'system-design-google-maps', title: 'System Design: Google Maps' },
          { slug: 'requirements-of-google-maps-design', title: 'Requirements' },
          { slug: 'design-of-google-maps', title: 'Design' },
          { slug: 'challenges-of-google-maps-design', title: 'Challenges' },
          { slug: 'detailed-design-of-google-maps', title: 'Detailed Design' },
          { slug: 'evaluation-of-google-maps-design', title: 'Evaluation' },
        ],
      },
      {
        title: '29. Design a Proximity Service - Yelp',
        pages: [
          { slug: 'system-design-yelp', title: 'System Design: Yelp' },
          { slug: 'requirements-of-yelp-design', title: 'Requirements' },
          { slug: 'design-of-yelp', title: 'Design' },
          { slug: 'design-considerations-of-yelp', title: 'Considerations' },
          { slug: 'quiz-on-yelp-design', title: 'Quiz' },
        ],
      },
      {
        title: '30. Design Uber',
        pages: [
          { slug: 'system-design-uber', title: 'System Design: Uber' },
          { slug: 'requirements-of-uber-design', title: 'Requirements' },
          { slug: 'high-level-design-of-uber', title: 'High-level Design' },
          { slug: 'detailed-design-of-uber', title: 'Detailed Design' },
          { slug: 'payment-service-and-fraud-detection-in-uber-design', title: 'Payment & Fraud Detection' },
          { slug: 'evaluation-of-uber-design', title: 'Evaluation' },
          { slug: 'quiz-on-uber-design', title: 'Quiz' },
        ],
      },
      {
        title: '31. Design Twitter',
        pages: [
          { slug: 'system-design-twitter', title: 'System Design: Twitter' },
          { slug: 'requirements-of-twitter-design', title: 'Requirements' },
          { slug: 'high-level-design-of-twitter', title: 'High-level Design' },
          { slug: 'detailed-design-of-twitter', title: 'Detailed Design' },
          { slug: 'client-side-load-balancer-for-twitter', title: 'Client-side Load Balancer' },
          { slug: 'quiz-on-twitter-design', title: 'Quiz' },
        ],
      },
      {
        title: '32. Design Newsfeed System',
        pages: [
          { slug: 'system-design-newsfeed-system', title: 'System Design: Newsfeed' },
          { slug: 'requirements-of-a-newsfeed-system-design', title: 'Requirements' },
          { slug: 'design-of-a-newsfeed-system', title: 'Design' },
          { slug: 'evaluation-of-a-newsfeed-system-design', title: 'Evaluation' },
        ],
      },
      {
        title: '33. Design Instagram',
        pages: [
          { slug: 'system-design-instagram', title: 'System Design: Instagram' },
          { slug: 'requirements-of-instagram-design', title: 'Requirements' },
          { slug: 'design-of-instagram', title: 'Design' },
          { slug: 'detailed-design-of-instagram', title: 'Detailed Design' },
          { slug: 'quiz-on-instagram-design', title: 'Quiz' },
        ],
      },
      {
        title: '34. Design a URL Shortening Service - TinyURL',
        pages: [
          { slug: 'system-design-tinyurl', title: 'System Design: TinyURL' },
          { slug: 'requirements-of-tinyurl-design', title: 'Requirements' },
          { slug: 'design-and-deployment-of-tinyurl', title: 'Design and Deployment' },
          { slug: 'encoder-for-tinyurl', title: 'Encoder' },
          { slug: 'evaluation-of-tinyurl-design', title: 'Evaluation' },
          { slug: 'quiz-on-tinyurl-design', title: 'Quiz' },
        ],
      },
      {
        title: '35. Design a Web Crawler',
        pages: [
          { slug: 'system-design-web-crawler', title: 'System Design: Web Crawler' },
          { slug: 'requirements-of-a-web-crawler-design', title: 'Requirements' },
          { slug: 'design-of-a-web-crawler', title: 'Design' },
          { slug: 'design-improvements-of-a-web-crawler', title: 'Improvements' },
          { slug: 'evaluation-of-web-crawler-design', title: 'Evaluation' },
        ],
      },
      {
        title: '36. Design WhatsApp',
        pages: [
          { slug: 'system-design-whatsapp', title: 'System Design: WhatsApp' },
          { slug: 'requirements-of-whatsapp-design', title: 'Requirements' },
          { slug: 'high-level-design-of-whatsapp', title: 'High-level Design' },
          { slug: 'detailed-design-of-whatsapp', title: 'Detailed Design' },
          { slug: 'evaluation-of-whatsapp-design', title: 'Evaluation' },
          { slug: 'quiz-on-whatsapp-design', title: 'Quiz' },
        ],
      },
      {
        title: '37. Design Typeahead Suggestion',
        pages: [
          { slug: 'system-design-the-typeahead-suggestion-system', title: 'System Design: Typeahead' },
          { slug: 'requirements-of-the-typeahead-suggestion-system-design', title: 'Requirements' },
          { slug: 'high-level-design-of-the-typeahead-suggestion-system', title: 'High-level Design' },
          { slug: 'data-structure-for-storing-prefixes', title: 'Data Structure' },
          { slug: 'detailed-design-of-the-typeahead-suggestion-system', title: 'Detailed Design' },
          { slug: 'evaluation-of-the-typeahead-suggestion-system-design', title: 'Evaluation' },
          { slug: 'quiz-on-the-typeahead-suggestion-system-design', title: 'Quiz' },
        ],
      },
      {
        title: '38. Design a Collaborative Document Editing Service - Google Docs',
        pages: [
          { slug: 'design-of-google-docs', title: 'Design of Google Docs' },
        ],
      },
      {
        title: '39. Spectacular Failures',
        pages: [
          { slug: 'introduction-to-distributed-system-failures', title: 'Introduction to Failures' },
          { slug: 'facebook-whatsapp-instagram-oculus-outage', title: 'Facebook Outage' },
          { slug: 'aws-kinesis-outage-affecting-many-organizations', title: 'AWS Kinesis Outage' },
          { slug: 'aws-wide-spread-outage', title: 'AWS Wide Spread Outage' },
        ],
      },
      {
        title: '40. Concluding Remarks',
        pages: [
          { slug: 'conclusions', title: 'Conclusions' },
        ],
      },
    ],
  },
  'coding-interview': {
    title: 'Coding Interview',
    description: 'Patterns, drills, and system design rounds.',
    defaultSlug: 'arrays',
    sections: [
      {
        title: 'Core Patterns',
        pages: [
          { slug: 'arrays', title: 'Arrays & Strings' },
          { slug: 'system-design-round', title: 'System Design Round' },
          { slug: 'behavioral', title: 'Behavioral Prep' },
        ],
      },
    ],
  },
};
