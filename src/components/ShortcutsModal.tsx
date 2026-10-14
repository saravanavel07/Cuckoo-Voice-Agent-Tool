import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start / Pause live microphone recording' },
    { key: 'Esc', desc: 'Close modals or cancel active recording' },
    { key: 'Ctrl + C', desc: 'Copy selected text or all transcript' },
    { key: 'Ctrl + F', desc: 'Find and search within transcript' },
    { key: 'Ctrl + Z', desc: 'Undo text modification' },
    { key: 'Ctrl + Y', desc: 'Redo text modification' },
    { key: 'Ctrl + E', desc: 'Open Export download dialog' },
    { key: 'Ctrl + S', desc: 'Open Smart Meeting Tools' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#082D19] border border-[#159447]/50 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#159447]/30 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#65E62E]" />
            <h3 className="text-base font-bold text-[#F4FFF1]">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#123D25] text-[#F4FFF1]/60 hover:text-[#F4FFF1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#123D25]/40 border border-[#159447]/20 text-xs"
            >
              <span className="text-[#F4FFF1]/80">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded bg-[#082D19] border border-[#65E62E]/40 text-[#8AFF42] font-mono text-[11px] shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-[#159447]/30 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#123D25] hover:bg-[#159447]/60 text-[#8AFF42] border border-[#65E62E]/30 text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
