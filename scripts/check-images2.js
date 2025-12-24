import { readFileSync } from 'fs';
import { load } from 'cheerio';

const html = readFileSync('public/Grokking Modern System Design Interview for Engineers & Managers/7. Domain Name System/2. How the Domain Name System Works.html', 'utf-8');
const $ = load(html);

let $content = $('article, main, .content, [class*=lesson]').first();
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
  
  if (width !== '1' || height !== '1') {
    images.push({
      alt,
      width,
      height,
      srcType: src?.startsWith('data:') ? 'data URI' : src?.startsWith('http') ? 'URL' : 'other',
      srcLength: src?.length || 0
    });
  }
});

console.log(`Found ${images.length} content images (not tracking pixels)`);
images.forEach((img, i) => {
  console.log(`\n${i+1}. Alt: ${img.alt}`);
  console.log(`   Size: ${img.width}x${img.height}`);
  console.log(`   Type: ${img.srcType} (${img.srcLength} chars)`);
});
