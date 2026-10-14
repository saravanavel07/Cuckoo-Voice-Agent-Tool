import React, { useState, useEffect, useRef } from 'react';
import { CuckooLogo } from './CuckooLogo';
import { AudioVisualizer } from './AudioVisualizer';
import { SubtitleSegment } from '../types';
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  RotateCcw,
  AlertTriangle,
  Radio,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface LiveRecorderProps {
  onTranscriptUpdate: (text: string, isFinal: boolean) => void;
  onAudioCaptured?: (blob: Blob, base64: string, durationSeconds: number) => void;
  onSegmentsGenerated?: (segments: SubtitleSegment[]) => void;
  language: string;
  silenceThresholdSeconds?: number;
  isExternalRecording?: boolean;
}

export const LiveRecorder: React.FC<LiveRecorderProps> = ({
  onTranscriptUpdate,
  onAudioCaptured,
  onSegmentsGenerated,
  language,
  silenceThresholdSeconds = 4,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProlongedSilence, setIsProlongedSilence] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [speechEngineStatus, setSpeechEngineStatus] = useState<'idle' | 'listening' | 'unsupported'>('idle');

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const silenceTimerRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const liveFinalTextRef = useRef<string>('');

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  // Map app language code to BCP 47 for Web Speech API
  const getLanguageTag = (code: string) => {
    switch (code) {
      case 'ta':
        return 'ta-IN'; // Tamil (India)
      case 'es':
        return 'es-ES';
      case 'fr':
        return 'fr-FR';
      case 'de':
        return 'de-DE';
      case 'hi':
        return 'hi-IN';
      case 'ja':
        return 'ja-JP';
      case 'zh':
        return 'zh-CN';
      case 'ar':
        return 'ar-SA';
      case 'en':
      case 'auto':
      default:
        return 'en-US';
    }
  };

  const startRecording = async () => {
    setMicError(null);
    setIsProlongedSilence(false);
    audioChunksRef.current = [];
    liveFinalTextRef.current = '';

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup Web Audio API Analyser for live visualizer and VAD
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // 3. Setup MediaRecorder to save audio clip
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // collect chunks every 250ms

      // 4. Setup SpeechRecognition (Web Speech API)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = getLanguageTag(language);

        recognition.onstart = () => {
          setSpeechEngineStatus('listening');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              liveFinalTextRef.current += (liveFinalTextRef.current ? ' ' : '') + transcript.trim();
              onTranscriptUpdate(liveFinalTextRef.current, true);
            } else {
              interim += transcript;
            }
          }
          if (interim) {
            const fullPreview = liveFinalTextRef.current
              ? `${liveFinalTextRef.current} ${interim}`
              : interim;
            onTranscriptUpdate(fullPreview, false);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          if (event.error === 'not-allowed') {
            setMicError('Microphone permission was denied in browser settings.');
          }
        };

        recognition.onend = () => {
          // If still recording, restart recognition to maintain continuous stream
          if (isRecording && !isPaused && recognitionRef.current) {
            try {
              recognition.start();
            } catch {
              // ignore duplicate start
            }
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
        }
      } else {
        setSpeechEngineStatus('unsupported');
      }

      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Start VAD and Silence detection loop
      startVADLoop(analyser);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission denied. Please allow microphone access in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError('No microphone found on your device. Please plug in a microphone or headset.');
      } else {
        setMicError(`Unable to start microphone: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const startVADLoop = (analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let consecutiveSilentFrames = 0;

    const checkAudio = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedLevel = Math.min(1.0, avg / 60);

      setAudioLevel(normalizedLevel);

      // VAD Speech detection threshold
      const isSpeech = normalizedLevel > 0.08;
      setIsVoiceActive(isSpeech);

      if (isSpeech) {
        consecutiveSilentFrames = 0;
        setIsProlongedSilence(false);
      } else {
        consecutiveSilentFrames++;
        // ~60 frames per second. If silence exceeds silenceThresholdSeconds:
        if (consecutiveSilentFrames > silenceThresholdSeconds * 60) {
          setIsProlongedSilence(true);
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkAudio);
    };

    animationFrameRef.current = requestAnimationFrame(checkAudio);
  };

  const pauseRecording = () => {
    if (!isRecording || isPaused) return;
    setIsPaused(true);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (!isRecording || !isPaused) return;
    setIsPaused(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    const capturedSeconds = recordingSeconds;
    stopRecordingCleanup();

    // Process recorded audio chunks to Blob
    if (audioChunksRef.current.length > 0) {
      const mime = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const blob = new Blob(audioChunksRef.current, { type: mime });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (onAudioCaptured) {
          onAudioCaptured(blob, base64, capturedSeconds);
        }
      };
      reader.readAsDataURL(blob);
    }
  };

  const stopRecordingCleanup = () => {
    setIsRecording(false);
    setIsPaused(false);
    setIsVoiceActive(false);
    setIsProlongedSilence(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#123D25]/40 rounded-3xl border border-[#159447]/30 shadow-lg relative overflow-hidden backdrop-blur-md">
      {/* Glow highlight behind recording center */}
      <div
        className={`absolute -top-12 -left-12 w-64 h-64 rounded-full bg-[#65E62E]/10 blur-3xl pointer-events-none transition-all duration-700 ${
          isRecording ? 'opacity-80 scale-125' : 'opacity-20 scale-100'
        }`}
      />

      {/* Top Status & Timer Row */}
      <div className="w-full flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{isPaused ? 'RECORDING PAUSED' : 'LIVE RECORDING'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#123D25] border border-[#159447]/40 text-[#8AFF42] text-xs font-medium">
              <Radio className="w-3.5 h-3.5 text-[#65E62E]" />
              <span>Microphone Ready</span>
            </div>
          )}

          {isVoiceActive && !isPaused && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#65E62E]/20 text-[#8AFF42] border border-[#65E62E]/40 font-mono animate-pulse">
              Speech detected
            </span>
          )}
        </div>

        {/* Live Timer */}
        <div className="font-mono text-lg font-bold tracking-wider text-[#F4FFF1] bg-[#082D19]/70 px-3.5 py-1 rounded-xl border border-[#159447]/30 shadow-inner">
          {formatTimer(recordingSeconds)}
        </div>
      </div>

      {/* Signature Singing Cuckoo Microphone Interactive Button - Mass Hero Pedestal */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer Pulsing Sonic Halo Rings */}
        <div
          className={`absolute w-44 h-44 rounded-full border border-[#8AFF42]/30 transition-all duration-700 pointer-events-none ${
            isRecording && !isPaused ? 'scale-125 opacity-80 animate-ping' : 'scale-100 opacity-20'
          }`}
          style={{ animationDuration: '2.5s' }}
        />
        <div
          className={`absolute w-36 h-36 rounded-full border border-[#65E62E]/40 transition-all duration-500 pointer-events-none ${
            isRecording && !isPaused ? 'scale-115 opacity-90 animate-pulse' : 'scale-95 opacity-30'
          }`}
        />

        {/* Ambient Radial Glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#159447]/30 via-[#65E62E]/40 to-[#8AFF42]/50 blur-xl transition-all duration-500 pointer-events-none ${
            isRecording ? 'scale-130 opacity-90' : 'scale-100 opacity-30'
          }`}
        />

        {/* Central Metallic Pedestal & Record Button */}
        <button
          onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
          className={`relative group p-5 sm:p-6 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#8AFF42]/60 ${
            isRecording
              ? 'bg-gradient-to-tr from-[#051C0F] via-[#123D25] to-[#159447] shadow-[0_0_50px_rgba(101,230,46,0.7),inset_0_0_20px_rgba(138,255,66,0.3)] scale-105 border-3 border-[#8AFF42]'
              : 'bg-gradient-to-tr from-[#082D19] via-[#123D25] to-[#159447]/80 hover:shadow-[0_0_45px_rgba(101,230,46,0.5),inset_0_0_15px_rgba(101,230,46,0.2)] hover:scale-105 border-2 border-[#65E62E]/60'
          }`}
          aria-label={isRecording ? 'Pause or toggle recording' : 'Click to start recording'}
        >
          {/* Circular Metallic Rim Accent */}
          <div className="absolute inset-1 rounded-full border border-[#8AFF42]/30 pointer-events-none" />

          {/* Animated Singing Cuckoo Logo */}
          <CuckooLogo
            size="xl"
            isSinging={isRecording && !isPaused}
            glow={isRecording}
            showWaves={true}
          />
        </button>
      </div>

      {/* Instruction text */}
      <div className="text-center mb-5">
        <h3 className="text-base font-semibold text-[#F4FFF1] mb-1">
          {!isRecording
            ? 'Click the Singing Cuckoo to Record'
            : isPaused
            ? 'Recording is paused — click cuckoo to resume'
            : 'Sing or speak naturally into your microphone'}
        </h3>
        <p className="text-xs text-[#F4FFF1]/70">
          Powered by CUCKOO Acoustic AI with native English and Tamil recognition.
        </p>
      </div>

      {/* Audio Waveform Visualizer */}
      <div className="w-full max-w-xl mb-5">
        <AudioVisualizer
          analyser={analyserRef.current}
          isRecording={isRecording}
          isPaused={isPaused}
          audioLevel={audioLevel}
        />
      </div>

      {/* Prolonged silence alert */}
      {isProlongedSilence && isRecording && !isPaused && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>No speech detected for {silenceThresholdSeconds}s. Speak whenever ready or click Stop to finish.</span>
        </div>
      )}

      {/* Microphone Error banner */}
      {micError && (
        <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs max-w-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-300">Microphone Issue</p>
            <p className="mt-0.5">{micError}</p>
          </div>
        </div>
      )}

      {/* Recording Action Controls Bar */}
      {isRecording && (
        <div className="flex items-center gap-3 mt-2">
          {/* Pause / Resume button */}
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#123D25] hover:bg-[#159447]/60 text-[#8AFF42] border border-[#65E62E]/30 text-xs font-semibold transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Stop and Save Button */}
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop &amp; Complete</span>
          </button>
        </div>
      )}
    </div>
  );
};
