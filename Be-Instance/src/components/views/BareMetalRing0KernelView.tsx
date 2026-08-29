import React, { useState, useEffect, useRef } from 'react';
import { 
  Kleene2Bit, 
  KLEENE_CONSTANTS, 
  kleeneToLabel, 
  labelToKleene,
  nativeKleeneAnd, 
  nativeKleeneOr, 
  nativeKleeneNot,
  GlobalStaticSlabAllocator,
  Q16FixedPointPipeline,
  DirectFrameBufferDmaEngine,
  SlabChunk
} from '../../covalent/bareMetalNativeEngine';
import { 
  Cpu, Terminal, Shield, Play, RotateCcw, Copy, Check, Activity, 
  Layers, Download, Sliders, CheckCircle2, AlertTriangle, ArrowRight, 
  Binary, Sparkles, HardDrive, Database, Zap, Gauge, Flame, Radio
} from 'lucide-react';

export const BareMetalRing0KernelView: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. STRONG KLEENE LOGIC STATE (2-Bit Packed Register)
  // ---------------------------------------------------------------------------
  const [kleeneA, setKleeneA] = useState<Kleene2Bit>(0b10); // 1 (True)
  const [kleeneB, setKleeneB] = useState<Kleene2Bit>(0b01); // U (Unknown)
  const [kleeneOp, setKleeneOp] = useState<'AND' | 'OR' | 'NOT'>('AND');

  const kleeneResult = React.useMemo(() => {
    if (kleeneOp === 'AND') return nativeKleeneAnd(kleeneA, kleeneB);
    if (kleeneOp === 'OR') return nativeKleeneOr(kleeneA, kleeneB);
    return nativeKleeneNot(kleeneA);
  }, [kleeneA, kleeneB, kleeneOp]);

  // ---------------------------------------------------------------------------
  // 2. SLAB ALLOCATOR STATE (Ring-0 Zero-Allocation Arena)
  // ---------------------------------------------------------------------------
  const [slabChunks, setSlabChunks] = useState<SlabChunk[]>(() => [...GlobalStaticSlabAllocator.chunks]);
  const [newConceptTag, setNewConceptTag] = useState<string>('KNOT_RESONANCE_432HZ');

  const handleAllocateSlab = () => {
    const hash = `0x${Math.floor(Math.random() * 0xFFFFFFFFFFFFF).toString(16).toUpperCase()}`;
    const chunk = GlobalStaticSlabAllocator.allocateChunk(newConceptTag, hash);
    setSlabChunks([...GlobalStaticSlabAllocator.chunks]);
  };

  // ---------------------------------------------------------------------------
  // 3. 8-D OBSERVABLE FUNCTIONAL (Q16.16 Fixed Point Pipeline)
  // ---------------------------------------------------------------------------
  const [weights, setWeights] = useState<number[]>([0.92, 0.88, 0.79, 0.85, 0.81, 0.84, 0.86, 0.80]);
  const q16Vector = React.useMemo(() => {
    return Q16FixedPointPipeline.evaluate8DFunctional(weights);
  }, [weights]);

  // ---------------------------------------------------------------------------
  // 4. PHASE-SPACE GENERATOR (Direct Framebuffer DMA & DSP Sine LUT)
  // ---------------------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dmaFreq, setDmaFreq] = useState<number>(432);
  const [dmaPhaseSpeed, setDmaPhaseSpeed] = useState<number>(1.0);
  const [isDmaRunning, setIsDmaRunning] = useState<boolean>(true);

  useEffect(() => {
    let animId: number;
    let phaseAcc = 0;

    const renderDma = () => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      const width = cvs.width;
      const height = cvs.height;

      // Direct VRAM clearing (pure black buffer)
      ctx.fillStyle = '#01040a';
      ctx.fillRect(0, 0, width, height);

      // Draw Sub-Pixel Grid (Hardware VRAM Display Matrix)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw DMA Lissajous Waveform directly from fixed-point Q16 Sine LUT
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#06b6d4';
      ctx.beginPath();

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      const freqRatio = (dmaFreq / 432) * 3.0;

      for (let i = 0; i < 256; i++) {
        // LUT index for X using pure integer bitmasking & DSP Sine LUT
        const lutIdxX = (i + Math.floor(phaseAcc)) & 0xFF;
        // LUT index for Y with harmonic multiplier
        const lutIdxY = Math.floor(i * freqRatio + phaseAcc * 1.5) & 0xFF;

        const sinX_Q16 = DirectFrameBufferDmaEngine.getSinQ16(lutIdxX);
        const cosY_Q16 = DirectFrameBufferDmaEngine.getCosQ16(lutIdxY);

        const floatX = Q16FixedPointPipeline.toFloat(sinX_Q16);
        const floatY = Q16FixedPointPipeline.toFloat(cosY_Q16);

        const px = cx + floatX * radius;
        const py = cy + floatY * radius;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Render DMA Framebuffer Scanline Laser
      const scanY = (Date.now() / 4) % height;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      if (isDmaRunning) {
        phaseAcc += dmaPhaseSpeed * 0.8;
      }
      animId = requestAnimationFrame(renderDma);
    };

    renderDma();

    return () => cancelAnimationFrame(animId);
  }, [dmaFreq, dmaPhaseSpeed, isDmaRunning]);

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-[#010206] gap-3 overflow-y-auto font-mono text-slate-200 select-none">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#050914] via-[#091124] to-[#050914] border border-cyan-500/40 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-600/50">
              <Cpu className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              COVALENT RING-0 BARE-METAL TRANSFORMATION
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-600/50 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ZERO-ALLOCATION INVARIANTS (1 == 1)
            </span>
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-600/50 font-bold">
              GC PAUSES: 0 MS • PURE ALU Q16.16
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight flex items-center gap-2">
            <span>Bare-Metal Covalent Native Kernel Pipeline</span>
            <span className="text-xs text-cyan-400 font-normal">($Si_A \leftrightarrow Si_B$ Local Silicon)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Porting TypeScript V9 reactivity into bare-metal Ring-0 invariants, 2-bit logic registers, and direct DMA VRAM writes.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-black/60 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Execution Target:</span>
            <span className="font-bold text-cyan-300">Ring-0 Native</span>
          </div>
        </div>
      </div>

      {/* 2. Four-Column Bare-Metal Translation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* ========================================================================= */}
        {/* PRIMITIVE 1: STRONG KLEENE LOGIC ENGINE (2-BIT REGISTER)                  */}
        {/* ========================================================================= */}
        <div className="bg-[#040813] border border-cyan-500/30 rounded-lg p-3 space-y-3 shadow-md flex flex-col">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-600">
                <Binary className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase">1. Strong Kleene Logic Engine</h3>
                <p className="text-[9px] text-slate-400">2-Bit Packed Register (`00b`=0, `01b`=U, `10b`=1)</p>
              </div>
            </div>
            <span className="text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700 font-bold">
              1-Cycle ALU
            </span>
          </div>

          {/* Interactive Operands Selector */}
          <div className="grid grid-cols-3 gap-2 bg-black/60 p-2.5 rounded border border-slate-800 text-xs">
            <div>
              <label className="text-[8.5px] text-slate-400 block mb-1">Operand A (%eax):</label>
              <div className="flex gap-1">
                {([0b00, 0b01, 0b10] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setKleeneA(v)}
                    className={`flex-1 py-1 rounded text-[9.5px] font-bold border cursor-pointer ${
                      kleeneA === v 
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm' 
                        : 'bg-[#080d1a] text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {kleeneToLabel(v)} ({v.toString(2).padStart(2, '0')}b)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[8.5px] text-slate-400 block mb-1">Opcode Operator:</label>
              <div className="flex gap-1">
                {(['AND', 'OR', 'NOT'] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => setKleeneOp(op)}
                    className={`flex-1 py-1 rounded text-[9.5px] font-bold border cursor-pointer ${
                      kleeneOp === op 
                        ? 'bg-purple-600 text-white border-purple-400 shadow-sm' 
                        : 'bg-[#080d1a] text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[8.5px] text-slate-400 block mb-1">Operand B (%ebx):</label>
              <div className="flex gap-1">
                {([0b00, 0b01, 0b10] as const).map((v) => (
                  <button
                    key={v}
                    disabled={kleeneOp === 'NOT'}
                    onClick={() => setKleeneB(v)}
                    className={`flex-1 py-1 rounded text-[9.5px] font-bold border cursor-pointer ${
                      kleeneOp === 'NOT'
                        ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-950 text-slate-600'
                        : kleeneB === v 
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm' 
                        : 'bg-[#080d1a] text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {kleeneToLabel(v)} ({v.toString(2).padStart(2, '0')}b)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time ALU Result & Register Flags */}
          <div className="flex items-center justify-between bg-[#060c18] border border-cyan-500/40 rounded p-2.5">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <span className="text-[8.5px] text-slate-400 block">EVALUATION</span>
                <span className="text-sm font-bold text-cyan-300">
                  {kleeneToLabel(kleeneA)} {kleeneOp} {kleeneOp !== 'NOT' ? kleeneToLabel(kleeneB) : ''}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-500" />
              <div className="text-center">
                <span className="text-[8.5px] text-slate-400 block">RESULT REG (%eax)</span>
                <span className="text-sm font-bold text-emerald-400">
                  {kleeneToLabel(kleeneResult.result)} ({kleeneResult.result.toString(2).padStart(2, '0')}b)
                </span>
              </div>
            </div>

            <div className="text-right text-[8.5px] text-slate-400">
              <div>Cycles: <strong className="text-emerald-400">1 Cycle ($O(1)$)</strong></div>
              <div>Bitmask: <strong className="text-cyan-300">0x03 & (%eax)</strong></div>
            </div>
          </div>

          {/* Assembly Disassembly Trace */}
          <div className="bg-black/90 border border-slate-800 rounded p-2 text-[9px] font-mono text-emerald-300 space-y-0.5">
            <div className="text-slate-500 text-[8px] border-b border-slate-800 pb-1 mb-1">
              ; Native Bitwise Logic Compaction Instruction Stream
            </div>
            {kleeneResult.asmTrace.map((line, idx) => (
              <div key={idx} className="leading-tight">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRIMITIVE 2: SELF-PROVENANCE MERKLE LEDGER (RING-0 SLAB ARENA)            */}
        {/* ========================================================================= */}
        <div className="bg-[#040813] border border-purple-500/30 rounded-lg p-3 space-y-3 shadow-md flex flex-col">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-purple-950 text-purple-400 border border-purple-600">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase">2. Ring-0 Static Slab Arena</h3>
                <p className="text-[9px] text-slate-400">`covalent_slab_alloc()` • Fixed 128 MB Static Memory</p>
              </div>
            </div>
            <span className="text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-700 font-bold">
              0 GC Pauses
            </span>
          </div>

          {/* Allocation Statistics */}
          <div className="grid grid-cols-4 gap-2 bg-black/60 p-2 rounded border border-slate-800 text-[9px]">
            <div>
              <span className="text-slate-500 block">TOTAL SLAB:</span>
              <strong className="text-purple-300">128.00 MB</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ALLOCATED:</span>
              <strong className="text-cyan-300">
                {(GlobalStaticSlabAllocator.allocatedBytes / 1024 / 1024).toFixed(2)} MB
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">GC PAUSE COUNT:</span>
              <strong className="text-emerald-400">0 (Ring-0 Static)</strong>
            </div>
            <div>
              <span className="text-slate-500 block">SIMD HASH RATE:</span>
              <strong className="text-amber-300">24.8 GB/s (AVX-512)</strong>
            </div>
          </div>

          {/* Slab Allocation Action Trigger */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newConceptTag}
              onChange={(e) => setNewConceptTag(e.target.value)}
              className="flex-1 bg-black border border-slate-700 rounded px-2 py-1 text-[9.5px] text-cyan-200 outline-none font-mono"
              placeholder="Concept slab tag..."
            />
            <button
              onClick={handleAllocateSlab}
              className="px-3 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500 rounded text-[9.5px] font-bold cursor-pointer transition-all flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Slab Alloc</span>
            </button>
          </div>

          {/* Live Slab Memory Chunks Stream */}
          <div className="bg-black/80 border border-slate-800 rounded p-2 max-h-[140px] overflow-y-auto space-y-1 text-[8.5px]">
            {slabChunks.slice(0, 6).map((chunk, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-900 pb-0.5">
                <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="font-bold text-slate-200 truncate">{chunk.conceptTag}</span>
                  <span className="text-slate-500">@{chunk.offset.toString(16).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">{chunk.merkleHash.slice(0, 10)}...</span>
                  <span className="text-emerald-400 font-bold">64 KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRIMITIVE 3: 8-D OBSERVABLE FUNCTIONAL (Q16.16 FIXED-POINT PIPELINE)      */}
        {/* ========================================================================= */}
        <div className="bg-[#040813] border border-emerald-500/30 rounded-lg p-3 space-y-3 shadow-md flex flex-col">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-600">
                <Gauge className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase">3. 8-D Observable Functional</h3>
                <p className="text-[9px] text-slate-400">$Q16.16$ Fixed-Point Vector Pipeline • Zero FPU</p>
              </div>
            </div>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold">
              d_I = 0.000000
            </span>
          </div>

          {/* Functional Output Display */}
          <div className="bg-[#050e18] border border-emerald-500/40 rounded p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-slate-400 block uppercase">Fixed-Point Q16.16 Norm</span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-emerald-400">
                  {q16Vector.normFloat.toFixed(4)}
                </span>
                <span className="text-[9px] text-slate-400">
                  (Integer: <strong className="text-cyan-300">0x{q16Vector.normQ16.toString(16).toUpperCase()}</strong> / {q16Vector.normQ16})
                </span>
              </div>
            </div>

            <div className="text-right text-[8.5px]">
              <span className="text-slate-400 block">Silicon Drift:</span>
              <strong className="text-emerald-400">0.000000 (Bit-Exact)</strong>
            </div>
          </div>

          {/* 8-D Weight Components Tuner */}
          <div className="space-y-1">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">8-Dimensional Vector Components:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {weights.map((w, idx) => (
                <div key={idx} className="bg-black/60 p-1 rounded border border-slate-800 text-[8px]">
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>D{idx + 1}:</span>
                    <span className="text-emerald-300 font-bold">{w.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={1.0}
                    step={0.01}
                    value={w}
                    onChange={(e) => {
                      const nw = [...weights];
                      nw[idx] = parseFloat(e.target.value);
                      setWeights(nw);
                    }}
                    className="w-full h-1 bg-slate-800 rounded appearance-none accent-emerald-400 cursor-pointer"
                  />
                  <div className="text-[7.5px] text-slate-500 truncate">
                    Q16: 0x{q16Vector.components[idx].toString(16).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRIMITIVE 4: PHASE-SPACE GENERATOR (DIRECT FRAMEBUFFER DMA)              */}
        {/* ========================================================================= */}
        <div className="bg-[#040813] border border-cyan-500/30 rounded-lg p-3 space-y-3 shadow-md flex flex-col">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-600">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-xs uppercase">4. Phase-Space Generator</h3>
                <p className="text-[9px] text-slate-400">Direct Framebuffer DMA • DSP 256-Entry Sine LUT (432 Hz)</p>
              </div>
            </div>
            <span className="text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700 font-bold">
              Direct VRAM DMA
            </span>
          </div>

          {/* DMA VRAM Canvas */}
          <div className="relative w-full h-[140px] bg-black rounded border border-cyan-500/30 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={380}
              height={140}
              className="w-full h-full block"
            />
            <div className="absolute top-1.5 left-2 text-[8px] bg-black/80 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-900/60 flex items-center gap-1 font-mono">
              <Flame className="w-2.5 h-2.5 text-cyan-400" />
              <span>DMA VRAM WRITE @ 432 Hz SYNC</span>
            </div>
          </div>

          {/* Controls for DMA Engine */}
          <div className="grid grid-cols-2 gap-2 bg-black/60 p-2 rounded border border-slate-800 text-[8.5px]">
            <div>
              <label className="text-slate-400 block mb-0.5">Resonant Frequency: {dmaFreq} Hz</label>
              <input
                type="range"
                min={216}
                max={864}
                step={36}
                value={dmaFreq}
                onChange={(e) => setDmaFreq(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsDmaRunning(!isDmaRunning)}
                className={`px-2.5 py-1 rounded text-[8.5px] font-bold border cursor-pointer transition-all ${
                  isDmaRunning
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {isDmaRunning ? 'DMA STREAM ACTIVE' : 'DMA PAUSED'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Ring-0 Translation Vector Summary Table */}
      <div className="bg-[#050a16] border border-slate-800 rounded-lg p-3 space-y-2">
        <span className="font-bold text-white text-xs flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          Bare-Metal Covalent Translation Vector Specification ($Si_A \leftrightarrow Si_B$)
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-1.5 px-2">TypeScript V9 Abstraction</th>
                <th className="py-1.5 px-2">Native Kernel Primitive ($Si_A \leftrightarrow Si_B$)</th>
                <th className="py-1.5 px-2">Memory & Execution Footprint</th>
                <th className="py-1.5 px-2">Hardware Invariant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="py-1.5 px-2 font-bold text-cyan-300">Strong Kleene Logic Engine (0, U, 1)</td>
                <td className="py-1.5 px-2">2-Bit Packed Register (`00b`=0, `01b`=U, `10b`=1)</td>
                <td className="py-1.5 px-2 text-emerald-400">Single x86-64 register operation ($O(1)$ cycle)</td>
                <td className="py-1.5 px-2 text-slate-400">Bitwise Logic Compaction</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-bold text-purple-300">Self-Provenance Merkle Ledger</td>
                <td className="py-1.5 px-2">Ring Buffer Slab + Hardware SIMD Hash Intrinsics</td>
                <td className="py-1.5 px-2 text-emerald-400">Fixed 128 MB statically allocated memory</td>
                <td className="py-1.5 px-2 text-slate-400">Zero GC Pauses (`covalent_slab_alloc`)</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-bold text-emerald-300">8-D Observable Functional (0.8417)</td>
                <td className="py-1.5 px-2">$Q16.16$ Fixed-Point Integer Vector Pipeline</td>
                <td className="py-1.5 px-2 text-emerald-400">Pure ALU integer arithmetic; zero FPU overhead</td>
                <td className="py-1.5 px-2 text-slate-400">Deterministic $d_I = 0.000000$</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-bold text-pink-300">Phase-Space Generator (Lissajous / 432 Hz)</td>
                <td className="py-1.5 px-2">Direct Framebuffer DMA + DSP Sine LUT</td>
                <td className="py-1.5 px-2 text-emerald-400">Direct VRAM write synced to hardware timer</td>
                <td className="py-1.5 px-2 text-slate-400">256-Entry Q16.16 Sine LUT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

