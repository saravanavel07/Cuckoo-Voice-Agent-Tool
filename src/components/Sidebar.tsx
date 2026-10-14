import React from 'react';
import { CuckooLogo } from './CuckooLogo';
import {
  Mic,
  Subtitles,
  History,
  Settings,
  Shield,
  Keyboard,
  Info,
  Menu,
  X,
  Languages,
} from 'lucide-react';

export type NavTab = 'transcribe' | 'subtitles' | 'history' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isRecording?: boolean;
  privacyMode?: boolean;
  onOpenShortcuts?: () => void;
  isOpenMobile?: boolean;
  onToggleMobile?: () => void;
  tamilSupported?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isRecording = false,
  privacyMode = false,
  onOpenShortcuts,
  isOpenMobile = false,
  onToggleMobile,
  tamilSupported = true,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'transcribe',
      label: 'Transcribe',
      icon: <Mic className="w-5 h-5" />,
      badge: isRecording ? 'LIVE' : undefined,
    },
    {
      id: 'subtitles',
      label: 'Subtitle Studio',
      icon: <Subtitles className="w-5 h-5" />,
      badge: 'SRT/VTT',
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#082D19]/95 backdrop-blur-md border-r border-[#159447]/30 text-[#F4FFF1] p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#159447]/20">
        <CuckooLogo size="sm" isSinging={isRecording} glow={isRecording} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-[#8AFF42] to-[#65E62E] bg-clip-text text-transparent">
              CUCKOO
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#159447]/40 text-[#8AFF42] border border-[#65E62E]/30">
              VOICE AI
            </span>
          </div>
          <span className="text-[11px] text-[#F4FFF1]/60 tracking-tight">
            Every Voice Finds Its Words
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onToggleMobile) onToggleMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#123D25] to-[#159447]/50 text-[#8AFF42] border border-[#65E62E]/40 shadow-sm'
                  : 'text-[#F4FFF1]/70 hover:text-[#F4FFF1] hover:bg-[#123D25]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#65E62E]' : 'text-[#F4FFF1]/60'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    item.badge === 'LIVE'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-[#159447]/30 text-[#8AFF42] border border-[#65E62E]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Multilingual & Tamil badge */}
      <div className="mb-4 p-3 rounded-xl bg-[#123D25]/50 border border-[#159447]/30 text-xs">
        <div className="flex items-center gap-2 text-[#8AFF42] font-semibold mb-1">
          <Languages className="w-4 h-4" />
          <span>Multilingual Engine</span>
        </div>
        <p className="text-[11px] text-[#F4FFF1]/70 leading-relaxed">
          Native English &amp; authentic Tamil (தமிழ்) Unicode transcription enabled.
        </p>
      </div>

      {/* Bottom status and shortcuts */}
      <div className="pt-3 border-t border-[#159447]/20 space-y-2">
        {privacyMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-[#65E62E]/30 text-[11px] text-[#8AFF42]">
            <Shield className="w-3.5 h-3.5 text-[#65E62E]" />
            <span>Privacy Mode Active</span>
          </div>
        )}

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#F4FFF1]/60 hover:text-[#8AFF42] hover:bg-[#123D25]/30 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard Shortcuts</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#123D25] rounded border border-[#159447]/40 text-[#F4FFF1]/60">
              ?
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-3 bg-[#082D19]/90 border-b border-[#159447]/30 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <CuckooLogo size="xs" isSinging={isRecording} />
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-[#8AFF42] to-[#65E62E] bg-clip-text text-transparent">
            CUCKOO VOICE AI
          </span>
        </div>
        <button
          onClick={onToggleMobile}
          className="p-1.5 rounded-lg bg-[#123D25] border border-[#159447]/40 text-[#8AFF42]"
          aria-label="Toggle navigation menu"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-64 h-full shadow-2xl relative">
            {content}
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-xs"
            onClick={onToggleMobile}
          />
        </div>
      )}
    </>
  );
};
