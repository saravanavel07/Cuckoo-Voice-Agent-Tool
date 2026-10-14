import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Search,
  Undo2,
  Redo2,
  Trash2,
  Clock,
  FileText,
  Languages,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface TranscriptEditorProps {
  text: string;
  onChangeText: (newText: string) => void;
  language?: string;
  confidence?: number;
  onOpenSmartTools: () => void;
  onOpenExport: () => void;
  isLiveActive?: boolean;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  text,
  onChangeText,
  language = 'English',
  confidence = 0.96,
  onOpenSmartTools,
  onOpenExport,
  isLiveActive = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Undo/Redo history stacks
  const [historyStack, setHistoryStack] = useState<string[]>([text]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Synchronize history when external text updates significantly
  useEffect(() => {
    if (text !== historyStack[historyIndex]) {
      const newStack = historyStack.slice(0, historyIndex + 1);
      newStack.push(text);
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    }
  }, [text]);

  const handleTextChange = (newVal: string) => {
    onChangeText(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      onChangeText(historyStack[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      onChangeText(historyStack[nextIdx]);
    }
  };

  const handleCopyAll = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClear = () => {
    onChangeText('');
    setShowClearConfirm(false);
  };

  // Metrics
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;
  const readingTimeMin = Math.ceil(wordCount / 180);

  // Count search query occurrences
  const searchMatches = searchQuery.trim()
    ? (text.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    : 0;

  return (
    <div className="flex flex-col h-full bg-[#123D25]/40 rounded-3xl border border-[#159447]/30 shadow-lg overflow-hidden backdrop-blur-md">
      {/* Editor Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-[#082D19]/60 border-b border-[#159447]/30 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8AFF42] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#65E62E]" />
            <span>Transcript</span>
          </span>

          {language && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#159447]/30 text-[#8AFF42] border border-[#65E62E]/30 font-medium">
              {language}
            </span>
          )}

          {confidence && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#65E62E]/10 text-[#8AFF42] border border-[#65E62E]/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#65E62E]" />
              <span>{Math.round(confidence * 100)}% accuracy</span>
            </span>
          )}

          {isLiveActive && (
            <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium animate-pulse ml-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Listening...</span>
            </span>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg bg-[#123D25] hover:bg-[#159447]/50 text-[#F4FFF1]/80 hover:text-[#8AFF42] border border-[#159447]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= historyStack.length - 1}
            className="p-1.5 rounded-lg bg-[#123D25] hover:bg-[#159447]/50 text-[#F4FFF1]/80 hover:text-[#8AFF42] border border-[#159447]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Search toggle */}
          <button
            onClick={() => setIsSearching(!isSearching)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSearching
                ? 'bg-[#159447] text-[#F4FFF1] border-[#65E62E]'
                : 'bg-[#123D25] hover:bg-[#159447]/50 text-[#F4FFF1]/80 border-[#159447]/40'
            }`}
            title="Search transcript"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Copy all */}
          <button
            onClick={handleCopyAll}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#123D25] hover:bg-[#159447]/60 text-[#8AFF42] border border-[#65E62E]/30 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            title="Copy entire text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#65E62E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Smart AI Tools button */}
          <button
            onClick={onOpenSmartTools}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#159447] to-[#123D25] hover:from-[#65E62E]/30 hover:to-[#159447]/50 text-[#8AFF42] border border-[#65E62E]/40 text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8AFF42]" />
            <span>Smart Tools</span>
          </button>

          {/* Export button */}
          <button
            onClick={onOpenExport}
            disabled={!text}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#65E62E] hover:bg-[#8AFF42] text-[#082D19] font-bold text-xs disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
          >
            <span>Export</span>
          </button>

          {/* Clear button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={!text}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 disabled:opacity-30 transition-colors"
            title="Clear transcript"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-Editor Search Bar */}
      {isSearching && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#082D19]/80 border-b border-[#159447]/30">
          <Search className="w-4 h-4 text-[#8AFF42]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words, phrases, or Tamil terms..."
            className="flex-1 bg-transparent text-sm text-[#F4FFF1] placeholder-[#F4FFF1]/40 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <span className="text-xs text-[#8AFF42] font-mono">
              {searchMatches} {searchMatches === 1 ? 'match' : 'matches'}
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearching(false);
            }}
            className="text-xs text-[#F4FFF1]/60 hover:text-[#F4FFF1]"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Text Area */}
      <div className="flex-1 p-4 relative flex flex-col min-h-[300px]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Transcribed voice will appear here in real time. You can also type, correct, or paste audio transcripts freely..."
          className="w-full flex-1 bg-transparent text-base leading-relaxed text-[#F4FFF1] placeholder-[#F4FFF1]/30 focus:outline-none resize-none font-normal selection:bg-[#65E62E]/30"
          dir="auto"
        />

        {/* Clear Confirmation Modal / Banner */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-[#082D19]/90 backdrop-blur-sm flex items-center justify-center p-6 z-20">
            <div className="bg-[#123D25] border border-red-500/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#F4FFF1] mb-1">Clear Transcript?</h4>
              <p className="text-xs text-[#F4FFF1]/70 mb-5">
                This will erase the current text. You can undo this action with the Undo button if needed.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-[#082D19] border border-[#159447]/40 text-[#F4FFF1] text-xs font-semibold hover:bg-[#159447]/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                >
                  Clear Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer Metrics */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#082D19]/50 border-t border-[#159447]/20 text-xs text-[#F4FFF1]/60">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-[#8AFF42] font-mono">{wordCount}</strong> words
          </span>
          <span>
            <strong className="text-[#8AFF42] font-mono">{charCount}</strong> characters
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#65E62E]" />
            ~{readingTimeMin} min read
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#F4FFF1]/50">
          <span>Auto-draft saved</span>
        </div>
      </div>
    </div>
  );
};
