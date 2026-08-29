import React, { useState, useRef } from 'react';
import { Music, Play, Square, Volume2, Cpu, Activity } from 'lucide-react';
import { useAsmTelemetry } from '../../context/AsmTelemetryContext';

export const MidiSynthView: React.FC = () => {
  const { telemetry: asmTel, stepAsmCycle, injectChatMessage } = useAsmTelemetry();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [baseFreq, setBaseFreq] = useState<number>(432); // 432Hz harmonic tuning
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const notes = [
    { name: 'C4', midi: 60, ratio: 1.0 },
    { name: 'D4', midi: 62, ratio: 9 / 8 },
    { name: 'E4', midi: 64, ratio: 5 / 4 },
    { name: 'F4', midi: 65, ratio: 4 / 3 },
    { name: 'G4', midi: 67, ratio: 3 / 2 },
    { name: 'A4', midi: 69, ratio: 5 / 3 },
    { name: 'B4', midi: 71, ratio: 15 / 8 },
    { name: 'C5', midi: 72, ratio: 2.0 }
  ];

  const playFreq = (freq: number, noteMidi: number) => {
    // Pulse ASM telemetry cycle
    stepAsmCycle();
    injectChatMessage('AGENT', noteMidi);

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);

      oscRef.current = osc;
      setActiveNote(noteMidi);
      setIsPlaying(true);
      setTimeout(() => setActiveNote(null), 500);
    } catch (e) {
      console.warn("WebAudio context not accessible:", e);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#020205] font-mono">
      {/* Banner */}
      <div className="bg-[#090d16] border border-fuchsia-500/30 rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-fuchsia-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
              Covalent MIDI Polyphonic Synthesizer (Node #12 / 432Hz Pythagorean Tuning)
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Discrete frequency harmonic generator and Pythagorean Just Intonation acoustic ratio engine.
          </p>
        </div>
        <span className="text-[9px] bg-black/60 border border-fuchsia-500/40 text-fuchsia-300 px-2 py-1 rounded font-bold">
          432.00 HZ BASE
        </span>
      </div>

      {/* Keyboard Grid */}
      <div className="bg-[#050811] border border-slate-800 rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-cyan-400 uppercase">
            Pythagorean Harmonic Key Matrix
          </span>
          <span className="text-[9px] text-slate-500">Click keys to trigger harmonic resonance</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {notes.map(n => {
            const freq = baseFreq * (n.ratio * 0.5);
            const isActive = activeNote === n.midi;
            return (
              <button
                key={n.midi}
                onClick={() => playFreq(freq, n.midi)}
                className={`p-3 rounded-md border flex flex-col items-center justify-between min-h-[90px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-fuchsia-900/80 border-fuchsia-400 text-white shadow-[0_0_20px_rgba(232,121,249,0.5)] scale-95'
                    : 'bg-black/60 border-slate-800 text-slate-300 hover:border-fuchsia-500/50 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs font-bold">{n.name}</span>
                <span className="text-[9px] text-fuchsia-400">{freq.toFixed(1)}Hz</span>
                <span className="text-[8px] text-slate-500">M#{n.midi}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live ASM Oscillator Synchronizer */}
      <div className="bg-[#050811] border border-fuchsia-500/30 rounded-md p-3 text-[9.5px] space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <span className="font-bold text-fuchsia-300 flex items-center gap-1.5 uppercase">
            <Cpu className="w-3.5 h-3.5 text-fuchsia-400" />
            ASM CPU Clock & Harmonic Frequency Ratio Generator
          </span>
          <span className="text-[9px] text-slate-400 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
            Clock: {asmTel.clockHz} Hz | Cycle #{asmTel.cycleCount}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 pt-1">
          <span>%rax: <strong className="text-cyan-300">{asmTel.registers.RAX}</strong></span>
          <span>%rcx (Tick Loop): <strong className="text-emerald-300">{asmTel.registers.RCX}</strong></span>
          <span>Knowledge State [S_t]: <strong className="text-purple-300">0x{asmTel.knowledgeHorizons.S_t.toString(16)}</strong></span>
          <span>Status: <strong className={asmTel.allPredicatesValid ? 'text-emerald-400' : 'text-rose-400'}>{asmTel.stabilityStatus}</strong></span>
        </div>
      </div>
    </div>
  );
};

