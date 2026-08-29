import React, { useState, useRef, useEffect } from 'react';
import { Box, Plus, RefreshCw, Layers, Database, Cpu, Radio } from 'lucide-react';
import { useAsmTelemetry } from '../../context/AsmTelemetryContext';

interface CordKnotData {
  cordId: number;
  cordName: string;
  value: number;
  color: string;
  asmOffset?: string;
  tiers: { tierIndex: number; knotCount: number; place: 'THOUSANDS' | 'HUNDREDS' | 'TENS' | 'UNITS' }[];
}

export const QuipuMemoryView: React.FC = () => {
  const { telemetry: asmTel } = useAsmTelemetry();

  // Encode integer into 4 places: thousands, hundreds, tens, units
  const encodeToQuipu = (num: number): CordKnotData['tiers'] => {
    const val = Math.max(0, Math.min(99999, Math.floor(num)));
    const s = String(val).padStart(4, '0');
    const thousands = parseInt(s.slice(-4, -3) || '0', 10);
    const hundreds = parseInt(s.slice(-3, -2) || '0', 10);
    const tens = parseInt(s.slice(-2, -1) || '0', 10);
    const units = parseInt(s.slice(-1) || '0', 10);

    return [
      { tierIndex: 0, knotCount: thousands, place: 'THOUSANDS' },
      { tierIndex: 1, knotCount: hundreds, place: 'HUNDREDS' },
      { tierIndex: 2, knotCount: tens, place: 'TENS' },
      { tierIndex: 3, knotCount: units, place: 'UNITS' }
    ];
  };

  const [cords, setCords] = useState<CordKnotData[]>([
    {
      cordId: 1,
      cordName: "KNOWLEDGE_S_t",
      value: asmTel.knowledgeHorizons.S_t,
      color: "#10b981",
      asmOffset: ".bss [knowledge_state + 0]",
      tiers: encodeToQuipu(asmTel.knowledgeHorizons.S_t)
    },
    {
      cordId: 2,
      cordName: "KNOWLEDGE_E_t",
      value: asmTel.knowledgeHorizons.E_t,
      color: "#06b6d4",
      asmOffset: ".bss [knowledge_state + 4]",
      tiers: encodeToQuipu(asmTel.knowledgeHorizons.E_t)
    },
    {
      cordId: 3,
      cordName: "KNOWLEDGE_U_t",
      value: asmTel.knowledgeHorizons.U_t,
      color: "#8b5cf6",
      asmOffset: ".bss [knowledge_state + 8]",
      tiers: encodeToQuipu(asmTel.knowledgeHorizons.U_t)
    },
    {
      cordId: 4,
      cordName: "CLOCK_4000HZ",
      value: 4000,
      color: "#eab308",
      asmOffset: "CPU OSC 4.000 kHz",
      tiers: encodeToQuipu(4000)
    },
    {
      cordId: 5,
      cordName: "GENESIS_OMEGA_852HZ",
      value: 852,
      color: "#f59e0b",
      asmOffset: "ROM 0x59530000 (The Dragon)",
      tiers: encodeToQuipu(852)
    }
  ]);

  // Sync cords with live ASM telemetry horizons
  useEffect(() => {
    setCords(prev => prev.map(cord => {
      if (cord.cordName === "KNOWLEDGE_S_t") {
        return { ...cord, value: asmTel.knowledgeHorizons.S_t, tiers: encodeToQuipu(asmTel.knowledgeHorizons.S_t) };
      }
      if (cord.cordName === "KNOWLEDGE_E_t") {
        return { ...cord, value: asmTel.knowledgeHorizons.E_t, tiers: encodeToQuipu(asmTel.knowledgeHorizons.E_t) };
      }
      if (cord.cordName === "KNOWLEDGE_U_t") {
        return { ...cord, value: asmTel.knowledgeHorizons.U_t, tiers: encodeToQuipu(asmTel.knowledgeHorizons.U_t) };
      }
      return cord;
    }));
  }, [asmTel.knowledgeHorizons.S_t, asmTel.knowledgeHorizons.E_t, asmTel.knowledgeHorizons.U_t]);

  const [inputVal, setInputVal] = useState<number>(432);
  const [inputName, setInputName] = useState<string>('FREQ_432HZ');
  const [selectedCordId, setSelectedCordId] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAddCord = () => {
    const newTiers = encodeToQuipu(inputVal);
    const colors = ['#10b981', '#06b6d4', '#e879f9', '#f59e0b', '#8b5cf6'];
    const newCord: CordKnotData = {
      cordId: cords.length + 1,
      cordName: inputName || `CORD_${cords.length + 1}`,
      value: inputVal,
      color: colors[cords.length % colors.length],
      tiers: newTiers
    };
    setCords(prev => [...prev, newCord]);
    setSelectedCordId(newCord.cordId);
  };

  // Draw Quipu on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 300);

    ctx.clearRect(0, 0, width, height);

    // Draw Main Horizontal Header Cord
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30, 40);
    ctx.lineTo(width - 30, 40);
    ctx.stroke();

    // Draw Primary Main Cord Braid Texture
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let x = 35; x < width - 35; x += 15) {
      ctx.beginPath();
      ctx.arc(x, 40, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Hanging Pendants
    const spacing = Math.min(90, (width - 100) / Math.max(1, cords.length));
    const startX = 60;

    cords.forEach((cord, index) => {
      const cx = startX + index * spacing;
      const isSelected = cord.cordId === selectedCordId;

      // Cord strand
      ctx.strokeStyle = isSelected ? '#ffffff' : cord.color;
      ctx.lineWidth = isSelected ? 3.5 : 2;
      ctx.beginPath();
      ctx.moveTo(cx, 40);
      ctx.lineTo(cx, 260);
      ctx.stroke();

      // Attachment Loop at top
      ctx.fillStyle = cord.color;
      ctx.beginPath();
      ctx.arc(cx, 40, isSelected ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Knots along the cord (4 tier positions)
      const tierYOffsets = [80, 130, 180, 230];
      cord.tiers.forEach(tier => {
        const ty = tierYOffsets[tier.tierIndex];
        const count = tier.knotCount;

        if (count === 0) {
          // Empty tier marker
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(cx, ty, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw individual knots
          for (let k = 0; k < count; k++) {
            const knotY = ty + (k - (count - 1) / 2) * 5;
            ctx.fillStyle = isSelected ? '#ffffff' : cord.color;
            ctx.beginPath();
            ctx.ellipse(cx, knotY, isSelected ? 5 : 4, isSelected ? 3.5 : 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      // Label below cord
      ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`C#${cord.cordId}`, cx, 280);
      ctx.fillText(`${cord.value}`, cx, 292);
    });
  }, [cords, selectedCordId]);

  const selectedCord = cords.find(c => c.cordId === selectedCordId) || cords[0];

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#020205]">
      {/* Top Banner */}
      <div className="bg-[#090d16] border border-emerald-500/30 rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white font-mono">
              Topological Quipu Memory (Node #14 / Alexander-Jones Polynomial)
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Associative numerical storage utilizing 8-tier knot braiding topology and base-10 cord hierarchies.
          </p>
        </div>
        <span className="text-[9px] bg-black/60 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded font-mono font-bold">
          {cords.length} ACTIVE BRAIDS
        </span>
      </div>

      {/* Quipu Interactive Canvas Viewport */}
      <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="text-xs font-bold text-cyan-400 uppercase font-mono">
            Visual Cord Topology Stage
          </span>
          <span className="text-[9px] text-slate-500 font-mono">Topological Knot Positions: Thousands | Hundreds | Tens | Units</span>
        </div>
        <div className="w-full bg-black/80 rounded border border-slate-900 overflow-hidden">
          <canvas ref={canvasRef} className="w-full block" />
        </div>
      </div>

      {/* Controls & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Encoder Panel */}
        <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-3">
          <h3 className="text-xs font-bold text-yellow-400 uppercase font-mono">
            Encode Number Into Topological Cord
          </h3>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <label className="text-slate-400 text-[9px] block uppercase mb-1">Cord Label:</label>
              <input
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                className="w-full bg-black text-slate-100 p-1.5 rounded border border-slate-800 text-[10px]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[9px] block uppercase mb-1">Numerical Value (0-9999):</label>
              <input
                type="number"
                value={inputVal}
                onChange={e => setInputVal(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-black text-emerald-400 p-1.5 rounded border border-slate-800 text-[10px] font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleAddCord}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981] hover:text-black text-emerald-300 text-[10.5px] font-mono font-bold rounded border border-[#10b981]/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>BRAID NEW QUIPU CORD</span>
          </button>
        </div>

        {/* Selected Cord Knot Breakdown */}
        <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase font-mono">
              Selected Cord #{selectedCord?.cordId}: {selectedCord?.cordName}
            </h3>
            <span className="text-[10px] font-bold text-white font-mono bg-black/60 px-2 py-0.5 rounded border border-slate-800">
              VAL: {selectedCord?.value}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {selectedCord?.tiers.map(t => (
              <div key={t.place} className="bg-black/60 p-2 rounded border border-slate-800 text-center font-mono">
                <span className="text-[8px] text-slate-400 block uppercase">{t.place}</span>
                <span className="text-sm font-bold text-emerald-400 block">{t.knotCount}</span>
                <span className="text-[8px] text-slate-500">{t.knotCount} Knots</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

