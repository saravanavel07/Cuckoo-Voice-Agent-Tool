# 🐦 CUCKOO VOICE AI
> **“Every Voice Finds Its Words.”**
> An Advanced AI-Powered Speech-to-Text Platform

---

## 🌿 Project Overview

**CUCKOO VOICE AI** is a professional, high-fidelity Speech-to-Text web application combining acoustic intelligence with an organic, nature-inspired visual identity. The singing cuckoo bird forms the signature microphone emblem—symbolizing natural communication, vocal expression, and clarity.

The platform provides zero-latency continuous live microphone streaming, file-based audio transcription with millisecond timestamp synchronization, native **English** and authentic **Tamil (தமிழ்) Unicode** recognition, a dedicated **Subtitle Studio (SRT / VTT)**, and intelligent post-processing meeting tools.

---

## 🎨 Visual Identity & Palette

Crafted on a textured emerald-and-leaf palette inspired by lush forest canopies:

| Color Name | Hex Code | Purpose |
|---|---|---|
| **Live Leaf Green** | `#65E62E` | Primary accent, reactive waveform, active glows |
| **Fresh Lime Green** | `#8AFF42` | Highlights, badges, typography contrast |
| **Emerald Green** | `#159447` | Secondary surfaces, borders, button gradients |
| **Deep Forest Green** | `#082D19` | Root foundation, canvas background |
| **Text White** | `#F4FFF1` | High-contrast readable typography |
| **Soft Green Surface** | `#123D25` | Cards, toolbar backdrops, navigation tabs |

---

## ✨ Key Features

### 1. 🎙️ Live Microphone Streaming
- Real-time speech recognition with continuous interim and final text.
- Large interactive **Singing Cuckoo** microphone button with animated beak vibration and expanding sound waves.
- **Audio Visualizer**: Sinusoidal frequency waves reacting directly to acoustic input via Web Audio API.
- **Smart Silence Detection**: Detects prolonged silence thresholds (configurable 2s–10s) with non-intrusive status guidance.
- **Voice Activity Detection (VAD)**: Real-time speech activity detection tags.

### 2. 📂 Audio File Transcription
- Drag-and-drop support for **MP3, WAV, WEBM, OGG, M4A, AAC, and FLAC** up to 25MB.
- Audio playback preview with timeline and cancellation controls.
- Automatic segment segmentation with speaker labels and confidence scoring.

### 3. 🌐 Multilingual & Tamil Unicode
- Native support for **English**, **Tamil (தமிழ்)**, Spanish, French, German, and Hindi.
- Authentic Tamil Unicode text rendering, preserving original script without garbling or romanization.

### 4. 🎬 Subtitle Studio
- Interactive subtitle segment editor with `IN` and `OUT` timestamp accuracy.
- **Audio-Synced Playback**: Clicking any segment seeks playback; current subtitle line highlights in real time.
- Direct export to **.SRT (SubRip)** and **.VTT (WebVTT)**.

### 5. 🧠 Smart Meeting & Text Tools
- **Meeting Notes**: Auto-formats into Objective, Discussion Points, Decisions, and Action Items.
- **Action Items**: Extracts actionable tasks with assignees and checkboxes.
- **Executive Summary**: Brief summaries and key takeaways.
- **Polish & Punctuation**: Removes filler stutters, corrects capitalization, and improves paragraph flow.
- **Translation**: Translates transcripts between languages with authentic Tamil Unicode support.
- **Side-by-Side Review**: Compare original transcript and AI output before applying.

### 6. 🛡️ Privacy & Local Persistence
- Stored locally via browser storage by default—no recordings are stored without user consent.
- **Session Privacy Mode**: Toggle temporary sessions that never write to persistent storage.
- Searchable session history with rename, quick export, and one-click deletion.

---

## 🏛️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   CUCKOO CLIENT (SPA)                   │
│   React 19 + Tailwind CSS + Web Audio Analyser Node    │
│   Web Speech API (Interim) + Canvas Reactive Waves     │
└───────────────┬──────────────────────────┬─────────────┘
                │                          │
        HTTP / JSON               WebSocket / Audio
                │                          │
┌───────────────▼──────────────────────────▼─────────────┐
│                 EXPRESS / FASTAPI BACKEND               │
│         /api/transcribe      /api/smart-tools          │
│         /api/status          Audio Pre-processing      │
└───────────────┬──────────────────────────┬─────────────┘
                │                          │
┌───────────────▼───────────┐  ┌───────────▼─────────────┐
│    Gemini Multimodal AI   │  │   Local Faster-Whisper  │
│  (Multilingual & Audio)   │  │   (Offline CPU/GPU STT) │
└───────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- Modern web browser (Chrome, Edge, Firefox, Safari) with microphone permissions enabled.

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-org/cuckoo-voice-ai.git
cd cuckoo-voice-ai
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Provide your `GEMINI_API_KEY`:
```ini
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

You can containerize Cuckoo Voice AI with Docker:

```bash
# Build the Docker image
docker build -t cuckoo-voice-ai .

# Run container on port 3000
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" cuckoo-voice-ai
```

Or using Docker Compose:
```bash
docker-compose up --build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Space</kbd> | Start / Pause live microphone recording |
| <kbd>Ctrl + C</kbd> | Copy entire transcript text |
| <kbd>Ctrl + F</kbd> | Open in-editor search bar |
| <kbd>Ctrl + Z</kbd> | Undo transcript edit |
| <kbd>Ctrl + Y</kbd> | Redo transcript edit |
| <kbd>Ctrl + E</kbd> | Open Export dialog (TXT, SRT, VTT, JSON, MD) |
| <kbd>Ctrl + S</kbd> | Open Smart Meeting Tools modal |
| <kbd>Esc</kbd> | Close active modal |

---

## 🧪 Testing

Automated test suites verify subtitle time formatting, VTT/SRT syntax generation, and schema validation:
```bash
npm test
```

---

## 📄 License
Released under the [Apache 2.0 License](LICENSE).
