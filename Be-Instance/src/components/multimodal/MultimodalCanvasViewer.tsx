import React, { useRef, useEffect, useState } from 'react';
import { MultimodalPayload } from '../../types';
import { Volume2, Play, Square, Code, Image as ImageIcon, Video, Copy, Check, Sparkles, Terminal, Activity } from 'lucide-react';

interface MultimodalCanvasViewerProps {
  payload: MultimodalPayload;
  onCodeRun?: (code: string) => void;
}

export const MultimodalCanvasViewer: React.FC<MultimodalCanvasViewerProps> = ({
  payload,
  onCodeRun
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'visual' | 'video' | 'audio' | 'code'>(() => {
    if (payload.image) return 'visual';
    if (payload.video) return 'video';
    if (payload.audio) return 'audio';
    if (payload.code) return 'code';
    return 'visual';
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Play Audio Web Audio API synthesizer
  const handlePlayAudio = () => {
    if (!payload.audio) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      setIsPlayingAudio(true);
      const notes = payload.audio.notes && payload.audio.notes.length > 0
        ? payload.audio.notes
        : [60, 64, 67, 72];

      const duration = payload.audio.durationSec || 1.5;
      const baseFreq = payload.audio.freqHz || 432;
      const now = ctx.currentTime;

      notes.forEach((midi, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freq = baseFreq * Math.pow(2, (midi - 69) / 12);
        osc.type = payload.audio?.waveform || 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.001, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + duration);
      });

      setTimeout(() => {
        setIsPlayingAudio(false);
      }, (notes.length * 0.15 + duration) * 1000);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
      setIsPlayingAudio(false);
    }
  };

  // Run kinetic video animation loop
  useEffect(() => {
    if (activeMediaTab !== 'video' || !payload.video) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const speed = payload.video.speed || 1.0;
    const complexity = payload.video.complexity || 3;

    const renderLoop = () => {
      time += 0.02 * speed;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, w, h);

      // Draw Lissajous Phase / Dynamic Kinetic Manifold
      ctx.lineWidth = 2;
      for (let k = 1; k <= complexity; k++) {
        ctx.beginPath();
        ctx.strokeStyle = k === 1 ? '#10b981' : k === 2 ? '#06b6d4' : '#a855f7';
        for (let t = 0; t < Math.PI * 2; t += 0.02) {
          const a = 3 + k;
          const b = 2 + k;
          const delta = time * k * 0.5;
          const r = 60 + k * 18;
          const x = cx + r * Math.sin(a * t + delta);
          const y = cy + (r * 0.75) * Math.sin(b * t);

          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw Center Autopoietic Node
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cx + 10 * Math.sin(time), cy + 10 * Math.cos(time), 4, 0, Math.PI * 2);
      ctx.fill();

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activeMediaTab, payload.video]);

  const handleCopyCode = () => {
    if (!payload.code) return;
    navigator.clipboard.writeText(payload.code.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableTabs: { id: 'visual' | 'video' | 'audio' | 'code'; label: string; icon: any }[] = [
    ...(payload.image ? [{ id: 'visual' as const, label: 'Image / Manifold', icon: ImageIcon }] : []),
    ...(payload.video ? [{ id: 'video' as const, label: 'Kinetic Video Loop', icon: Video }] : []),
    ...(payload.audio ? [{ id: 'audio' as const, label: 'Audio Waveform', icon: Volume2 }] : []),
    ...(payload.code ? [{ id: 'code' as const, label: 'Code Snippet', icon: Code }] : [])
  ];

  if (availableTabs.length === 0) return null;

  return (
    <div className="bg-[#040814] border border-slate-800 rounded-lg p-2.5 font-mono text-[9.5px] space-y-2">
      {/* Media Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1">
          {availableTabs.map((t) => {
            const Icon = t.icon;
            const isAct = activeMediaTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveMediaTab(t.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-bold cursor-pointer transition-all ${
                  isAct
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                    : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">MULTIMODAL ARTIFACT</span>
      </div>

      {/* Media Content Display */}
      <div className="bg-black rounded border border-slate-800/80 p-2 min-h-[140px] flex items-center justify-center relative overflow-hidden">
        {/* 1. Visual Image / SVG Manifold */}
        {activeMediaTab === 'visual' && payload.image && (
          <div className="w-full h-36 flex flex-col items-center justify-center p-2">
            {payload.image.svgCode ? (
              <div
                className="w-28 h-28 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: payload.image.svgCode }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full border border-cyan-500/50 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
            )}
            {payload.image.prompt && (
              <span className="text-[8px] text-slate-400 mt-1 italic text-center truncate max-w-xs">
                "{payload.image.prompt}"
              </span>
            )}
          </div>
        )}

        {/* 2. Kinetic Video Loop (Lissajous / Attractor Canvas) */}
        {activeMediaTab === 'video' && payload.video && (
          <div className="w-full flex flex-col items-center justify-center">
            <canvas
              ref={videoCanvasRef}
              width={260}
              height={140}
              className="rounded border border-slate-800/60 max-w-full"
            />
            <div className="flex items-center justify-between w-full px-2 pt-1 text-[8px] text-slate-500">
              <span>Pattern: {payload.video.type}</span>
              <span>Speed: {payload.video.speed}x | {payload.video.fps} FPS</span>
            </div>
          </div>
        )}

        {/* 3. Audio Waveform & Harmonic Synthesizer */}
        {activeMediaTab === 'audio' && payload.audio && (
          <div className="w-full flex flex-col items-center justify-center space-y-2 p-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-bold cursor-pointer transition-all border shadow-sm ${
                  isPlayingAudio
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse'
                    : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-500'
                }`}
              >
                {isPlayingAudio ? <Square className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-cyan-400" />}
                <span>{isPlayingAudio ? 'Oscillating...' : `Play Synth (${payload.audio.freqHz}Hz)`}</span>
              </button>
            </div>

            <div className="w-full bg-[#070d1a] border border-slate-800 p-1.5 rounded flex items-center justify-around text-[8px] text-slate-400 font-mono">
              <span>Waveform: <strong className="text-cyan-300">{payload.audio.waveform}</strong></span>
              <span>Base: <strong className="text-emerald-300">{payload.audio.freqHz} Hz</strong></span>
              <span>Duration: <strong className="text-purple-300">{payload.audio.durationSec}s</strong></span>
            </div>
          </div>
        )}

        {/* 4. Code Snippet Viewer with Copy/Run */}
        {activeMediaTab === 'code' && payload.code && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-[8px] text-slate-400">
              <span className="font-bold text-cyan-400">{payload.code.language.toUpperCase()}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyCode}
                  className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                {onCodeRun && (
                  <button
                    onClick={() => onCodeRun(payload.code!.snippet)}
                    className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Run</span>
                  </button>
                )}
              </div>
            </div>
            <pre className="bg-[#050811] p-2 rounded border border-slate-800/80 text-[8.5px] font-mono text-cyan-200 overflow-x-auto max-h-28 select-all whitespace-pre-wrap">
              {payload.code.snippet}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

