export interface SubtitleSegment {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  speaker: string;
  text: string;
  confidence?: number;
}

export interface TranscriptSession {
  id: string;
  title: string;
  createdAt: number;
  durationSeconds: number;
  language: string;
  text: string;
  segments: SubtitleSegment[];
  mode: 'live' | 'upload';
  audioBlobUrl?: string;
  audioBase64?: string;
}

export interface SmartToolResult {
  action: 'summary' | 'action_items' | 'meeting_notes' | 'punctuation' | 'translate' | 'key_points';
  title: string;
  content: string;
  targetLanguage?: string;
}

export interface AppSettings {
  preferredLanguage: string;
  defaultExportFormat: 'txt' | 'srt' | 'vtt' | 'json';
  silenceThresholdSeconds: number;
  customVocabulary: string[];
  privacyMode: boolean; // if true, do not save sessions to storage
  reducedMotion: boolean;
  selectedAudioDeviceId?: string;
}
