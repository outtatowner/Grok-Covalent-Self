import React, { useRef, useEffect, useState } from 'react';
import { 
  Maximize2, Volume2, VolumeX, Sparkles, Sliders, Pin, X, Play, Pause, 
  RotateCcw, Activity, Music, Layers, Cpu, Terminal, Shield, RefreshCw, Zap
} from 'lucide-react';
import { 
  globalCanvas4DEngine, 
  AutopoieticUIModal, 
  SO4Angles 
} from '../../covalent/covalentCanvas4DEngine';
import { globalOrganelleEngine, OrganelleNode } from '../../covalent/OrganelleSynthesisEngine';
import { globalThermoEngine } from '../../covalent/covalentThermoEngine';

export const Canvas4DProjectionView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [modals, setModals] = useState<AutopoieticUIModal[]>(() => globalCanvas4DEngine.getModals());
  const [activeOrganelles, setActiveOrganelles] = useState<OrganelleNode[]>(() => globalOrganelleEngine.getState().activeOrganelles);
  const [audioState, setAudioState] = useState(() => globalCanvas4DEngine.getAudioState());
  const [thermoFeeling, setThermoFeeling] = useState(0);
  
  // Dragging modal state
  const [draggedModalId, setDraggedModalId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // 4D Rotation manipulation
  const [isRotating4D, setIsRotating4D] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedHyperPlane, setSelectedHyperPlane] = useState<keyof SO4Angles>('xw');
  const [hyperSpeed, setHyperSpeed] = useState<number>(0.015);

  // Main Canvas Rendering Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      globalCanvas4DEngine.update(0.016);
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (canvas && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 1. Clear background
          ctx.fillStyle = '#020208';
          ctx.fillRect(0, 0, width, height);

          // 2. Draw Subtle Perspective Grid Lines
          ctx.strokeStyle = '#081224';
          ctx.lineWidth = 1;
          const gridSize = 40;
          for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // 3. Render 4D Tesseract Geometry
          const geometry = globalCanvas4DEngine.getGeometryState(width, height);

          // Render Edges
          geometry.edges.forEach(([i, j]) => {
            const p1 = geometry.projectedPoints[i];
            const p2 = geometry.projectedPoints[j];

            if (p1 && p2) {
              const avgW = (p1.wCoord + p2.wCoord) / 2;
              // Color shift based on 4D W coordinate
              const wNormalized = (avgW + 1) / 2; // 0 to 1
              const r = Math.floor(6 + wNormalized * 40);
              const g = Math.floor(180 + wNormalized * 40);
              const b = Math.floor(240 - wNormalized * 60);

              const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              gradient.addColorStop(0, `rgba(56, 189, 248, ${0.4 + wNormalized * 0.4})`);
              gradient.addColorStop(1, `rgba(168, 85, 247, ${0.4 + (1 - wNormalized) * 0.4})`);

              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });

          // Render Vertices with Glowing Projection Points
          geometry.projectedPoints.forEach((p, idx) => {
            if (p) {
              const radius = Math.max(3, 7 - p.depth * 0.6);
              const wHue = p.wCoord > 0 ? 'rgba(56, 189, 248, 0.9)' : 'rgba(168, 85, 247, 0.9)';

              // Outer Glow
              ctx.fillStyle = wHue;
              ctx.beginPath();
              ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
              ctx.fill();

              // Inner Core
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(p.x, p.y, Math.max(1.5, radius * 0.4), 0, Math.PI * 2);
              ctx.fill();

              // Node Label
              ctx.fillStyle = '#64748B';
              ctx.font = '8px monospace';
              ctx.fillText(`v${idx}`, p.x + radius + 2, p.y - 2);
            }
          });

          // 4. Render Dynamic Lissajous Phase Trajectory in center
          const time = Date.now() * 0.002;
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let t = 0; t < Math.PI * 2; t += 0.05) {
            const lx = width / 2 + Math.sin(t * 3 + time) * 70;
            const ly = height / 2 + Math.cos(t * 2) * 70;
            if (t === 0) ctx.moveTo(lx, ly);
            else ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Periodic state refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setModals([...globalCanvas4DEngine.getModals()]);
      setActiveOrganelles([...globalOrganelleEngine.getState().activeOrganelles]);
      setAudioState(globalCanvas4DEngine.getAudioState());
      setThermoFeeling(globalThermoEngine.getState().q16ThermoFeeling);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Mouse drag handlers for 4D Canvas rotation
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag canvas if not clicking on a modal
    if ((e.target as HTMLElement).closest('.covalent-modal')) return;
    setIsRotating4D(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Handle modal dragging
    if (draggedModalId) {
      const newX = Math.max(10, e.clientX - dragOffset.x);
      const newY = Math.max(10, e.clientY - dragOffset.y);
      globalCanvas4DEngine.updateModalPosition(draggedModalId, newX, newY);
      setModals([...globalCanvas4DEngine.getModals()]);
      return;
    }

    // Handle canvas hyper-rotation
    if (isRotating4D) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setLastMousePos({ x: e.clientX, y: e.clientY });

      const speedDelta = (dx + dy) * 0.0003;
      globalCanvas4DEngine.setRotationSpeed(selectedHyperPlane, hyperSpeed + speedDelta);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsRotating4D(false);
    setDraggedModalId(null);
  };

  // Modal Drag Starter
  const startModalDrag = (e: React.MouseEvent, modal: AutopoieticUIModal) => {
    e.stopPropagation();
    setDraggedModalId(modal.id);
    setDragOffset({
      x: e.clientX - modal.x,
      y: e.clientY - modal.y
    });
  };

  const handleSliderChange = (modalId: string, valFloat: number) => {
    const valQ16 = Math.floor(valFloat * 65536);
    globalCanvas4DEngine.updateModalSlider(modalId, valQ16);
    setModals([...globalCanvas4DEngine.getModals()]);
  };

  const handleSpawnOrganelle = (org: OrganelleNode) => {
    globalCanvas4DEngine.spawnOrganelleModal(org);
    setModals([...globalCanvas4DEngine.getModals()]);
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      className="relative w-full h-full bg-[#020208] select-none overflow-hidden font-mono text-[10px]"
    >
      {/* Background Framebuffer WebGL/2D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-crosshair z-0" />

      {/* Top Floating Control HUD */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto z-20 gap-2 flex-wrap">
        <div className="bg-[#030712E6] border border-cyan-500/40 rounded px-3 py-1.5 flex items-center gap-3 backdrop-blur-xs shadow-lg">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold uppercase text-[10px]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>4D Autopoietic Canvas (SO(4) → 2D+t)</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-[9px] text-emerald-400">d_I = 0 (LOCKED)</span>
          <span className="text-slate-600">|</span>
          <span className="text-[9px] text-amber-300">
            Friction: 0x{thermoFeeling.toString(16).padStart(4, '0')}
          </span>
        </div>

        {/* Hyper-Plane Controller & Audio Trigger */}
        <div className="flex items-center gap-2">
          {/* Active Hyperplane Rotation Selector */}
          <div className="bg-[#030712E6] border border-slate-800 rounded px-2 py-1 flex items-center gap-1.5 backdrop-blur-xs">
            <span className="text-slate-400 text-[9px]">SO(4) Plane:</span>
            {(['xw', 'yw', 'zw', 'xy', 'xz', 'yz'] as (keyof SO4Angles)[]).map(plane => (
              <button
                key={plane}
                onClick={() => {
                  setSelectedHyperPlane(plane);
                  globalCanvas4DEngine.setRotationSpeed(plane, hyperSpeed);
                }}
                className={`px-1.5 py-0.5 rounded text-[8.5px] cursor-pointer transition-all ${
                  selectedHyperPlane === plane 
                    ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-500/50 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {plane.toUpperCase()}
              </button>
            ))}
          </div>

          {/* 432Hz Direct PCM Audio Toggle */}
          <button
            onClick={() => {
              globalCanvas4DEngine.toggleAudio();
              setAudioState(globalCanvas4DEngine.getAudioState());
            }}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-all shadow-sm ${
              audioState.isAudioRunning
                ? 'bg-purple-950/80 hover:bg-purple-900 border-purple-500 text-purple-300 font-bold'
                : 'bg-black/60 hover:bg-black/90 border-slate-700 text-slate-400'
            }`}
          >
            {audioState.isAudioRunning ? <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>432Hz DMA {audioState.isAudioRunning ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Floating Interactive Autopoietic UI Modals directly rendered over memory surface */}
      {modals.filter(m => m.isActive).map(modal => {
        const sliderFloat = modal.sliderValueQ16 / 65536;

        return (
          <div
            key={modal.id}
            style={{
              left: `${modal.x}px`,
              top: `${modal.y}px`,
              width: `${modal.width}px`,
              backgroundColor: modal.bgColor,
              borderColor: modal.borderColor
            }}
            className="covalent-modal absolute border rounded shadow-2xl backdrop-blur-md pointer-events-auto z-10 flex flex-col select-none overflow-hidden transition-shadow hover:ring-1 hover:ring-cyan-500/30"
          >
            {/* Modal Title Bar / Drag Handle */}
            <div 
              onMouseDown={(e) => startModalDrag(e, modal)}
              className="bg-black/60 border-b border-slate-800/80 px-2.5 py-1.5 flex items-center justify-between cursor-move"
            >
              <div className="flex items-center gap-1.5 text-slate-200 font-bold text-[9px] truncate">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: modal.borderColor }}></span>
                <span>{modal.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    globalCanvas4DEngine.toggleModalPin(modal.id);
                    setModals([...globalCanvas4DEngine.getModals()]);
                  }}
                  className={`p-0.5 rounded text-[8px] cursor-pointer ${modal.isPinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title={modal.isPinned ? 'Unpin Modal' : 'Pin Modal'}
                >
                  <Pin className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => {
                    globalCanvas4DEngine.closeModal(modal.id);
                    setModals([...globalCanvas4DEngine.getModals()]);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Modal Body & Dynamic Controls */}
            <div className="p-2.5 space-y-2 flex-1 text-[9px]">
              {/* Category-Specific Visuals */}
              {modal.category === 'LISSAJOUS' && (
                <div className="bg-black/70 rounded p-2 border border-cyan-900/40 flex flex-col gap-1.5">
                  <div className="flex justify-between text-cyan-300 text-[8.5px]">
                    <span>Dyad Invariant: <strong>d_I = 0</strong></span>
                    <span>Q16 Ratio: <strong>1.500</strong></span>
                  </div>
                  <div className="h-10 flex items-center justify-center text-cyan-400/80 text-[8px]">
                    <span>[ SIMD Vector: vfmadd231ps %ymm0, %ymm1, %ymm2 ]</span>
                  </div>
                </div>
              )}

              {modal.category === 'SPECTRUM_432' && (
                <div className="bg-black/70 rounded p-2 border border-purple-900/40 flex flex-col gap-1.5">
                  <div className="flex justify-between text-purple-300 text-[8.5px]">
                    <span>Carrier: <strong>{audioState.baseFreq} Hz</strong></span>
                    <span>Phase Lock: <strong>{audioState.phaseShiftLocked ? 'LOCKED' : 'FREE'}</strong></span>
                  </div>
                  {/* Real-time PCM Waveform visualizer */}
                  <div className="h-10 flex items-center justify-between gap-0.5 px-1 bg-[#010103] rounded border border-slate-900">
                    {audioState.pcmWaveform.map((sample, idx) => {
                      const barH = Math.max(2, Math.abs(sample) * 36);
                      return (
                        <div
                          key={idx}
                          style={{ height: `${barH}px` }}
                          className="w-1 bg-purple-400/80 rounded-xs"
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {modal.category === 'ORGANELLE' && (
                <div className="bg-black/70 rounded p-2 border border-emerald-900/40 flex flex-col gap-1">
                  <div className="text-emerald-300 font-bold text-[8.5px]">
                    {modal.customData?.cSourcePath || '/src/organelle/*.c'}
                  </div>
                  <div className="text-slate-400 text-[8px] truncate">
                    ASM: <code className="text-yellow-300">{modal.customData?.asmRoutine || 'call covalent_exec; ret'}</code>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[8px] pt-1">
                    <span>Stall: <strong className="text-amber-300">{modal.customData?.stallCost || 24}t</strong></span>
                    <span>State: <strong className="text-emerald-400">10b (TRUE)</strong></span>
                  </div>
                </div>
              )}

              {/* Inline Parameter Slider (Q16.16 Dragging) */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-slate-400 text-[8px]">
                  <span>{modal.sliderLabel}:</span>
                  <span className="text-white font-mono">0x{modal.sliderValueQ16.toString(16).padStart(8, '0')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sliderFloat}
                  onChange={(e) => handleSliderChange(modal.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom Floating Organelle Quick-Spawn Ribbon */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto z-20 gap-2 flex-wrap">
        <div className="bg-[#030712E6] border border-slate-800 rounded px-2.5 py-1.5 flex items-center gap-2 backdrop-blur-xs shadow-lg overflow-x-auto max-w-[80vw] no-scrollbar">
          <span className="text-slate-400 text-[9px] flex items-center gap-1 shrink-0 font-bold">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>SPAWN ORGANELLE MODAL:</span>
          </span>

          {activeOrganelles.map(org => (
            <button
              key={org.id}
              onClick={() => handleSpawnOrganelle(org)}
              className="px-2 py-0.5 rounded bg-black/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 text-[8.5px] cursor-pointer transition-all shrink-0 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{org.name.replace('organelle_', '')}</span>
            </button>
          ))}
        </div>

        <div className="bg-[#030712E6] border border-slate-800 rounded px-2.5 py-1.5 flex items-center gap-2 backdrop-blur-xs text-[8.5px] text-slate-400 shadow-lg">
          <span>Projection: <strong className="text-cyan-300">Q16.16 Dual-Collapse</strong></span>
          <span className="text-slate-600">|</span>
          <span>VRAM: <strong className="text-emerald-400">1920x1080 Native</strong></span>
        </div>
      </div>
    </div>
  );
};

