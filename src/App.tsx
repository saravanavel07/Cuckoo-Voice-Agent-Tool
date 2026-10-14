import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LiveRecorder } from './components/LiveRecorder';
import { FileUpload } from './components/FileUpload';
import { TranscriptEditor } from './components/TranscriptEditor';
import { SubtitleStudio } from './components/SubtitleStudio';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SmartToolsModal } from './components/SmartToolsModal';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ParticleCanvas } from './components/ParticleCanvas';
import { CuckooLogo } from './components/CuckooLogo';
import { SubtitleSegment, TranscriptSession, AppSettings } from './types';
import {
  getSettings,
  saveSettings,
  getSessions,
  saveSession,
  deleteSession as deleteSessionFromStorage,
  clearAllSessions as clearAllFromStorage,
} from './utils/storage';
import {
  Mic,
  UploadCloud,
  Languages,
  Sparkles,
  BarChart2,
  Clock,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavTab>('transcribe');
  const [transcribeMode, setTranscribeMode] = useState<'live' | 'upload'>('live');

  // Application Settings & Sessions
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [sessions, setSessions] = useState<TranscriptSession[]>(getSessions());

  // Current working session
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(settings.preferredLanguage || 'auto');
  const [sessionTitle, setSessionTitle] = useState<string>('Voice Transcript');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [currentAudioBlobUrl, setCurrentAudioBlobUrl] = useState<string | undefined>(undefined);
  const [confidence, setConfidence] = useState<number>(0.96);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);

  // Modals
  const [isSmartToolsOpen, setIsSmartToolsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    if (newSettings.preferredLanguage) {
      setSelectedLanguage(newSettings.preferredLanguage);
    }
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) && !(e.ctrlKey || e.metaKey)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSmartToolsOpen(true);
      } else if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setIsShortcutsOpen(true);
      } else if (e.key === 'Escape') {
        setIsExportOpen(false);
        setIsSmartToolsOpen(false);
        setIsShortcutsOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update transcript from LiveRecorder
  const handleLiveTranscriptUpdate = (text: string, isFinal: boolean) => {
    setTranscriptText(text);
    setIsLiveActive(!isFinal);
    if (isFinal) {
      // Create or update a segment
      const words = text.trim().split(/\s+/);
      const estDuration = Math.max(2, Math.ceil(words.length * 0.4));
      setDurationSeconds(estDuration);
    }
  };

  // Audio captured from LiveRecorder on completion
  const handleAudioCaptured = (blob: Blob, base64: string, durationSec: number) => {
    const audioUrl = URL.createObjectURL(blob);
    setCurrentAudioBlobUrl(audioUrl);
    setDurationSeconds(durationSec);

    // Save session to history
    const newSession: TranscriptSession = {
      id: `session-${Date.now()}`,
      title: sessionTitle || `Recording ${new Date().toLocaleTimeString()}`,
      createdAt: Date.now(),
      durationSeconds: durationSec,
      language: selectedLanguage === 'auto' ? 'English' : selectedLanguage,
      text: transcriptText,
      segments: segments.length > 0 ? segments : [
        {
          id: `seg-${Date.now()}-0`,
          start: 0,
          end: durationSec || 4,
          speaker: 'Speaker 1',
          text: transcriptText,
          confidence: 0.96,
        },
      ],
      mode: 'live',
      audioBlobUrl: audioUrl,
    };

    saveSession(newSession, settings.privacyMode);
    setSessions(getSessions());
  };

  // File upload transcription success
  const handleUploadSuccess = (result: {
    text: string;
    segments: SubtitleSegment[];
    language: string;
    durationEstimateSeconds: number;
    audioBlobUrl: string;
    filename: string;
  }) => {
    setTranscriptText(result.text);
    setSegments(result.segments);
    setSelectedLanguage(result.language);
    setDurationSeconds(Math.round(result.durationEstimateSeconds));
    setCurrentAudioBlobUrl(result.audioBlobUrl);
    setSessionTitle(result.filename.replace(/\.[^/.]+$/, ''));

    const newSession: TranscriptSession = {
      id: `session-${Date.now()}`,
      title: result.filename,
      createdAt: Date.now(),
      durationSeconds: Math.round(result.durationEstimateSeconds),
      language: result.language,
      text: result.text,
      segments: result.segments,
      mode: 'upload',
      audioBlobUrl: result.audioBlobUrl,
    };

    saveSession(newSession, settings.privacyMode);
    setSessions(getSessions());
  };

  // Open an existing session from history
  const handleOpenSessionFromHistory = (session: TranscriptSession) => {
    setTranscriptText(session.text);
    setSegments(session.segments || []);
    setSelectedLanguage(session.language);
    setSessionTitle(session.title);
    setDurationSeconds(session.durationSeconds);
    setCurrentAudioBlobUrl(session.audioBlobUrl);
    setCurrentTab('transcribe');
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    deleteSessionFromStorage(id);
    setSessions(getSessions());
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    clearAllFromStorage();
    setSessions([]);
  };

  return (
    <div className="relative min-h-screen bg-[#082D19] text-[#F4FFF1] flex flex-col md:flex-row antialiased selection:bg-[#65E62E]/30 selection:text-[#8AFF42]">
      {/* Background Animated Green Particles Canvas */}
      <ParticleCanvas reducedMotion={settings.reducedMotion} />

      {/* Navigation Sidebar */}
      {hasStarted && (
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isRecording={isLiveActive}
          privacyMode={settings.privacyMode}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          isOpenMobile={isMobileSidebarOpen}
          onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col min-h-screen overflow-x-hidden">
        {!hasStarted ? (
          /* Welcome Screen */
          <WelcomeScreen
            onStart={() => {
              setHasStarted(true);
              setCurrentTab('transcribe');
              setTranscribeMode('live');
            }}
            onSelectUpload={() => {
              setHasStarted(true);
              setCurrentTab('transcribe');
              setTranscribeMode('upload');
            }}
          />
        ) : (
          <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#123D25]/30 border border-[#159447]/30 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <CuckooLogo size="sm" isSinging={isLiveActive} glow={isLiveActive} />
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-[#F4FFF1] flex items-center gap-2">
                    <span>CUCKOO VOICE AI</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#159447]/40 text-[#8AFF42] border border-[#65E62E]/30">
                      v2.5
                    </span>
                  </h1>
                  <p className="text-xs text-[#8AFF42]/80">
                    “Every Voice Finds Its Words”
                  </p>
                </div>
              </div>

              {/* Language Selector in top bar */}
              <div className="flex items-center gap-2 bg-[#082D19]/80 border border-[#159447]/40 rounded-2xl px-3 py-1.5 text-xs">
                <Languages className="w-4 h-4 text-[#65E62E]" />
                <span className="text-[#F4FFF1]/60 text-[11px] hidden sm:inline">Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#8AFF42] focus:outline-none cursor-pointer"
                >
                  <option value="auto">Auto-Detect (English / Tamil)</option>
                  <option value="ta">Tamil (தமிழ் Unicode)</option>
                  <option value="en">English (US/UK/Global)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>
            </div>

            {/* View Switcher based on currentTab */}
            {currentTab === 'transcribe' && (
              <div className="space-y-6">
                {/* Mode Selector Tabs: Live Microphone vs Audio Upload */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex p-1.5 rounded-2xl bg-[#082D19]/70 border border-[#159447]/40 backdrop-blur-md shadow-inner">
                    <button
                      onClick={() => setTranscribeMode('live')}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        transcribeMode === 'live'
                          ? 'bg-[#123D25] text-[#8AFF42] border border-[#65E62E]/40 shadow-sm'
                          : 'text-[#F4FFF1]/60 hover:text-[#F4FFF1]'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      <span>Live Microphone</span>
                    </button>

                    <button
                      onClick={() => setTranscribeMode('upload')}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        transcribeMode === 'upload'
                          ? 'bg-[#123D25] text-[#8AFF42] border border-[#65E62E]/40 shadow-sm'
                          : 'text-[#F4FFF1]/60 hover:text-[#F4FFF1]'
                      }`}
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Audio File Upload</span>
                    </button>
                  </div>
                </div>

                {/* Recorder or Upload Area */}
                {transcribeMode === 'live' ? (
                  <LiveRecorder
                    onTranscriptUpdate={handleLiveTranscriptUpdate}
                    onAudioCaptured={handleAudioCaptured}
                    language={selectedLanguage}
                    silenceThresholdSeconds={settings.silenceThresholdSeconds}
                  />
                ) : (
                  <FileUpload
                    onTranscribeSuccess={handleUploadSuccess}
                    language={selectedLanguage}
                    customVocabulary={settings.customVocabulary}
                  />
                )}

                {/* Transcription Editor */}
                <div className="min-h-[420px]">
                  <TranscriptEditor
                    text={transcriptText}
                    onChangeText={setTranscriptText}
                    language={selectedLanguage === 'ta' ? 'Tamil' : selectedLanguage === 'auto' ? 'Auto-Detect' : selectedLanguage}
                    confidence={confidence}
                    onOpenSmartTools={() => setIsSmartToolsOpen(true)}
                    onOpenExport={() => setIsExportOpen(true)}
                    isLiveActive={isLiveActive}
                  />
                </div>
              </div>
            )}

            {currentTab === 'subtitles' && (
              <SubtitleStudio
                segments={segments}
                onChangeSegments={setSegments}
                audioBlobUrl={currentAudioBlobUrl}
                sessionTitle={sessionTitle}
              />
            )}

            {currentTab === 'history' && (
              <HistoryScreen
                sessions={sessions}
                onOpenSession={handleOpenSessionFromHistory}
                onDeleteSession={handleDeleteSession}
                onClearAll={handleClearAllSessions}
                privacyMode={settings.privacyMode}
                onTogglePrivacyMode={() =>
                  handleUpdateSettings({ ...settings, privacyMode: !settings.privacyMode })
                }
              />
            )}

            {currentTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </div>
        )}
      </main>

      {/* Smart Tools Modal */}
      <SmartToolsModal
        isOpen={isSmartToolsOpen}
        onClose={() => setIsSmartToolsOpen(false)}
        originalText={transcriptText}
        onApplyReplacement={(newText) => setTranscriptText(newText)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        text={transcriptText}
        segments={segments}
        metadata={{
          title: sessionTitle,
          language: selectedLanguage,
          durationSeconds,
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
