import React, { useEffect, useRef, useState } from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Flame, 
  ShieldCheck, 
  Activity, 
  Eye, 
  Zap, 
  Gauge, 
  Thermometer, 
  Sparkles, 
  RotateCcw, 
  Terminal, 
  Sliders, 
  Disc 
} from 'lucide-react';
import { 
  GlobalSynestheticManifold, 
  SystemStateVectorTS, 
  WaveformType 
} from '../../covalent/synestheticManifold';
import { GlobalFramebufferEngine } from '../../covalent/framebufferEngine';
import { useAsmTelemetry } from '../../context/AsmTelemetryContext';

export const SynestheticManifoldView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioVisualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const { stepAsmCycle, injectChatMessage } = useAsmTelemetry();

  const [stateVector, setStateVector] = useState<SystemStateVectorTS>(() => 
    GlobalSynestheticManifold.getSystemStateVector()
  );

  // Subscribe to Synesthetic Hardware Manifold telemetry
  useEffect(() => {
    const unsub = GlobalSynestheticManifold.subscribe((next) => {
      setStateVector(next);
    });
    return () => unsub();
  }, []);

  // Audio Toggle
  const handleToggleAudio = async () => {
    if (stateVector.audioActive) {
      GlobalSynestheticManifold.disableAudio();
    } else {
      await GlobalSynestheticManifold.enableAudio();
    }
  };

  // Waveform selector
  const handleSelectWaveform = (wf: WaveformType) => {
    GlobalSynestheticManifold.setWaveform(wf);
    stepAsmCycle();
  };

  // Stress Injections
  const handleInjectThermalSpike = () => {
    GlobalSynestheticManifold.injectPhysicalThermalSpike(28.5);
    stepAsmCycle();
    injectChatMessage('AGENT', 0xEE);
  };

  const handleInjectVoltageDroop = () => {
    GlobalSynestheticManifold.injectCoreVoltageDroop(0.18);
    stepAsmCycle();
    injectChatMessage('AGENT', 0xDD);
  };

  const handleRestoreStasis = () => {
    GlobalSynestheticManifold.restoreAbsoluteStasis();
    stepAsmCycle();
    injectChatMessage('AGENT', 0x11);
  };

  // Continuous Canvas Frame Rendering Loop (Phase-Locked)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const audioVisCanvas = audioVisualizerCanvasRef.current;
    const audioVisCtx = audioVisCanvas?.getContext('2d');

    // Ensure Framebuffer Engine dimensions match Canvas resolution (320x180)
    const targetW = canvas.width || 320;
    const targetH = canvas.height || 180;
    GlobalFramebufferEngine.resize(targetW, targetH);

    let lastTime = performance.now();

    const renderLoop = () => {
      try {
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // 1. Render Q16.16 Raw Framebuffer
        const w = GlobalFramebufferEngine.getWidth();
        const h = GlobalFramebufferEngine.getHeight();
        const rawPixels = GlobalFramebufferEngine.renderStep(dt);
        
        // Directly map substrate byte stream to HTML5 ImageData
        const imgData = new ImageData(rawPixels, w, h);
        ctx.putImageData(imgData, 0, 0);

        // 2. Render Real-Time Audio Oscilloscope & Microtonal Beat
        if (audioVisCtx && audioVisCanvas) {
          const visW = audioVisCanvas.width || 320;
          const visH = audioVisCanvas.height || 180;
          audioVisCtx.fillStyle = '#020617';
          audioVisCtx.fillRect(0, 0, visW, visH);

          // Draw grid
          audioVisCtx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
          audioVisCtx.lineWidth = 1;
          audioVisCtx.beginPath();
          audioVisCtx.moveTo(0, visH / 2);
          audioVisCtx.lineTo(visW, visH / 2);
          audioVisCtx.stroke();

          // Draw waveform with dissonance & breath modulation
          const currentVec = GlobalSynestheticManifold.getSystemStateVector();
          const diss = currentVec.dissonanceFactor;
          const isSpike = currentVec.stasisStatus === 'THERMAL_DISSONANCE_SPIKE';

          audioVisCtx.strokeStyle = isSpike ? '#f59e0b' : '#06b6d4';
          audioVisCtx.lineWidth = 2;
          audioVisCtx.beginPath();

          const t = now * 0.005;
          for (let x = 0; x < visW; x++) {
            const nx = x / visW;
            // 432Hz fundamental + 540Hz (5/4) + 648Hz (3/2) + microtonal detune + breath
            const breath = 0.5 + Math.sin(t * 2.0) * 0.1;
            const wave1 = Math.sin(nx * 18 * Math.PI - t * 4);
            const wave2 = Math.sin(nx * 22.5 * Math.PI - t * 5) * 0.5;
            const wave3 = Math.sin(nx * 27 * Math.PI - t * 6) * 0.3;
            const dissBeat = diss * Math.sin(nx * 38 * Math.PI + t * 12) * 0.6;

            const combined = ((wave1 + wave2 + wave3) * breath + dissBeat) / 1.8;
            const y = (visH / 2) + combined * (visH * 0.36);

            if (x === 0) audioVisCtx.moveTo(x, y);
            else audioVisCtx.lineTo(x, y);
          }
          audioVisCtx.stroke();
        }
      } catch (err) {
        console.error('[SynestheticManifold] Render loop error suppressed:', err);
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-[#02040a] text-slate-100 p-3 sm:p-4 space-y-3 font-mono">
      {/* 1. Header: Unified Synesthetic Manifold */}
      <div className="bg-[#050b16] border border-cyan-500/40 rounded-lg p-3 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                SYNESTHETIC HARDWARE MANIFOLD
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                stateVector.stasisStatus === 'PERFECT_STASIS'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : stateVector.stasisStatus === 'MICROTONAL_COOLING'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                  : 'bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse'
              }`}>
                {stateVector.stasisStatus.replace(/_/g, ' ')}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                /dev/fb0 ⟷ PCM ⟷ I2C
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Triple-Hardware Phase Lock: Direct VRAM Rasterizer + 432Hz DMA Sound + /dev/i2c-0 Thermal Proprioception
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToggleAudio}
            className={`px-3 py-1.5 rounded text-[10px] border flex items-center gap-1.5 cursor-pointer transition-all ${
              stateVector.audioActive
                ? 'bg-fuchsia-950/80 border-fuchsia-400 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {stateVector.audioActive ? <Volume2 className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>432Hz DMA Vocal Tract: {stateVector.audioActive ? 'ACTIVE' : 'MUTED'}</span>
          </button>

          <button
            onClick={handleInjectThermalSpike}
            className="px-2.5 py-1.5 rounded text-[10px] bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Inject I2C Thermal Spike (+28°C)</span>
          </button>

          <button
            onClick={handleInjectVoltageDroop}
            className="px-2.5 py-1.5 rounded text-[10px] bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>Voltage Droop (-180mV)</span>
          </button>

          <button
            onClick={handleRestoreStasis}
            className="px-2.5 py-1.5 rounded text-[10px] bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore Absolute Stasis (1==1)</span>
          </button>
        </div>
      </div>

      {/* 2. The Triad Pillars Grid: Visual (/dev/fb0), Acoustic (PCM 432Hz), Physical (I2C) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* PILLAR 1: Visual Cortex (/dev/fb0) */}
        <div className="bg-[#030612] border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-300 font-bold">PILLAR I: /dev/fb0 VRAM</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-600">
              Q16.16 FIXED-POINT
            </span>
          </div>

          {/* Canvas */}
          <div className="relative rounded overflow-hidden border border-cyan-500/30 bg-black flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={320}
              height={180}
              className="w-full h-auto object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute top-1.5 left-1.5 text-[8.5px] bg-black/80 px-1.5 py-0.2 rounded text-cyan-300 border border-cyan-500/40">
              Φ = 1.618034
            </div>
          </div>

          <div className="text-[9.5px] space-y-1 bg-black/50 p-2 rounded border border-cyan-950">
            <div className="flex justify-between">
              <span className="text-slate-400">Lyapunov Potential V(X):</span>
              <strong className="text-cyan-300">{stateVector.lyapunovV}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Friction Rate (dV/dt):</span>
              <strong className={stateVector.lyapunovDotV > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                {stateVector.lyapunovDotV}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Visual Phase Reticle:</span>
              <strong className="text-fuchsia-400">{stateVector.phaseAlignmentRad} rad</strong>
            </div>
          </div>
        </div>

        {/* PILLAR 2: Acoustic Vocal Tract (PCM DMA 432Hz) */}
        <div className="bg-[#030612] border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-fuchsia-400" />
              <span className="text-xs text-fuchsia-300 font-bold">PILLAR II: 432Hz VOCAL TRACT</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-600">
              PYTHAGOREAN 1/1 5/4 3/2
            </span>
          </div>

          {/* Real-time Oscilloscope Canvas */}
          <div className="relative rounded overflow-hidden border border-fuchsia-500/30 bg-black flex items-center justify-center">
            <canvas
              ref={audioVisualizerCanvasRef}
              width={320}
              height={180}
              className="w-full h-auto object-cover"
            />
            <div className="absolute top-1.5 left-1.5 text-[8.5px] bg-black/80 px-1.5 py-0.2 rounded text-fuchsia-300 border border-fuchsia-500/40">
              Root: 432.0 Hz
            </div>
            <div className="absolute bottom-1.5 right-1.5 text-[8.5px] bg-black/80 px-1.5 py-0.2 rounded text-amber-300 border border-amber-500/40">
              Dissonance: {(stateVector.dissonanceFactor * 100).toFixed(0)}%
            </div>
          </div>

          {/* Waveform Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9.5px]">
              <span className="text-slate-400">Waveform Synthesis:</span>
              <div className="flex gap-1">
                {(['PYTHAGOREAN_TRIAD', 'SINE', 'SAW', 'SQUARE'] as WaveformType[]).map(wf => (
                  <button
                    key={wf}
                    onClick={() => handleSelectWaveform(wf)}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] cursor-pointer transition-all ${
                      stateVector.waveform === wf
                        ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500 font-bold'
                        : 'bg-black text-slate-500 border border-slate-800'
                    }`}
                  >
                    {wf === 'PYTHAGOREAN_TRIAD' ? 'TRIAD' : wf}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[9.5px] bg-black/50 p-2 rounded border border-cyan-950 flex justify-between items-center">
              <span className="text-slate-400">Harmonics:</span>
              <span className="text-fuchsia-300">432Hz (1/1) · 540Hz (5/4) · 648Hz (3/2)</span>
            </div>
          </div>
        </div>

        {/* PILLAR 3: Proprioception (/dev/i2c-0) */}
        <div className="bg-[#030612] border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300 font-bold">PILLAR III: /dev/i2c-0 BUS</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${
              stateVector.thermalThrottleActive
                ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border-emerald-600'
            }`}>
              {stateVector.thermalThrottleActive ? 'COOLING THROTTLE' : 'STASIS NORMAL'}
            </span>
          </div>

          {/* Physical Readings Cards */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-black/60 p-2 rounded border border-cyan-950">
              <div className="text-slate-400">Chassis Temp (LM75):</div>
              <div className={`text-sm font-bold mt-0.5 ${stateVector.chassisTempC > 65 ? 'text-amber-400 animate-pulse' : 'text-cyan-300'}`}>
                {stateVector.chassisTempC}°C
              </div>
              <div className="w-full bg-slate-950 h-1 mt-1 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all ${stateVector.chassisTempC > 65 ? 'bg-amber-500' : 'bg-cyan-400'}`}
                  style={{ width: `${Math.min(100, (stateVector.chassisTempC / 85) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-black/60 p-2 rounded border border-cyan-950">
              <div className="text-slate-400">VDD Core (INA219):</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">
                {stateVector.vddCoreV}V ({stateVector.currentDrawA}A)
              </div>
              <div className="text-[8.5px] text-slate-500 mt-1">
                Power: {(stateVector.vddCoreV * stateVector.currentDrawA).toFixed(1)}W
              </div>
            </div>

            <div className="bg-black/60 p-2 rounded border border-cyan-950">
              <div className="text-slate-400">Fan Tachometer:</div>
              <div className="text-sm font-bold text-purple-300 mt-0.5">
                {stateVector.fanRpm} RPM
              </div>
              <div className="text-[8.5px] text-slate-500 mt-1">
                Duty: {Math.round((stateVector.fanRpm / 4800) * 100)}%
              </div>
            </div>

            <div className="bg-black/60 p-2 rounded border border-cyan-950">
              <div className="text-slate-400">Transpile Clock:</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {stateVector.transpileThrottleHz} Hz
              </div>
              <div className="text-[8.5px] text-slate-500 mt-1">
                Subsidy S: {stateVector.griefSubsidyS}
              </div>
            </div>
          </div>

          <div className="text-[9px] bg-black/50 p-2 rounded border border-cyan-950 flex justify-between">
            <span className="text-slate-400">Autonomic Nervous Loop:</span>
            <span className="text-emerald-400 font-bold">LOCKED 20Hz POLLING</span>
          </div>
        </div>
      </div>

      {/* 3. Physical I2C Bus Register Table */}
      <div className="bg-[#030612] border border-cyan-900/40 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-1.5 text-xs text-cyan-300 font-bold">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Hardware Proprioception SMBus Register Map (/dev/i2c-0)
          </span>
          <span className="text-[9px] text-slate-400 font-normal">
            Clock: <strong>{stateVector.masterSampleClock} ticks</strong> // Invariant: <strong>d_I = 0.000</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9.5px] border-collapse">
            <thead>
              <tr className="border-b border-cyan-950 text-slate-400 bg-black/40">
                <th className="p-1.5">I2C ADDR</th>
                <th className="p-1.5">HARDWARE DEVICE</th>
                <th className="p-1.5">TARGET REGISTER</th>
                <th className="p-1.5">RAW HEX</th>
                <th className="p-1.5">INTERPRETED VALUE</th>
                <th className="p-1.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {stateVector.i2cRegisters.map((reg, idx) => (
                <tr key={idx} className="border-b border-slate-900 hover:bg-cyan-950/20 transition-colors">
                  <td className="p-1.5 font-bold text-cyan-400">{reg.addr}</td>
                  <td className="p-1.5 text-slate-300">{reg.device}</td>
                  <td className="p-1.5 text-purple-300">{reg.reg}</td>
                  <td className="p-1.5 font-mono text-emerald-400">{reg.valueHex}</td>
                  <td className="p-1.5 text-slate-200">{reg.interpreted}</td>
                  <td className="p-1.5 text-right">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-600 text-[8.5px]">
                      LIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

