import { readFileSync } from 'fs';
import { load } from 'cheerio';

const html = readFileSync('public/Grokking Modern System Design Interview for Engineers & Managers/1. System Design Interviews/1. What Is a System Design Interview_.html', 'utf-8');
const $ = load(html);

console.log('Looking for images in the main content...\n');

// Find main content
let $content = $('article, main, .content, [class*="lesson"]').first();
if ($content.length === 0) {
  $content = $('body');
}

const images = [];
$content.find('img').each((i, elem) => {
  const $img = $(elem);
  const src = $img.attr('src') || $img.attr('data-savepage-src');
  const alt = $img.attr('alt') || '';
  const width = $img.attr('width') || '';
  const height = $img.attr('height') || '';
  const role = $img.attr('role') || '';
  
  images.push({
    alt,
    width,
    height,
    role,
    srcType: src?.startsWith('data:') ? 'data URI' : src?.startsWith('http') ? 'URL' : 'other',
    srcLength: src?.length || 0
  });
});

console.log(`Found ${images.length} images in content area:`);
images.forEach((img, i) => {
  console.log(`\n${i+1}. Alt: "${img.alt}"`);
  console.log(`   Size: ${img.width}x${img.height}`);
  console.log(`   Role: ${img.role}`);
  console.log(`   Type: ${img.srcType} (${img.srcLength} chars)`);
});
