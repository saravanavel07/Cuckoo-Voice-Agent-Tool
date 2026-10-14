import React, { useState } from 'react';
import { TranscriptSession } from '../types';
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  Download,
  Calendar,
  Clock,
  FileText,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { downloadFile } from '../utils/subtitleUtils';

interface HistoryScreenProps {
  sessions: TranscriptSession[];
  onOpenSession: (session: TranscriptSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  privacyMode: boolean;
  onTogglePrivacyMode: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  sessions,
  onOpenSession,
  onDeleteSession,
  onClearAll,
  privacyMode,
  onTogglePrivacyMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.text.toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q)
    );
  });

  const handleStartRename = (session: TranscriptSession) => {
    setEditingId(session.id);
    setEditedTitle(session.title);
  };

  const handleSaveRename = (session: TranscriptSession) => {
    session.title = editedTitle.trim() || 'Untitled Session';
    setEditingId(null);
  };

  const handleQuickExport = (session: TranscriptSession) => {
    downloadFile(session.text, `${session.title || 'cuckoo_transcript'}.txt`, 'text/plain;charset=utf-8');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#123D25]/40 border border-[#159447]/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#65E62E]/10 border border-[#65E62E]/30 flex items-center justify-center text-[#65E62E]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F4FFF1]">Transcription History</h2>
            <p className="text-xs text-[#F4FFF1]/60">
              Locally stored sessions on this device
            </p>
          </div>
        </div>

        {/* Privacy Mode Toggle & Clear All */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePrivacyMode}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              privacyMode
                ? 'bg-emerald-950 border-[#65E62E] text-[#8AFF42]'
                : 'bg-[#123D25] border-[#159447]/40 text-[#F4FFF1]/70 hover:text-[#8AFF42]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#65E62E]" />
            <span>{privacyMode ? 'Privacy Mode ON' : 'Privacy Mode OFF'}</span>
          </button>

          {sessions.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#123D25] border border-red-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#F4FFF1] mb-1">Clear All History?</h4>
            <p className="text-xs text-[#F4FFF1]/70 mb-5">
              This will permanently delete all {sessions.length} saved transcript sessions from this browser.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#082D19] border border-[#159447]/40 text-[#F4FFF1] text-xs font-semibold hover:bg-[#159447]/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8AFF42] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search past sessions by title, transcript text, or language..."
          className="w-full bg-[#123D25]/40 border border-[#159447]/40 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#F4FFF1] placeholder-[#F4FFF1]/40 focus:outline-none focus:border-[#65E62E]"
        />
      </div>

      {/* Sessions List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#123D25]/20 border border-[#159447]/30 text-center flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-[#159447] mb-3 opacity-60" />
          <h4 className="text-base font-semibold text-[#F4FFF1] mb-1">
            {searchQuery ? 'No matching sessions found' : 'No saved transcripts yet'}
          </h4>
          <p className="text-xs text-[#F4FFF1]/60 max-w-sm">
            {searchQuery
              ? 'Try different keywords or clear your search query.'
              : 'Record speech or upload audio files to start building your voice transcript history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-2xl bg-[#123D25]/40 hover:bg-[#123D25]/60 border border-[#159447]/30 hover:border-[#65E62E]/40 transition-all shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                {/* Title (editable) */}
                <div className="flex items-center gap-2">
                  {editingId === session.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="bg-[#082D19] border border-[#65E62E] text-[#8AFF42] text-sm font-semibold rounded-lg px-2.5 py-1 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(session)}
                        className="p-1 text-[#65E62E]"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#F4FFF1]">{session.title}</h4>
                      <button
                        onClick={() => handleStartRename(session)}
                        className="text-[#F4FFF1]/40 hover:text-[#8AFF42] transition-colors"
                        title="Rename session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#159447]/30 text-[#8AFF42] border border-[#65E62E]/30">
                    {session.language || 'English'}
                  </span>
                </div>

                {/* Date & Duration metadata */}
                <div className="flex items-center gap-3 text-xs text-[#F4FFF1]/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#65E62E]" />
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#65E62E]" />
                    {session.durationSeconds}s
                  </span>
                </div>
              </div>

              {/* Text Preview */}
              <p className="text-xs text-[#F4FFF1]/70 line-clamp-2 leading-relaxed mb-3 font-sans">
                {session.text || '(Empty transcript)'}
              </p>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#159447]/20">
                <span className="text-[11px] text-[#8AFF42]/70">
                  {session.text.trim().split(/\s+/).filter(Boolean).length} words
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickExport(session)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#082D19] hover:bg-[#159447]/40 text-[#8AFF42] border border-[#159447]/40 text-xs transition-colors"
                    title="Export as TXT"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={() => onOpenSession(session)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#65E62E] hover:bg-[#8AFF42] text-[#082D19] text-xs font-bold transition-colors shadow-sm"
                  >
                    <span>Open in Editor</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
