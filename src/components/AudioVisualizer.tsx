import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  isPaused?: boolean;
  audioLevel?: number; // fallback 0.0 to 1.0
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isRecording,
  isPaused = false,
  audioLevel = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const midY = height / 2;

      if (!isRecording) {
        // Subtle resting baseline wave
        ctx.beginPath();
        ctx.moveTo(0, midY);
        for (let x = 0; x < width; x += 4) {
          const y = midY + Math.sin(x * 0.03 + phase) * 2;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#159447';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
        phase += 0.02;
        animId = requestAnimationFrame(render);
        return;
      }

      if (isPaused) {
        // Flatline dashed paused state
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.strokeStyle = '#EAB308'; // Amber paused indication
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.setLineDash([]);
        animId = requestAnimationFrame(render);
        return;
      }

      // Active recording waveform
      let rms = audioLevel;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        rms = Math.min(1.0, (sum / dataArray.length / 128) * 1.5);
      }

      const amp = Math.max(6, rms * (height * 0.42));
      phase += 0.08 + rms * 0.15;

      // Primary vibrant leaf wave
      ctx.beginPath();
      ctx.moveTo(0, midY);
      for (let x = 0; x <= width; x += 3) {
        const normalizedX = x / width;
        // Envelope curve to taper waves at ends
        const envelope = Math.sin(normalizedX * Math.PI);
        const y = midY + Math.sin(x * 0.04 + phase) * amp * envelope + Math.cos(x * 0.02 - phase * 0.5) * (amp * 0.4 * envelope);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#65E62E';
      ctx.lineWidth = 2.8;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#65E62E';
      ctx.globalAlpha = 0.95;
      ctx.stroke();

      // Secondary glowing emerald harmonic wave
      ctx.beginPath();
      ctx.moveTo(0, midY);
      for (let x = 0; x <= width; x += 3) {
        const normalizedX = x / width;
        const envelope = Math.sin(normalizedX * Math.PI);
        const y = midY - Math.sin(x * 0.035 - phase * 0.8) * (amp * 0.75 * envelope);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#8AFF42';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#8AFF42';
      ctx.globalAlpha = 0.7;
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyser, isRecording, isPaused, audioLevel]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className={`w-full h-16 rounded-xl bg-[#082D19]/60 border border-[#159447]/30 backdrop-blur-xs ${className}`}
    />
  );
};
