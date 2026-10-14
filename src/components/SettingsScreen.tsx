import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import {
  Settings,
  Languages,
  Download,
  Mic,
  Shield,
  EyeOff,
  Activity,
  Plus,
  X,
  Check,
  Server,
  Cpu,
} from 'lucide-react';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [newVocab, setNewVocab] = useState('');
  const [savedNotification, setSavedNotification] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    geminiConfigured: boolean;
    webSpeechAvailable: boolean;
    appName: string;
  }>({
    geminiConfigured: true,
    webSpeechAvailable: false,
    appName: 'CUCKOO VOICE AI',
  });

  useEffect(() => {
    // Check Web Speech API availability
    const hasSpeech = !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    // Fetch diagnostics from server
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setDiagnostics({
          geminiConfigured: data.geminiConfigured,
          webSpeechAvailable: hasSpeech,
          appName: data.appName || 'CUCKOO VOICE AI',
        });
      })
      .catch(() => {
        setDiagnostics((prev) => ({ ...prev, webSpeechAvailable: hasSpeech }));
      });
  }, []);

  const handleChange = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 1500);
  };

  const handleAddVocab = () => {
    if (!newVocab.trim()) return;
    const word = newVocab.trim();
    if (!settings.customVocabulary.includes(word)) {
      handleChange({
        customVocabulary: [...settings.customVocabulary, word],
      });
    }
    setNewVocab('');
  };

  const handleRemoveVocab = (wordToRemove: string) => {
    handleChange({
      customVocabulary: settings.customVocabulary.filter((w) => w !== wordToRemove),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Settings Header */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-[#123D25]/40 border border-[#159447]/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#65E62E]/10 border border-[#65E62E]/30 flex items-center justify-center text-[#65E62E]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F4FFF1]">Settings &amp; Preferences</h2>
            <p className="text-xs text-[#F4FFF1]/60">Configure speech engines, language defaults, and privacy</p>
          </div>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#65E62E]/20 text-[#8AFF42] border border-[#65E62E]/40 text-xs font-semibold animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred Language */}
        <div className="p-5 rounded-3xl bg-[#123D25]/30 border border-[#159447]/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#8AFF42]">
            <Languages className="w-4 h-4 text-[#65E62E]" />
            <span>Default Spoken Language</span>
          </div>
          <p className="text-xs text-[#F4FFF1]/70">
            Set default recognition model hint for live capture and uploads.
          </p>
          <select
            value={settings.preferredLanguage}
            onChange={(e) => handleChange({ preferredLanguage: e.target.value })}
            className="w-full bg-[#082D19] border border-[#159447]/50 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#F4FFF1] focus:outline-none focus:border-[#65E62E]"
          >
            <option value="auto">Auto-Detect Language</option>
            <option value="ta">Tamil (தமிழ் Unicode)</option>
            <option value="en">English (US / UK / Global)</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ja">Japanese (日本語)</option>
          </select>
        </div>

        {/* Default Export Format */}
        <div className="p-5 rounded-3xl bg-[#123D25]/30 border border-[#159447]/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#8AFF42]">
            <Download className="w-4 h-4 text-[#65E62E]" />
            <span>Default Export Format</span>
          </div>
          <p className="text-xs text-[#F4FFF1]/70">
            Select your primary format for quick downloads.
          </p>
          <select
            value={settings.defaultExportFormat}
            onChange={(e) => handleChange({ defaultExportFormat: e.target.value as any })}
            className="w-full bg-[#082D19] border border-[#159447]/50 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#F4FFF1] focus:outline-none focus:border-[#65E62E]"
          >
            <option value="txt">Plain Text (.txt)</option>
            <option value="srt">SubRip Subtitles (.srt)</option>
            <option value="vtt">WebVTT (.vtt)</option>
            <option value="json">Structured JSON (.json)</option>
          </select>
        </div>

        {/* Silence Detection Threshold */}
        <div className="p-5 rounded-3xl bg-[#123D25]/30 border border-[#159447]/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#8AFF42]">
            <Mic className="w-4 h-4 text-[#65E62E]" />
            <span>Silence Detection Trigger ({settings.silenceThresholdSeconds}s)</span>
          </div>
          <p className="text-xs text-[#F4FFF1]/70">
            How many seconds of continuous acoustic silence before showing a gentle indicator.
          </p>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={settings.silenceThresholdSeconds}
            onChange={(e) => handleChange({ silenceThresholdSeconds: parseInt(e.target.value, 10) })}
            className="w-full accent-[#65E62E] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#F4FFF1]/50 font-mono">
            <span>2s (Sensitive)</span>
            <span>4s (Default)</span>
            <span>10s (Patient)</span>
          </div>
        </div>

        {/* Privacy & Motion Preferences */}
        <div className="p-5 rounded-3xl bg-[#123D25]/30 border border-[#159447]/30 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#8AFF42]">
            <Shield className="w-4 h-4 text-[#65E62E]" />
            <span>Privacy &amp; Accessibility</span>
          </div>

          {/* Privacy Mode Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-[#F4FFF1]">Session Privacy Mode</p>
              <p className="text-[11px] text-[#F4FFF1]/60">
                Do not save any transcript history or recordings to browser storage.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.privacyMode}
              onChange={(e) => handleChange({ privacyMode: e.target.checked })}
              className="w-4 h-4 accent-[#65E62E] cursor-pointer"
            />
          </label>

          {/* Reduced Motion Toggle */}
          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#159447]/20">
            <div>
              <p className="text-xs font-semibold text-[#F4FFF1]">Reduced Motion</p>
              <p className="text-[11px] text-[#F4FFF1]/60">
                Disable drifting green particles and intensive decorative wave animations.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => handleChange({ reducedMotion: e.target.checked })}
              className="w-4 h-4 accent-[#65E62E] cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Domain Vocabulary Assistance */}
      <div className="p-5 rounded-3xl bg-[#123D25]/30 border border-[#159447]/30 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#8AFF42]">
          <Activity className="w-4 h-4 text-[#65E62E]" />
          <span>Domain Vocabulary &amp; Proper Nouns</span>
        </div>
        <p className="text-xs text-[#F4FFF1]/70">
          Add specialized industry terms, acronyms, or specific Tamil names that the AI transcription engine should prioritize.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={newVocab}
            onChange={(e) => setNewVocab(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddVocab()}
            placeholder="e.g. Cuckoo, Kubernetes, சிவகாசி, API..."
            className="flex-1 bg-[#082D19] border border-[#159447]/50 rounded-xl px-3.5 py-2 text-xs text-[#F4FFF1] placeholder-[#F4FFF1]/40 focus:outline-none focus:border-[#65E62E]"
          />
          <button
            onClick={handleAddVocab}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#123D25] hover:bg-[#159447] text-[#8AFF42] border border-[#65E62E]/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Term</span>
          </button>
        </div>

        {/* Term Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {settings.customVocabulary.length === 0 ? (
            <span className="text-xs text-[#F4FFF1]/40 italic">
              No custom terms added yet.
            </span>
          ) : (
            settings.customVocabulary.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123D25] border border-[#65E62E]/30 text-xs text-[#8AFF42]"
              >
                <span>{word}</span>
                <button
                  onClick={() => handleRemoveVocab(word)}
                  className="hover:text-red-400 text-[#F4FFF1]/50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* System Diagnostics Card */}
      <div className="p-5 rounded-3xl bg-[#082D19]/60 border border-[#159447]/40 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#8AFF42]">
          <Server className="w-4 h-4 text-[#65E62E]" />
          <span>Engine Status &amp; Diagnostics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#123D25]/50 border border-[#159447]/30 flex items-center justify-between">
            <span className="text-[#F4FFF1]/70">Gemini STT &amp; Smart Tools</span>
            <span className="flex items-center gap-1 text-[#8AFF42] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#65E62E]" />
              {diagnostics.geminiConfigured ? 'Connected & Active' : 'Fallback Mode'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#123D25]/50 border border-[#159447]/30 flex items-center justify-between">
            <span className="text-[#F4FFF1]/70">Browser Web Speech API</span>
            <span className="flex items-center gap-1 text-[#8AFF42] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#65E62E]" />
              {diagnostics.webSpeechAvailable ? 'Available' : 'Emulated'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
