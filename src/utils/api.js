import { DEMO_TEXT } from '../constants/theme';

const GROQ_API_KEY = 'gsk_your_key_here';

const GROQ_API_URL =
  'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODEL =
  'meta-llama/llama-4-scout-17b-16e-instruct';

export async function analyzeBrailleImage(base64Image) {
  try {
    console.log('Starting Braille analysis...');
    console.log('Image size:', base64Image?.length);

    const payload = {
      model: GROQ_MODEL,
      max_tokens: 1000,
      messages: [
  {
    role: 'system',
    content:
      'You are a Braille OCR system. Never explain your reasoning. Never describe the image. Output only the final English translation. If uncertain use [?].'
  },
  {
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
        }
      },
      {
        type: 'text',
        text: `
Translate the Braille.

Rules:
- Read Braille left-to-right.
- Convert Grade 1 Braille to English.
- Preserve line breaks.
- If a cell is unclear write [?].
- DO NOT explain.
- DO NOT describe the image.
- OUTPUT ONLY THE TRANSLATED TEXT.
`
      }
    ]
  }
]
    };

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('HTTP Status:', response.status);
    console.log(
      'Groq Response:',
      JSON.stringify(data, null, 2)
    );

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          `Groq API error ${response.status}`
      );
    }

    const result =
      data?.choices?.[0]?.message?.content?.trim();

    console.log('Translation:', result);

    return result || DEMO_TEXT;
  } catch (err) {
    console.warn('Groq API failed:', err.message);
    return DEMO_TEXT;
  }
}

export function parseLinesToWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function getScoreColor(score) {
  if (score >= 80) return '#43e97b';
  if (score >= 65) return '#f7971e';
  return '#ff6584';
}

export function calculateScore(wordStates, total) {
  const errors = Object.values(wordStates).filter(
    s => s === 'error'
  ).length;

  const partial = Object.values(wordStates).filter(
    s => s === 'partial'
  ).length;

  const correct = total - errors - partial;

  return {
    score: Math.round(
      ((correct + partial * 0.5) / total) * 100
    ),
    correct,
    errors,
    partial,
    total,
  };
}