import { DEMO_TEXT } from '../constants/theme';

const GROQ_API_KEY = 'gsk_your_key_here'; 
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'meta-llama/llama-4-scout-17b-16e-instruct';

export async function analyzeBrailleImage(base64Image) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: `You are a Braille translator. You ONLY output English translations of Braille text.
STRICT RULES:
1. Output ONLY the translated English words — nothing else
2. Never start with "The image", "This shows", "The Braille", "I can see", "Here is", "Translation:"
3. Never describe the image or mention dots, cells, or Braille
4. One sentence per line
5. Start your response with the very first English word of the translation
6. If unclear, write your best guess of what the text says`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high',
                },
              },
              {
                type: 'text',
                text: `Translate this Braille image to English.

Braille alphabet reference:
a=1, b=12, c=14, d=145, e=15, f=124, g=1245, h=125, i=24, j=245
k=13, l=123, m=134, n=1345, o=135, p=1234, q=12345, r=1235, s=234, t=2345
u=136, v=1236, w=2456, x=1346, y=13456, z=1356
(numbers = dot positions that are raised in each 2x3 cell)

Read each Braille cell left to right, top to bottom.
Output ONLY the English translation — first word immediately, no introduction.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Groq error:', JSON.stringify(data));
      throw new Error('Groq API error ' + response.status);
    }

    const raw = data.choices?.[0]?.message?.content || '';

    // Clean any preamble that slipped through
    const cleaned = raw
      .trim()
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .filter(l => {
        const low = l.toLowerCase();
        return !low.startsWith('the image') &&
               !low.startsWith('this image') &&
               !low.startsWith('the braille') &&
               !low.startsWith('the text') &&
               !low.startsWith('the following') &&
               !low.startsWith('i can') &&
               !low.startsWith('i see') &&
               !low.startsWith('here is') &&
               !low.startsWith('here are') &&
               !low.startsWith('translation') &&
               !low.startsWith('based on') &&
               !low.startsWith('looking at') &&
               !low.startsWith('in this') &&
               !low.startsWith('this appears') &&
               !low.startsWith('it appears') &&
               !low.startsWith('it reads') &&
               !low.startsWith('it says') &&
               !low.includes('braille text') &&
               !low.includes('braille cells') &&
               !low.includes('braille reads') &&
               !low.includes('dot pattern') &&
               !low.includes('raised dots') &&
               !low.includes('translates to') &&
               !low.includes('reads as') &&
               !low.includes('which reads') &&
               !low.includes('which says');
      });

    return cleaned.length > 0 ? cleaned.join('\n') : DEMO_TEXT;

  } catch (err) {
    console.warn('Groq failed:', err.message);
    return DEMO_TEXT;
  }
}

export function parseLinesToWords(text) {
  return text
    .trim()
    .split('\n')
    .filter(l => l.trim())
    .join(' ')
    .replace(/[^a-zA-Z ]/g, '')
    .split(' ')
    .filter(Boolean);
}

export function getScoreColor(score) {
  if (score >= 80) return '#43e97b';
  if (score >= 65) return '#f7971e';
  return '#ff6584';
}

export function calculateScore(wordStates, total) {
  const errors  = Object.values(wordStates).filter(s => s === 'error').length;
  const partial = Object.values(wordStates).filter(s => s === 'partial').length;
  const correct = total - errors - partial;
  return {
    score:   Math.round(((correct + partial * 0.5) / total) * 100),
    correct, errors, partial, total,
  };
}