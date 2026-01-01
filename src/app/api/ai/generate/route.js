/**
 * AI Content Generation API Route
 * Uses Groq's free LLM API for generating title, excerpt, and tags
 */

import { NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request) {
  try {
    const { content, type } = await request.json();
    
    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Content must be at least 50 characters to generate suggestions' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Truncate content to avoid token limits (roughly 4000 chars)
    const truncatedContent = content.slice(0, 4000);

    let prompt;
    let responseFormat;

    if (type === 'title') {
      prompt = `Based on the following blog post content, generate 3 compelling, SEO-friendly title options. Each title should be engaging, clear, and under 60 characters.

Content:
${truncatedContent}

Respond with ONLY a JSON array of 3 title strings, no explanation. Example: ["Title 1", "Title 2", "Title 3"]`;
      responseFormat = 'titles';
    } else if (type === 'excerpt') {
      prompt = `Based on the following blog post content, write a compelling excerpt/meta description. It should:
- Be 150-160 characters max
- Summarize the key value proposition
- Be engaging and encourage clicks
- Not include the title

Content:
${truncatedContent}

Respond with ONLY the excerpt text, no quotes or explanation.`;
      responseFormat = 'excerpt';
    } else if (type === 'tags') {
      prompt = `You are an SEO expert. Based on the following blog post content, generate 6-10 high-impact SEO keywords/tags that will help this article rank higher in search engines.

Requirements for tags:
1. Include 2-3 PRIMARY keywords (high search volume, directly related to main topic)
2. Include 2-3 LONG-TAIL keywords (specific phrases people actually search for)
3. Include 2-3 RELATED/LSI keywords (semantically related terms that boost relevance)
4. All tags should be lowercase
5. Each tag should be 1-4 words max
6. Focus on keywords people actually type into Google
7. Prioritize keywords with search intent (informational, how-to, tutorial, guide, etc.)

Examples of good SEO tags:
- Primary: "react hooks", "javascript tutorial"
- Long-tail: "how to use useeffect", "react state management guide"
- LSI: "frontend development", "web app optimization"

Content:
${truncatedContent}

Respond with ONLY a JSON array of tag strings ordered by SEO importance (most important first). Example: ["react hooks tutorial", "usestate guide", "react for beginners", "javascript state management", "frontend development", "web development 2024"]`;
      responseFormat = 'tags';
    } else if (type === 'all') {
      prompt = `You are an SEO expert. Based on the following blog post content, generate optimized metadata that will help this article rank #1 in search engines.

Generate:
1. A compelling, click-worthy title (under 60 characters) that includes the main keyword
2. A meta description (150-160 characters) that includes keywords and a call-to-action
3. 6-10 high-impact SEO tags including:
   - 2-3 primary keywords (high search volume)
   - 2-3 long-tail keywords (specific search phrases)
   - 2-3 LSI/related keywords (semantic relevance)

Content:
${truncatedContent}

Respond with ONLY valid JSON in this exact format:
{
  "title": "Your SEO-optimized title here",
  "excerpt": "Your 150-160 character meta description with keywords and CTA",
  "tags": ["primary keyword", "long-tail phrase", "related term", "etc"]
}`;
      responseFormat = 'all';
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use: title, excerpt, tags, or all' },
        { status: 400 }
      );
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates SEO-optimized blog content. Always respond with the exact format requested, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate content. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    // Parse the response based on type
    let result;
    try {
      if (responseFormat === 'titles' || responseFormat === 'tags') {
        result = JSON.parse(generatedText);
      } else if (responseFormat === 'all') {
        result = JSON.parse(generatedText);
      } else {
        result = generatedText;
      }
    } catch (parseError) {
      // If JSON parsing fails, return raw text
      result = generatedText;
    }

    return NextResponse.json({ result, type: responseFormat });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
