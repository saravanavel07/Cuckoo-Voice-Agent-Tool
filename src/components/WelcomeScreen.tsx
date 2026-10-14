import React from 'react';
import { CuckooLogo } from './CuckooLogo';
import { Mic, UploadCloud, Subtitles, Sparkles, ShieldCheck, Languages, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  onSelectUpload: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onSelectUpload }) => {
  return (
    <div className="relative min-h-[calc(100vh-2rem)] flex flex-col justify-center items-center py-12 px-4 max-w-5xl mx-auto text-center z-10">
      {/* Animated Singing Cuckoo Emblem Hero - Grand Acoustic Stage */}
      <div className="mb-8 relative flex items-center justify-center">
        {/* Layered Acoustic Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-[#8AFF42]/20 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
        <div className="absolute w-60 h-60 rounded-full border border-[#65E62E]/30 pointer-events-none" />
        <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-[#159447]/20 via-[#65E62E]/30 to-[#8AFF42]/40 blur-3xl pointer-events-none" />

        {/* Hero Cuckoo Emblem */}
        <div className="relative group p-4 rounded-full bg-gradient-to-b from-[#123D25]/60 to-[#082D19]/90 border border-[#65E62E]/40 shadow-[0_0_50px_rgba(101,230,46,0.35)] backdrop-blur-md">
          <CuckooLogo size="hero" isSinging={true} glow={true} />
        </div>

        {/* Floating Status Pill */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#082D19]/95 border border-[#8AFF42]/60 text-xs font-bold text-[#8AFF42] shadow-[0_4px_20px_rgba(101,230,46,0.4)] flex items-center gap-2 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8AFF42] animate-ping" />
          <span className="tracking-wide uppercase text-[11px]">Acoustic AI Singing</span>
        </div>
      </div>

      {/* Main Title & Tagline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F4FFF1] mb-3">
        CUCKOO <span className="bg-gradient-to-r from-[#8AFF42] via-[#65E62E] to-[#159447] bg-clip-text text-transparent">VOICE AI</span>
      </h1>
      <p className="text-xl md:text-2xl font-medium text-[#8AFF42] tracking-wide mb-4">
        “Every Voice Finds Its Words.”
      </p>
      <p className="max-w-2xl text-base text-[#F4FFF1]/80 leading-relaxed mb-8">
        An advanced, nature-inspired speech-to-text platform. Transcribe live speech through the singing cuckoo microphone or upload recordings with precision timestamps, authentic Tamil Unicode support, and intelligent meeting tools.
      </p>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
        <button
          onClick={onStart}
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#65E62E] to-[#159447] text-[#082D19] font-bold text-base shadow-[0_0_25px_rgba(101,230,46,0.4)] hover:shadow-[0_0_35px_rgba(138,255,66,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <Mic className="w-5 h-5 text-[#082D19]" />
          <span>Start Live Transcribing</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={onSelectUpload}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#123D25]/80 hover:bg-[#123D25] text-[#8AFF42] border border-[#65E62E]/40 font-semibold text-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer backdrop-blur-md"
        >
          <UploadCloud className="w-5 h-5" />
          <span>Upload Audio File</span>
        </button>
      </div>

      {/* 4 Feature Capability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
        <div className="p-5 rounded-2xl bg-[#123D25]/50 border border-[#159447]/30 hover:border-[#65E62E]/50 transition-all duration-200 backdrop-blur-xs">
          <div className="w-10 h-10 rounded-xl bg-[#65E62E]/10 flex items-center justify-center text-[#65E62E] mb-3 border border-[#65E62E]/20">
            <Mic className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#F4FFF1] mb-1">Live Voice Capture</h2>
          <p className="text-xs text-[#F4FFF1]/70 leading-relaxed">
            Zero-latency microphone streaming with voice activity &amp; silence detection.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#123D25]/50 border border-[#159447]/30 hover:border-[#65E62E]/50 transition-all duration-200 backdrop-blur-xs">
          <div className="w-10 h-10 rounded-xl bg-[#8AFF42]/10 flex items-center justify-center text-[#8AFF42] mb-3 border border-[#8AFF42]/20">
            <Languages className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#F4FFF1] mb-1">English &amp; Tamil Unicode</h2>
          <p className="text-xs text-[#F4FFF1]/70 leading-relaxed">
            Accurate multilingual recognition with authentic Tamil script rendering.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#123D25]/50 border border-[#159447]/30 hover:border-[#65E62E]/50 transition-all duration-200 backdrop-blur-xs">
          <div className="w-10 h-10 rounded-xl bg-[#159447]/20 flex items-center justify-center text-[#8AFF42] mb-3 border border-[#159447]/40">
            <Subtitles className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#F4FFF1] mb-1">Subtitle Studio</h2>
          <p className="text-xs text-[#F4FFF1]/70 leading-relaxed">
            Timestamped segment editor with synchronized audio playback and SRT/VTT export.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#123D25]/50 border border-[#159447]/30 hover:border-[#65E62E]/50 transition-all duration-200 backdrop-blur-xs">
          <div className="w-10 h-10 rounded-xl bg-[#65E62E]/10 flex items-center justify-center text-[#65E62E] mb-3 border border-[#65E62E]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#F4FFF1] mb-1">Smart Meeting Tools</h2>
          <p className="text-xs text-[#F4FFF1]/70 leading-relaxed">
            Executive summaries, action item extraction, meeting notes, and punctuation polish.
          </p>
        </div>
      </div>

      {/* Trust & Privacy Bar */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#F4FFF1]/60">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#65E62E]" /> No third-party tracking
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-[#65E62E]" /> Local browser storage default
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#8AFF42]" /> Optional Privacy Mode
        </span>
      </div>
    </div>
  );
};
