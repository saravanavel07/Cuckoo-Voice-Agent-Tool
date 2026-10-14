import React, { useState, useRef } from 'react';
import { SubtitleSegment } from '../types';
import { UploadCloud, FileAudio, Check, AlertCircle, Loader2, Play, Pause, X, Sparkles } from 'lucide-react';

interface FileUploadProps {
  onTranscribeSuccess: (result: {
    text: string;
    segments: SubtitleSegment[];
    language: string;
    durationEstimateSeconds: number;
    audioBlobUrl: string;
    filename: string;
  }) => void;
  language: string;
  customVocabulary?: string[];
}

const SUPPORTED_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/flac',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onTranscribeSuccess,
  language,
  customVocabulary = [],
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 25MB.`);
      return;
    }

    // Validate extension/type
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['mp3', 'wav', 'webm', 'ogg', 'm4a', 'aac', 'flac'];
    if (!allowedExts.includes(ext || '') && !SUPPORTED_MIME_TYPES.includes(file.type)) {
      setErrorMessage(`Unsupported format .${ext}. Please upload MP3, WAV, WEBM, OGG, M4A, AAC, or FLAC.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    // Calculate duration using Audio object
    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      setDuration(tempAudio.duration);
    };
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(null);
    setAudioUrl(null);
    setDuration(null);
    setIsLoading(false);
    setErrorMessage(null);
    setProgressStatus('');
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const startTranscription = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage(null);
    setProgressStatus('Reading acoustic data & encoding audio...');

    try {
      abortControllerRef.current = new AbortController();

      // Read file as Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(selectedFile);
      const audioBase64 = await base64Promise;

      setProgressStatus('Processing through CUCKOO Speech Recognition Model...');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64,
          mimeType: selectedFile.type || 'audio/webm',
          language,
          customVocabulary,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setProgressStatus('Transcription complete!');

      // Map segments with unique IDs
      const mappedSegments: SubtitleSegment[] = (data.segments || []).map((s: any, idx: number) => ({
        id: `seg-${Date.now()}-${idx}`,
        start: Number(s.start) || 0,
        end: Number(s.end) || (Number(s.start) + 2),
        speaker: s.speaker || `Speaker 1`,
        text: s.text || '',
        confidence: s.confidence || 0.95,
      }));

      onTranscribeSuccess({
        text: data.text || '',
        segments: mappedSegments,
        language: data.detectedLanguage || language,
        durationEstimateSeconds: data.durationEstimateSeconds || duration || 0,
        audioBlobUrl: audioUrl || '',
        filename: selectedFile.name,
      });

      setIsLoading(false);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMessage('Transcription cancelled by user.');
      } else {
        console.error('File transcription error:', err);
        setErrorMessage(err.message || 'Failed to transcribe audio file. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#123D25]/40 rounded-3xl border border-[#159447]/30 shadow-lg backdrop-blur-md">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm,.aac,.flac"
        className="hidden"
      />

      {!selectedFile ? (
        /* Drag & drop upload area */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#159447]/60 hover:border-[#65E62E] rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-[#082D19]/40 hover:bg-[#123D25]/50 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#65E62E]/10 border border-[#65E62E]/30 flex items-center justify-center text-[#65E62E] mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(101,230,46,0.3)] transition-all">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h4 className="text-base font-semibold text-[#F4FFF1] mb-1">
            Choose an audio file or drag it here
          </h4>
          <p className="text-xs text-[#F4FFF1]/60 mb-3 text-center max-w-sm">
            Supports MP3, WAV, M4A, WEBM, OGG, AAC, and FLAC up to 25MB.
          </p>
          <span className="px-4 py-1.5 rounded-xl bg-[#123D25] border border-[#65E62E]/40 text-[#8AFF42] text-xs font-semibold group-hover:bg-[#159447]/60 transition-colors">
            Browse Audio Files
          </span>
        </div>
      ) : (
        /* Selected file card */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#082D19]/70 border border-[#159447]/40">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-[#65E62E]/10 border border-[#65E62E]/30 flex items-center justify-center text-[#65E62E] shrink-0">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-[#F4FFF1] truncate">{selectedFile.name}</p>
                <div className="flex items-center gap-3 text-xs text-[#F4FFF1]/60 mt-0.5">
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  {duration !== null && (
                    <span>• {Math.floor(duration / 60)}:{(duration % 60 < 10 ? '0' : '')}{Math.floor(duration % 60)}</span>
                  )}
                  <span>• {selectedFile.type || 'audio'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {audioUrl && (
                <button
                  onClick={togglePlayback}
                  className="p-2.5 rounded-xl bg-[#123D25] hover:bg-[#159447] text-[#8AFF42] border border-[#159447]/50 transition-colors"
                  title={isPlaying ? 'Pause Preview' : 'Play Audio'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={clearSelection}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors disabled:opacity-50"
                title="Remove File"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {audioUrl && (
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* Action trigger button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#8AFF42]">
              Target: {language === 'auto' ? 'Auto-Detect (English / Tamil)' : language}
            </span>

            <div className="flex items-center gap-3">
              {isLoading && (
                <button
                  onClick={() => abortControllerRef.current?.abort()}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={startTranscription}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#65E62E] to-[#159447] text-[#082D19] font-bold text-xs shadow-md hover:shadow-[0_0_20px_rgba(101,230,46,0.4)] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#082D19]" />
                    <span>{progressStatus || 'Transcribing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#082D19]" />
                    <span>Transcribe Audio File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
