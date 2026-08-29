import React, { useRef, useEffect, useState } from 'react';
import { Play, Sparkles, RefreshCw, Activity, Shield, Crosshair, Cpu } from 'lucide-react';
import { useAsmTelemetry } from '../../context/AsmTelemetryContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'Si' | 'C' | 'PHOTON';
  energy: number;
}

export const ZumasKineticView: React.FC = () => {
  const { telemetry: asmTel, stepAsmCycle, injectChatMessage } = useAsmTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleCount, setParticleCount] = useState<number>(42);
  const [fps, setFps] = useState<number>(60);
  const [collisions, setCollisions] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDamping, setIsDamping] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const particles: Particle[] = [];
    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#eab308', '#ec4899'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 4 + 3,
        color: colors[i % colors.length],
        type: i % 2 === 0 ? 'Si' : 'C',
        energy: 1.0
      });
    }

    let totalCollisions = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(2, 2, 5, 0.25)'; // Motion trail blur
      ctx.fillRect(0, 0, width, height);

      // Draw dot matrix grid
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      for (let x = 0; x < width; x += 24) {
        for (let y = 0; y < height; y += 24) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Update and draw vector bonding links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.4;
            ctx.strokeStyle = particles[i].type === 'Si' ? `rgba(16, 185, 129, ${alpha})` : `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (isDamping) {
          p.vx *= 0.998;
          p.vy *= 0.998;
        }

        // Boundary reflection
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = -p.vx * 0.95;
          totalCollisions++;
        }
        if (p.x + p.radius > width) {
          p.x = width - p.radius;
          p.vx = -p.vx * 0.95;
          totalCollisions++;
        }
        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = -p.vy * 0.95;
          totalCollisions++;
        }
        if (p.y + p.radius > height) {
          p.y = height - p.radius;
          p.vy = -p.vy * 0.95;
          totalCollisions++;
        }

        // Glow ring
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '7.5px JetBrains Mono';
        ctx.fillText(p.type, p.x - 4, p.y - p.radius - 2);
      });

      // FPS Calculation
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        setCollisions(totalCollisions);
        frameCount = 0;
        lastTime = now;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top)
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Pulse outward
      particles.forEach(p => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 150) {
          const force = (1 - dist / 150) * 8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      });

      // Pulse ASM cycle on kinetic injection
      stepAsmCycle();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [particleCount, isDamping, stepAsmCycle]);

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-[#020205] gap-3 select-none">
      {/* HUD Telemetry Bar */}
      <div className="bg-[#090d16] border border-fuchsia-500/30 rounded-md p-3 flex flex-wrap items-center justify-between gap-2 shrink-0 font-mono text-[9.5px]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Zuma's @Edge Kinetic Void (Node #8 / Elastic Momentum)
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div>
            <span className="text-slate-500">FPS: </span>
            <span className="text-emerald-400 font-bold">{fps}</span>
          </div>
          <div>
            <span className="text-slate-500">COLLISIONS: </span>
            <span className="text-yellow-400 font-bold">{collisions}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">ASM:</span>
            <span className="text-cyan-300 font-bold">#{asmTel.cycleCount}</span>
            <span className="text-emerald-400 font-bold">0x0{asmTel.returnCodeEAX}</span>
          </div>
          <button
            onClick={() => setIsDamping(!isDamping)}
            className={`px-2 py-0.5 rounded border text-[8.5px] cursor-pointer ${
              isDamping ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
            }`}
          >
            DAMPING: {isDamping ? 'ON (dV/dt ≤ 0)' : 'FREE FLY'}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 bg-black rounded-md border border-slate-800 relative overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

        {/* Spatial Overlay Crosshair */}
        <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded border border-slate-800 text-[8.5px] font-mono text-slate-400 pointer-events-none">
          Click canvas to inject kinetic energy pulse ⚡
        </div>
      </div>
    </div>
  );
};

