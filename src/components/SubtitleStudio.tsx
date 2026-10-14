import React, { useState, useRef, useEffect } from 'react';
import { SubtitleSegment } from '../types';
import { formatTimeSRT, formatTimeVTT, formatTimeDisplay, generateSRT, generateVTT, downloadFile } from '../utils/subtitleUtils';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Download,
  Volume2,
  Clock,
  Sparkles,
  User,
  RotateCcw,
  Subtitles,
} from 'lucide-react';

interface SubtitleStudioProps {
  segments: SubtitleSegment[];
  onChangeSegments: (segments: SubtitleSegment[]) => void;
  audioBlobUrl?: string;
  sessionTitle?: string;
}

export const SubtitleStudio: React.FC<SubtitleStudioProps> = ({
  segments,
  onChangeSegments,
  audioBlobUrl,
  sessionTitle = 'cuckoo_subtitles',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback sample segments if user enters studio without existing segments
  useEffect(() => {
    if (segments.length === 0) {
      onChangeSegments([
        {
          id: 'seg-1',
          start: 0.0,
          end: 3.5,
          speaker: 'Speaker 1',
          text: 'Welcome to Cuckoo Voice AI Subtitle Studio.',
          confidence: 0.98,
        },
        {
          id: 'seg-2',
          start: 3.8,
          end: 7.2,
          speaker: 'Speaker 1',
          text: 'Every voice finds its words with millisecond timestamp accuracy.',
          confidence: 0.95,
        },
        {
          id: 'seg-3',
          start: 7.5,
          end: 11.0,
          speaker: 'Speaker 2',
          text: 'வணக்கம்! தமிழ் வசனங்களும் துல்லியமாக இங்கே திருத்தப்படலாம்.',
          confidence: 0.97,
        },
      ]);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    // Find active segment
    const active = segments.find((s) => cur >= s.start && cur <= s.end);
    setActiveSegmentId(active ? active.id : null);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekToSegment = (startSec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startSec;
      setCurrentTime(startSec);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTime(startSec);
    }
  };

  const handleUpdateSegment = (id: string, updates: Partial<SubtitleSegment>) => {
    onChangeSegments(
      segments.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleAddSegment = (afterIndex: number) => {
    const prev = segments[afterIndex];
    const newStart = prev ? Number((prev.end + 0.2).toFixed(1)) : 0;
    const newEnd = Number((newStart + 3.0).toFixed(1));

    const newSegment: SubtitleSegment = {
      id: `seg-${Date.now()}`,
      start: newStart,
      end: newEnd,
      speaker: prev ? prev.speaker : 'Speaker 1',
      text: '',
      confidence: 1.0,
    };

    const copy = [...segments];
    copy.splice(afterIndex + 1, 0, newSegment);
    onChangeSegments(copy);
  };

  const handleDeleteSegment = (id: string) => {
    onChangeSegments(segments.filter((s) => s.id !== id));
  };

  const exportSRT = () => {
    const content = generateSRT(segments);
    downloadFile(content, `${sessionTitle}.srt`, 'application/x-subrip;charset=utf-8');
  };

  const exportVTT = () => {
    const content = generateVTT(segments);
    downloadFile(content, `${sessionTitle}.vtt`, 'text/vtt;charset=utf-8');
  };

  // Find active segment text for preview overlay
  const activeSegment = segments.find((s) => s.id === activeSegmentId);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#123D25]/40 border border-[#159447]/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#65E62E]/10 border border-[#65E62E]/30 flex items-center justify-center text-[#65E62E]">
            <Subtitles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F4FFF1]">Subtitle Studio</h2>
            <p className="text-xs text-[#F4FFF1]/60">
              Synchronize, edit, and export timestamped SRT &amp; VTT captions
            </p>
          </div>
        </div>

        {/* Quick Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportSRT}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#123D25] hover:bg-[#159447]/60 text-[#8AFF42] border border-[#65E62E]/30 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .SRT</span>
          </button>
          <button
            onClick={exportVTT}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#65E62E] hover:bg-[#8AFF42] text-[#082D19] font-bold text-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .VTT</span>
          </button>
        </div>
      </div>

      {/* Video / Audio Simulation Stage */}
      <div className="relative rounded-3xl bg-[#082D19]/90 border border-[#159447]/40 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 min-h-[220px]">
        {/* Audio tag if blob is provided */}
        {audioBlobUrl && (
          <audio
            ref={audioRef}
            src={audioBlobUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Cinematic Subtitle Preview Banner */}
        <div className="w-full max-w-2xl text-center py-6 px-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8AFF42]/60 mb-2 block">
            Live Caption Synchronization Preview
          </span>
          <div className="min-h-[48px] flex items-center justify-center">
            {activeSegment ? (
              <span className="px-4 py-2 rounded-xl bg-black/80 border border-[#65E62E]/40 text-[#F4FFF1] text-base md:text-lg font-medium shadow-lg animate-fade-in">
                {activeSegment.speaker && (
                  <span className="text-[#8AFF42] font-semibold mr-2">[{activeSegment.speaker}]:</span>
                )}
                {activeSegment.text}
              </span>
            ) : (
              <span className="text-xs text-[#F4FFF1]/40 italic">
                (No subtitle active at {formatTimeDisplay(currentTime)})
              </span>
            )}
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="w-full max-w-2xl flex items-center gap-4 mt-4 pt-4 border-t border-[#159447]/30">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-[#65E62E] text-[#082D19] hover:bg-[#8AFF42] transition-colors shadow-md cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Time Scrubber */}
          <div className="flex-1 flex items-center gap-3">
            <span className="font-mono text-xs text-[#8AFF42]">
              {formatTimeDisplay(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || Math.max(...segments.map((s) => s.end), 30)}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (audioRef.current) audioRef.current.currentTime = val;
              }}
              className="flex-1 accent-[#65E62E] h-1.5 bg-[#123D25] rounded-lg cursor-pointer"
            />
            <span className="font-mono text-xs text-[#F4FFF1]/60">
              {formatTimeDisplay(duration || Math.max(...segments.map((s) => s.end), 30))}
            </span>
          </div>
        </div>
      </div>

      {/* Timestamped Segment List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-[#8AFF42] uppercase tracking-wider">
            Subtitle Segments ({segments.length})
          </span>
          <button
            onClick={() => handleAddSegment(segments.length - 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#123D25] hover:bg-[#159447]/50 text-[#8AFF42] border border-[#65E62E]/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Line</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {segments.map((seg, index) => {
            const isActive = seg.id === activeSegmentId;
            return (
              <div
                key={seg.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-[#123D25] border-[#65E62E] shadow-[0_0_15px_rgba(101,230,46,0.2)]'
                    : 'bg-[#123D25]/40 border-[#159447]/30 hover:border-[#159447]/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => seekToSegment(seg.start)}
                      className="p-1.5 rounded-lg bg-[#082D19] hover:bg-[#159447] text-[#8AFF42] border border-[#159447]/40 transition-colors"
                      title="Seek & Play this segment"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <span className="text-xs font-mono font-bold text-[#8AFF42]">
                      #{index + 1}
                    </span>

                    {/* Speaker Label */}
                    <div className="flex items-center gap-1 bg-[#082D19] px-2 py-0.5 rounded-lg border border-[#159447]/40 text-[11px] text-[#F4FFF1]/80">
                      <User className="w-3 h-3 text-[#65E62E]" />
                      <input
                        type="text"
                        value={seg.speaker}
                        onChange={(e) => handleUpdateSegment(seg.id, { speaker: e.target.value })}
                        className="bg-transparent focus:outline-none w-20 text-[11px] text-[#8AFF42]"
                        placeholder="Speaker"
                      />
                    </div>
                  </div>

                  {/* Start & End Time Inputs */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1 bg-[#082D19] px-2 py-1 rounded-lg border border-[#159447]/40">
                      <span className="text-[#F4FFF1]/40 text-[10px]">IN:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={seg.start}
                        onChange={(e) =>
                          handleUpdateSegment(seg.id, { start: Math.max(0, parseFloat(e.target.value) || 0) })
                        }
                        className="bg-transparent focus:outline-none w-14 text-right text-[#8AFF42]"
                      />
                      <span className="text-[#F4FFF1]/40 text-[10px]">s</span>
                    </div>

                    <span className="text-[#159447]">→</span>

                    <div className="flex items-center gap-1 bg-[#082D19] px-2 py-1 rounded-lg border border-[#159447]/40">
                      <span className="text-[#F4FFF1]/40 text-[10px]">OUT:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={seg.end}
                        onChange={(e) =>
                          handleUpdateSegment(seg.id, { end: Math.max(seg.start, parseFloat(e.target.value) || 0) })
                        }
                        className="bg-transparent focus:outline-none w-14 text-right text-[#8AFF42]"
                      />
                      <span className="text-[#F4FFF1]/40 text-[10px]">s</span>
                    </div>

                    {/* Add after & Delete */}
                    <button
                      onClick={() => handleAddSegment(index)}
                      className="p-1 rounded-lg hover:bg-[#159447]/40 text-[#8AFF42] transition-colors"
                      title="Add line after"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle Text Input with Tamil Unicode support */}
                <textarea
                  value={seg.text}
                  onChange={(e) => handleUpdateSegment(seg.id, { text: e.target.value })}
                  placeholder="Subtitle caption text (English, தமிழ், etc.)..."
                  rows={2}
                  className="w-full bg-[#082D19]/60 border border-[#159447]/30 rounded-xl p-2.5 text-xs text-[#F4FFF1] placeholder-[#F4FFF1]/30 focus:outline-none focus:border-[#65E62E] resize-none"
                  dir="auto"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
