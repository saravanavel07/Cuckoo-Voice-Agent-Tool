# 🐦 CUCKOO VOICE AI

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-98.4%25-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-Express-000000?style=for-the-badge&logo=node.js" alt="Express" />
  <img src="https://img.shields.io/badge/Gemini-AI-8A2BE2?style=for-the-badge&logo=google" alt="Gemini AI" />
</p>

> “Every Voice Finds Its Words.”

A live, motion-driven speech-to-text platform for real-time transcription, multilingual audio workflows, subtitle generation, and AI-powered meeting intelligence.

## ✨ Overview

CUCKOO VOICE AI is a modern web app that turns spoken content into polished, usable output in real time. It combines live microphone capture, audio file transcription, subtitle editing, and smart transcript tools into a single interface.

Built with:
- React 19 + TypeScript
- Vite for frontend tooling
- Express server for API orchestration
- Google Gemini multimodal models for transcription and transcript intelligence
- Browser audio APIs for live mic streaming and waveform animation

## 🎙️ Core Features

### Live microphone transcription
- Real-time speech recognition from the browser microphone
- Live waveform / audio visualization
- Silence detection and voice activity monitoring
- Real-time interim and final transcript updates

### Audio file transcription
- Upload MP3, WAV, WEBM, OGG, M4A, AAC, FLAC audio files
- Supports large audio payloads with a robust backend API
- Generates transcript text and timestamped subtitle segments
- Preserves multilingual output, including Tamil Unicode text

### Smart transcript tools
- Auto-formatting and punctuation cleanup
- Meeting notes extraction
- Executive summary generation
- Action item extraction
- Translation support
- Key point summarization

### Subtitle studio
- Subtitle segment editing
- Timestamp controls for in/out cues
- SRT and VTT export support
- Audio-synced playback workflow

### Session and privacy controls
- Local browser persistence for saved sessions
- Privacy-aware session handling
- Searchable history and transcript management

---

## 🏗️ Architecture

```text
Frontend (React + Vite)
  ├─ Live recorder
  ├─ Audio visualizer
  ├─ Transcript editor
  ├─ Subtitle studio
  └─ Smart tools modal

        │ HTTP / JSON
        ▼
Backend (Express + TypeScript)
  ├─ /api/status
  ├─ /api/transcribe
  ├─ /api/smart-tools
  └─ Static asset serving

        │ Gemini API
        ▼
AI Processing
  ├─ Audio-to-text transcription
  ├─ Multilingual understanding
  ├─ Transcript refinement
  └─ Meeting intelligence output
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- A browser with microphone access enabled
- A Google Gemini API key

### 1) Clone the repo

```bash
git clone https://github.com/saravanavel07/Cuckoo-Voice-Agent-Tool.git
cd Cuckoo-Voice-Agent-Tool
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
```

### 4) Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## 📦 Project Structure

```text
Cuckoo-Voice-Agent-Tool/
├── src/
│   ├── components/
│   ├── utils/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
├── docs/
├── server.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── requirements.txt
├── docker-compose.yml
├── index.html
├── metadata.json
├── LICENSE
├── CONTRIBUTING.md
├── README.md
└── .github/
```

---

## 🔌 API Endpoints

### `GET /api/status`
Returns app metadata, supported languages, and product status information.

### `POST /api/transcribe`
Accepts audio payloads and returns:
- transcript text
- detected language
- duration estimate
- subtitle-like segment array

### `POST /api/smart-tools`
Performs transcript enhancement tasks such as:
- punctuation
- summary
- action_items
- meeting_notes
- key_points
- translate

---

## 🧪 Running Tests

```bash
npm test
```

---

## 🐳 Docker

### Docker Compose

```bash
docker-compose up --build
```

### Manual Docker

```bash
docker build -t cuckoo-voice-ai .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" cuckoo-voice-ai
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `GEMINI_API_KEY` | Yes | API key used for Gemini-powered transcription and AI tools |
| `PORT` | No | Server port (default: `3000`) |

---

## 📄 License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## 🌱 Notes

This repository is designed for voice-first workflows and is especially suited for:
- interview transcription
- meetings and notes
- multilingual subtitle generation
- voice-driven productivity workflows

If you want, I can also create a second version of this README with a more premium product-style layout, a darker neon UI theme, or a GitHub landing-page style version.
