import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import TurndownService from 'turndown';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Custom rule to handle anchor links properly
turndownService.addRule('internalLinks', {
  filter: function (node) {
    return node.nodeName === 'A' && node.getAttribute('href') && node.getAttribute('href').startsWith('#');
  },
  replacement: function (content, node) {
    const href = node.getAttribute('href');
    // Keep the anchor link format for internal navigation
    return `[${content}](${href})`;
  }
});

// Keep all images including data URIs
turndownService.addRule('removeDataImages', {
  filter: 'img',
  replacement: function (content, node) {
    const src = node.getAttribute('src') || '';
    const dataSrc = node.getAttribute('data-savepage-src') || '';
    
    // Prefer data-savepage-src if available, otherwise use src
    const imageUrl = dataSrc || src;
    
    // Keep all images (including data URIs)
    if (imageUrl) {
      const alt = node.getAttribute('alt') || '';
      return `![${alt}](${imageUrl})`;
    }
    
    return '';
  }
});

function extractContent(htmlContent) {
  const $ = load(htmlContent);
  
  // Remove unwanted elements but keep images
  $('script, style, nav, header, footer, button').remove();
  
  // Remove presentation images that are tracking pixels (very small)
  $('img[role="presentation"]').each((i, elem) => {
    const $img = $(elem);
    const width = $img.attr('width');
    const height = $img.attr('height');
    // Remove only if it's a 1x1 tracking pixel
    if (width === '1' && height === '1') {
      $img.remove();
    }
  });
  
  // Find the main content
  let $content = $('article').first();
  if ($content.length === 0) {
    $content = $('main').first();
  }
  if ($content.length === 0) {
    $content = $('.content, .main-content, [class*="lesson"]').first();
  }
  if ($content.length === 0) {
    $content = $('body');
  }
  
  // Remove navigation and widgets
  $content.find('[class*="navigation"], [class*="Navigation"], [class*="widget"], [class*="banner"]').remove();
  
  // Remove "We'll cover the following" section more aggressively
  $content.find('*').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    
    // Check for "We'll cover the following" variations
    if (text.match(/^We'?ll cover the following/i) || text.match(/^We will cover the following/i)) {
      // Remove this heading and the next ul/ol if it exists
      let $next = $elem.next();
      if ($next.is('ul, ol')) {
        $next.remove();
      }
      $elem.remove();
    }
  });
  
  // Remove navigation elements at the end (Next, Previous, Mark as Completed, etc.)
  const navTexts = ['Next', 'Previous', 'Mark as Completed', 'Report an Issue', 'Ask a Question', 'Back'];
  
  $content.find('*').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    
    // Check if this matches any navigation text
    if (navTexts.includes(text)) {
      // For "Next" or "Previous", also check if the next element is a title and remove it
      if ((text === 'Next' || text === 'Previous' || text === 'Back') && $elem.next().length > 0) {
        const $next = $elem.next();
        const nextText = $next.text().trim();
        
        // Remove the next element if it's not a main content element (heading, paragraph, table, etc.)
        // and if it contains text (likely a link title)
        if (nextText && nextText.length > 0 && nextText.length < 100 && 
            !$next.is('h1, h2, h3, h4, h5, h6') && 
            !$next.is('p') && 
            !$next.is('table, pre, code, img, ul, ol')) {
          $next.remove();
        }
      }
      $elem.remove();
    }
  });
  
  // Remove any remaining navigation links
  $content.find('a').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    if (navTexts.includes(text)) {
      $elem.remove();
    }
  });
  
  return $content.html() || '';
}

function convertHtmlToMarkdown(htmlFilePath) {
  try {
    const htmlContent = readFileSync(htmlFilePath, 'utf-8');
    const extractedContent = extractContent(htmlContent);
    let markdown = turndownService.turndown(extractedContent);
    
    // Split into lines for cleaning
    let lines = markdown.split('\n');
    
    // Find the last meaningful content (before navigation)
    // Look for common navigation patterns at the end
    let lastContentIndex = lines.length - 1;
    
    // Scan backwards to find where navigation starts
    for (let i = lines.length - 1; i >= 0; i--) {
      const trimmed = lines[i].trim();
      
      // If we find navigation keywords, mark this as the cutoff
      if (trimmed === 'Next' || trimmed === 'Previous' || trimmed === 'Back' ||
          trimmed === 'Mark as Completed' || trimmed === 'Report an Issue' ||
          trimmed === 'Ask a Question') {
        lastContentIndex = i - 1;
        break;
      }
      
      // Also check if this looks like a navigation title (after Next/Previous)
      // Typically short line at the very end
      if (i === lines.length - 1 && trimmed.length > 0 && trimmed.length < 60 && 
          !trimmed.startsWith('#') && !trimmed.includes('**') && 
          !trimmed.startsWith('>') && !trimmed.startsWith('-')) {
        // Check if the previous line is empty or very short
        if (i > 0 && lines[i-1].trim().length === 0) {
          lastContentIndex = i - 2;
          break;
        }
      }
    }
    
    // Keep only lines up to the last content
    lines = lines.slice(0, lastContentIndex + 1);
    
    // Remove navigation keywords
    lines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed !== 'Next' && 
             trimmed !== 'Previous' &&
             trimmed !== 'Back' &&
             trimmed !== 'Mark as Completed' && 
             trimmed !== 'Report an Issue' &&
             !trimmed.match(/^Ask a Question$/);
    });
    
    markdown = lines.join('\n');
    
    // Remove multiple consecutive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    return markdown.trim();
  } catch (error) {
    console.error(`Error converting ${htmlFilePath}:`, error.message);
    return null;
  }
}

function processDirectory(sourceDir, targetDir) {
  const items = readdirSync(sourceDir);
  
  items.forEach(item => {
    const sourcePath = join(sourceDir, item);
    const stat = statSync(sourcePath);
    
    if (stat.isDirectory()) {
      const newTargetDir = join(targetDir, item);
      mkdirSync(newTargetDir, { recursive: true });
      processDirectory(sourcePath, newTargetDir);
    } else if (item.endsWith('.html')) {
      const markdown = convertHtmlToMarkdown(sourcePath);
      if (markdown) {
        const mdFileName = item.replace('.html', '.md');
        const targetPath = join(targetDir, mdFileName);
        writeFileSync(targetPath, markdown, 'utf-8');
        console.log(`✓ Converted: ${item} -> ${mdFileName}`);
      }
    }
  });
}

// Main execution
const sourceDir = join(__dirname, '..', 'public', 'Grokking Modern System Design Interview for Engineers & Managers');
const targetDir = join(__dirname, '..', 'src', 'content', 'system-design');

console.log('Starting HTML to Markdown conversion...\n');
console.log(`Source: ${sourceDir}`);
console.log(`Target: ${targetDir}\n`);

mkdirSync(targetDir, { recursive: true });
processDirectory(sourceDir, targetDir);

console.log('\n✓ Conversion complete!');
