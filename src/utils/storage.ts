import { AppSettings, TranscriptSession } from '../types';

const SETTINGS_KEY = 'cuckoo_voice_settings_v1';
const SESSIONS_KEY = 'cuckoo_voice_sessions_v1';

export const defaultSettings: AppSettings = {
  preferredLanguage: 'auto',
  defaultExportFormat: 'txt',
  silenceThresholdSeconds: 4,
  customVocabulary: [],
  privacyMode: false,
  reducedMotion: false,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getSessions(): TranscriptSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSession(session: TranscriptSession, privacyMode = false): void {
  if (privacyMode) {
    // If privacy mode is enabled, do not persist to localStorage
    return;
  }
  try {
    const sessions = getSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    // Limit stored sessions to 50 for storage safety
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function deleteSession(id: string): void {
  try {
    const sessions = getSessions().filter((s) => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to delete session:', err);
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(SESSIONS_KEY);
  } catch (err) {
    console.error('Failed to clear sessions:', err);
  }
}
