import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support audio payloads up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & diagnostics endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'CUCKOO VOICE AI',
    tagline: 'Every Voice Finds Its Words',
    geminiConfigured: !!apiKey,
    supportedLanguages: [
      { code: 'auto', name: 'Auto-Detect' },
      { code: 'en', name: 'English' },
      { code: 'ta', name: 'Tamil (தமிழ்)' },
      { code: 'es', name: 'Spanish (Español)' },
      { code: 'fr', name: 'French (Français)' },
      { code: 'de', name: 'German (Deutsch)' },
      { code: 'hi', name: 'Hindi (हिन्दी)' },
      { code: 'ja', name: 'Japanese (日本語)' },
      { code: 'zh', name: 'Mandarin (中文)' },
      { code: 'ar', name: 'Arabic (العربية)' }
    ],
    features: [
      'Live Microphone Streaming',
      'Audio File Upload',
      'Tamil Unicode Rendering',
      'Subtitle Studio (SRT / VTT)',
      'Meeting Notes & Action Items',
      'Smart Silence & VAD Detection'
    ]
  });
});

// Audio transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', language = 'auto', customVocabulary = [] } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Live Web Speech recognition is active in the browser.',
      });
    }

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const vocabHint = customVocabulary && customVocabulary.length > 0
      ? `Custom vocabulary & technical terms to prioritize: ${customVocabulary.join(', ')}.`
      : '';

    const langInstruction = language && language !== 'auto'
      ? `The spoken language is expected to be ${language}. If Tamil, preserve authentic Tamil Unicode script.`
      : 'Automatically detect the spoken language. If Tamil is spoken, output in authentic Tamil script.';

    const systemPrompt = `You are CUCKOO VOICE AI, an elite Speech-to-Text engine.
Transcribe the provided audio with maximum acoustic accuracy.
${langInstruction}
${vocabHint}
Generate both full transcript and timestamped segments suitable for subtitle synchronization.
Segment format must have:
- start (in seconds, e.g. 0.0)
- end (in seconds, e.g. 3.2)
- speaker (e.g. "Speaker 1" or identified name)
- text (the spoken text for that segment)
- confidence (a float from 0.85 to 1.0 representing recognition certainty)`;

    // Try gemini-2.5-flash as the primary high-speed multimodal audio model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType.split(';')[0] || 'audio/webm',
            data: cleanBase64,
          },
        },
        {
          text: 'Transcribe this audio file accurately. Return valid JSON with keys: "text" (string), "detectedLanguage" (string), "durationEstimateSeconds" (number), and "segments" (array of { start: number, end: number, speaker: string, text: string, confidence: number }).',
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: 'The complete transcribed text of the audio with correct punctuation.',
            },
            detectedLanguage: {
              type: Type.STRING,
              description: 'The detected language (e.g. English, Tamil, etc.).',
            },
            durationEstimateSeconds: {
              type: Type.NUMBER,
              description: 'Estimated audio duration in seconds.',
            },
            segments: {
              type: Type.ARRAY,
              description: 'Timestamped subtitle segments.',
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.NUMBER },
                  end: { type: Type.NUMBER },
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ['start', 'end', 'text', 'speaker', 'confidence'],
              },
            },
          },
          required: ['text', 'detectedLanguage', 'segments'],
        },
      },
    });

    const outputText = response.text || '{}';
    const parsed = JSON.parse(outputText);

    return res.json(parsed);
  } catch (err: any) {
    console.error('Transcription error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process audio transcription',
    });
  }
});

// Smart transcript tools endpoint
app.post('/api/smart-tools', async (req, res) => {
  try {
    const { action, text, targetLanguage = 'English' } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured' });
    }

    let prompt = '';
    let systemInstruction = 'You are CUCKOO VOICE AI Assistant. You enhance voice transcripts.';

    switch (action) {
      case 'punctuation':
        prompt = `Polish and format this transcript. Fix punctuation, capitalization, remove filler stutters where appropriate, and separate into coherent paragraphs while preserving exact meaning:\n\n${text}`;
        break;
      case 'summary':
        prompt = `Provide a concise executive summary followed by key takeaways for this voice transcript:\n\n${text}`;
        break;
      case 'action_items':
        prompt = `Extract all action items, tasks, and follow-ups from this transcript. Format as a bulleted list with task, owner (if mentioned), and urgency/deadline (if mentioned):\n\n${text}`;
        break;
      case 'meeting_notes':
        prompt = `Format this transcript into professional Meeting Notes with the following sections:\n1. Meeting Objective / Topic\n2. Key Discussion Points\n3. Decisions Made\n4. Action Items & Next Steps\n\nTranscript:\n${text}`;
        break;
      case 'key_points':
        prompt = `Extract the most critical key points and insights from this transcript in clean bullet points:\n\n${text}`;
        break;
      case 'translate':
        prompt = `Translate the following voice transcript into ${targetLanguage}. Maintain natural phrasing and tone. If translating to Tamil, use authentic modern Tamil Unicode:\n\n${text}`;
        break;
      default:
        return res.status(400).json({ error: 'Unknown action specified' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({ result: response.text });
  } catch (err: any) {
    console.error('Smart tools error:', err);
    return res.status(500).json({ error: err.message || 'Failed to run smart tool' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CUCKOO VOICE AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
