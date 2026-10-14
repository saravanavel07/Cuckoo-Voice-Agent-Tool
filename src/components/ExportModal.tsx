import React, { useState } from 'react';
import { SubtitleSegment } from '../types';
import { generateSRT, generateVTT, generateJSON, downloadFile } from '../utils/subtitleUtils';
import { Download, FileText, Subtitles, Code, FileCode, X, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  segments: SubtitleSegment[];
  metadata?: {
    title?: string;
    language?: string;
    durationSeconds?: number;
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  text,
  segments,
  metadata = {},
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'txt' | 'srt' | 'vtt' | 'json' | 'md'>('txt');
  const [fileName, setFileName] = useState(
    metadata.title ? metadata.title.replace(/\s+/g, '_') : 'cuckoo_transcript'
  );
  const [hasExported, setHasExported] = useState(false);

  if (!isOpen) return null;

  const hasTimestamps = segments && segments.length > 0;

  const formats: {
    id: 'txt' | 'srt' | 'vtt' | 'json' | 'md';
    label: string;
    ext: string;
    icon: React.ReactNode;
    desc: string;
    requiresTimestamps?: boolean;
  }[] = [
    {
      id: 'txt',
      label: 'Plain Text (.txt)',
      ext: 'txt',
      icon: <FileText className="w-5 h-5" />,
      desc: 'Clean text document formatted for reading and sharing.',
    },
    {
      id: 'srt',
      label: 'SubRip Subtitles (.srt)',
      ext: 'srt',
      icon: <Subtitles className="w-5 h-5" />,
      desc: 'Industry-standard subtitle file with millisecond timestamps for video editing.',
      requiresTimestamps: true,
    },
    {
      id: 'vtt',
      label: 'WebVTT (.vtt)',
      ext: 'vtt',
      icon: <FileCode className="w-5 h-5" />,
      desc: 'HTML5 web subtitle standard for video players and streaming.',
      requiresTimestamps: true,
    },
    {
      id: 'json',
      label: 'Structured JSON (.json)',
      ext: 'json',
      icon: <Code className="w-5 h-5" />,
      desc: 'Full JSON schema with timestamps, speaker diarization, and confidence levels.',
    },
    {
      id: 'md',
      label: 'Markdown Document (.md)',
      ext: 'md',
      icon: <FileText className="w-5 h-5" />,
      desc: 'Formatted markdown document with headers, metadata, and body.',
    },
  ];

  const handleDownload = () => {
    const baseName = fileName.trim() || 'cuckoo_transcript';

    switch (selectedFormat) {
      case 'txt':
        downloadFile(text, `${baseName}.txt`, 'text/plain;charset=utf-8');
        break;
      case 'srt':
        if (hasTimestamps) {
          const srtContent = generateSRT(segments);
          downloadFile(srtContent, `${baseName}.srt`, 'application/x-subrip;charset=utf-8');
        } else {
          // If no timestamps exist, construct estimated segment
          const fallback = `1\n00:00:00,000 --> 00:00:10,000\n${text}\n`;
          downloadFile(fallback, `${baseName}.srt`, 'application/x-subrip;charset=utf-8');
        }
        break;
      case 'vtt':
        if (hasTimestamps) {
          const vttContent = generateVTT(segments);
          downloadFile(vttContent, `${baseName}.vtt`, 'text/vtt;charset=utf-8');
        } else {
          const fallback = `WEBVTT\n\n1\n00:00:00.000 --> 00:00:10.000\n${text}\n`;
          downloadFile(fallback, `${baseName}.vtt`, 'text/vtt;charset=utf-8');
        }
        break;
      case 'json':
        const jsonContent = generateJSON(text, segments, metadata);
        downloadFile(jsonContent, `${baseName}.json`, 'application/json;charset=utf-8');
        break;
      case 'md':
        const mdContent = `# ${metadata.title || 'Cuckoo Voice Transcript'}\n\n- **Date:** ${new Date().toLocaleDateString()}\n- **Language:** ${metadata.language || 'English'}\n- **Duration:** ${metadata.durationSeconds || 0} seconds\n\n---\n\n## Transcript\n\n${text}\n`;
        downloadFile(mdContent, `${baseName}.md`, 'text/markdown;charset=utf-8');
        break;
    }

    setHasExported(true);
    setTimeout(() => {
      setHasExported(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#082D19] border border-[#159447]/50 rounded-3xl max-w-xl w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#159447]/30 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#65E62E]/10 border border-[#65E62E]/30 flex items-center justify-center text-[#65E62E]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4FFF1]">Export Transcript</h3>
              <p className="text-xs text-[#F4FFF1]/60">Select format and download your file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#123D25] hover:bg-[#159447]/50 text-[#F4FFF1]/70 hover:text-[#F4FFF1]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Name Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-[#8AFF42] mb-1.5">File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full bg-[#123D25] border border-[#159447]/50 rounded-xl px-3.5 py-2 text-sm text-[#F4FFF1] focus:outline-none focus:border-[#65E62E]"
            placeholder="my_transcript"
          />
        </div>

        {/* Format Options */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-semibold text-[#8AFF42] uppercase tracking-wider mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`flex flex-col p-3 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-[#123D25] border-[#65E62E] text-[#8AFF42] shadow-sm'
                      : 'bg-[#123D25]/40 border-[#159447]/30 text-[#F4FFF1]/80 hover:bg-[#123D25]/70'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    <span className={isSelected ? 'text-[#65E62E]' : 'text-[#8AFF42]'}>
                      {fmt.icon}
                    </span>
                    <span>{fmt.label}</span>
                  </div>
                  <p className="text-[11px] text-[#F4FFF1]/60 leading-tight">{fmt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#159447]/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#123D25] border border-[#159447]/40 text-[#F4FFF1]/70 hover:text-[#F4FFF1] text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#65E62E] to-[#159447] text-[#082D19] font-bold text-xs shadow-md hover:shadow-[0_0_20px_rgba(101,230,46,0.3)] transition-all cursor-pointer"
          >
            {hasExported ? (
              <>
                <Check className="w-4 h-4 text-[#082D19]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#082D19]" />
                <span>Download .{selectedFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
