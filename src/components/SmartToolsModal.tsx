import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  ListChecks,
  Users,
  CheckCircle,
  Copy,
  Check,
  Languages,
  RotateCcw,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface SmartToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onApplyReplacement: (newText: string) => void;
}

type SmartToolType = 'punctuation' | 'summary' | 'action_items' | 'meeting_notes' | 'key_points' | 'translate';

export const SmartToolsModal: React.FC<SmartToolsModalProps> = ({
  isOpen,
  onClose,
  originalText,
  onApplyReplacement,
}) => {
  const [selectedTool, setSelectedTool] = useState<SmartToolType>('meeting_notes');
  const [targetLang, setTargetLang] = useState<string>('Tamil');
  const [isLoading, setIsLoading] = useState(false);
  const [toolResult, setToolResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const tools: { id: SmartToolType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'meeting_notes',
      label: 'Meeting Notes',
      icon: <Users className="w-4 h-4" />,
      desc: 'Structure into Agenda, Decisions, and Next Steps',
    },
    {
      id: 'action_items',
      label: 'Action Items',
      icon: <ListChecks className="w-4 h-4" />,
      desc: 'Extract actionable to-dos with assignees',
    },
    {
      id: 'summary',
      label: 'Executive Summary',
      icon: <FileText className="w-4 h-4" />,
      desc: 'Concise executive briefing and key takeaways',
    },
    {
      id: 'punctuation',
      label: 'Polish & Punctuation',
      icon: <Sparkles className="w-4 h-4" />,
      desc: 'Fix grammar, capital letters, and paragraph flow',
    },
    {
      id: 'key_points',
      label: 'Key Takeaways',
      icon: <CheckCircle className="w-4 h-4" />,
      desc: 'Distill core insights into bullet points',
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: <Languages className="w-4 h-4" />,
      desc: 'Translate transcript to Tamil, English, or others',
    },
  ];

  const runTool = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setToolResult('');

    try {
      const response = await fetch('/api/smart-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedTool,
          text: originalText,
          targetLanguage: targetLang,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Smart tool processing failed');
      }

      const data = await response.json();
      setToolResult(data.result || '');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Smart tool error:', err);
      setErrorMessage(err.message || 'Failed to generate output');
      setIsLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!toolResult) return;
    try {
      await navigator.clipboard.writeText(toolResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleApply = () => {
    if (toolResult) {
      onApplyReplacement(toolResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#082D19] border border-[#159447]/50 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#159447]/30 bg-[#123D25]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#65E62E]/10 border border-[#65E62E]/30 flex items-center justify-center text-[#65E62E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4FFF1]">Smart Transcript Tools</h3>
              <p className="text-xs text-[#F4FFF1]/60">
                Enhance your transcript with Cuckoo AI post-processing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#123D25] hover:bg-[#159447]/50 text-[#F4FFF1]/70 hover:text-[#F4FFF1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tool selector buttons */}
          <div>
            <label className="block text-xs font-semibold text-[#8AFF42] uppercase tracking-wider mb-2.5">
              Select AI Transformation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTool(t.id);
                    setToolResult('');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    selectedTool === t.id
                      ? 'bg-[#123D25] border-[#65E62E] text-[#8AFF42] shadow-sm'
                      : 'bg-[#123D25]/40 border-[#159447]/30 text-[#F4FFF1]/80 hover:bg-[#123D25]/70'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    <span className={selectedTool === t.id ? 'text-[#65E62E]' : 'text-[#8AFF42]'}>
                      {t.icon}
                    </span>
                    <span>{t.label}</span>
                  </div>
                  <p className="text-[11px] text-[#F4FFF1]/60 leading-tight">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Translation Language Selector */}
          {selectedTool === 'translate' && (
            <div className="p-4 rounded-2xl bg-[#123D25]/50 border border-[#159447]/40 flex items-center justify-between gap-4">
              <span className="text-xs text-[#F4FFF1]">Translate Transcript To:</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-[#082D19] border border-[#65E62E]/40 text-[#8AFF42] text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="Tamil">Tamil (தமிழ் Unicode)</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Japanese">Japanese (日本語)</option>
              </select>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={runTool}
              disabled={isLoading || !originalText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#65E62E] to-[#159447] text-[#082D19] font-bold text-xs shadow-md hover:shadow-[0_0_20px_rgba(101,230,46,0.3)] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#082D19]" />
                  <span>Generating AI Transformation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#082D19]" />
                  <span>Generate {tools.find((t) => t.id === selectedTool)?.label}</span>
                </>
              )}
            </button>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Side-by-Side Review Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Transcript Box */}
            <div className="flex flex-col rounded-2xl bg-[#082D19]/80 border border-[#159447]/30 p-4 min-h-[220px]">
              <span className="text-xs font-semibold text-[#F4FFF1]/60 uppercase tracking-wider mb-2">
                Original Transcript
              </span>
              <p className="text-xs text-[#F4FFF1]/80 leading-relaxed overflow-y-auto max-h-[260px] whitespace-pre-wrap font-sans">
                {originalText || 'No transcript text available.'}
              </p>
            </div>

            {/* AI Generated Result Box */}
            <div className="flex flex-col rounded-2xl bg-[#123D25]/60 border border-[#65E62E]/40 p-4 min-h-[220px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8AFF42] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#65E62E]" />
                  <span>AI Result</span>
                </span>
                {toolResult && (
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 text-[11px] text-[#8AFF42] hover:text-[#65E62E]"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Result'}</span>
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[#F4FFF1]/60 text-xs gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#65E62E]" />
                  <span>Cuckoo Voice AI is formulating your output...</span>
                </div>
              ) : toolResult ? (
                <div className="flex-1 overflow-y-auto max-h-[260px] text-xs text-[#F4FFF1] leading-relaxed whitespace-pre-wrap font-sans">
                  {toolResult}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#F4FFF1]/40 text-xs italic">
                  Select a tool above and click Generate to see the enhanced transcript.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#159447]/30 bg-[#123D25]/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#082D19] border border-[#159447]/40 text-[#F4FFF1]/80 hover:text-[#F4FFF1] text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          {toolResult && (
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#65E62E] hover:bg-[#8AFF42] text-[#082D19] font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              <span>Replace Transcript with Result</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
