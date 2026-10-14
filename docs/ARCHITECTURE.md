# CUCKOO VOICE AI — System Architecture & Design

## 1. High-Level Architecture

Cuckoo Voice AI is architected as an event-driven, hybrid acoustic processing platform combining:
1. **Zero-Latency In-Browser Audio Stream Pipeline:** Web Audio API (`AudioContext`, `AnalyserNode`) and browser-level `webkitSpeechRecognition` for immediate streaming user feedback.
2. **High-Accuracy Multimodal Transcription Backend:** Node.js/Express server orchestrating Google GenAI (`gemini-2.5-flash`, `gemini-3.8-flash`) to perform audio processing, segment extraction, speaker diarization, and meeting structuring.
3. **Local Offline Alternative (Faster-Whisper):** A documented Python backend pipeline (`app/services/transcription.py`) for users deploying fully on-premise without cloud APIs.

```
+-------------------------------------------------------------------+
|                        Client Layer (React)                       |
|  - LiveRecorder (AudioContext + AnalyserNode + WebSpeech)         |
|  - SubtitleStudio (Synced Audio & Segment Scrubber)              |
|  - Intelligent Transcript Editor (Undo/Redo, Search, Diarization) |
|  - ParticleCanvas (Ambient Drifting Leaf Particles)               |
+---------------------------------+---------------------------------+
                                  |
               HTTPS JSON Payload / Base64 Audio
                                  |
+---------------------------------v---------------------------------+
|                       Server Layer (Express)                      |
|  - /api/transcribe: Audio decoding & Multimodal STT               |
|  - /api/smart-tools: Punctuation, Summary, Action items, Translate|
|  - /api/status: Engine diagnostics and model readiness            |
+---------------------------------+---------------------------------+
                                  |
+---------------------------------v---------------------------------+
|                  AI Model Engine (Gemini 2.5/3.8)                 |
|  - Timestamped segments with start/end millisecond precision      |
|  - Multi-speaker identification (diarization)                     |
|  - Authentic Tamil Unicode and Multilingual Script generation     |
+-------------------------------------------------------------------+
```

## 2. Audio Pipeline Flow

1. **Capture:** Browser captures input via `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. **VAD & Silence Detection:** An `AnalyserNode` continuously computes Root Mean Square (RMS) energy. When energy falls below `0.08` for `silenceThresholdSeconds`, prolonged silence warning emits.
3. **Encoding & Transmission:** `MediaRecorder` collects compressed audio frames into Blobs and encodes to Base64 upon completion.
4. **Processing & Alignment:** The server forwards the audio payload to the AI model with structured JSON schemas specifying timestamp bounds and confidence scores.
5. **Subtitle Sync:** Segments are mapped into SubRip (`.srt`) and WebVTT (`.vtt`) time representations `00:00:00,000` / `00:00:00.000`.

## 3. Security & Data Protection

- Transcripts and audio remain isolated in browser memory and local storage unless the user explicitly requests an export or AI transformation.
- **Privacy Mode:** When active, skips all `localStorage` writes.
- API keys are strictly retained on the backend; the client never exposes credentials.
