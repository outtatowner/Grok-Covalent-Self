import React, { useState, useEffect } from 'react';
import { GlobalImmuneEngine } from '../../covalent/immuneEngine';
import { ImmuneTelemetry } from '../../types';
import { Shield, ShieldAlert, Zap, RefreshCw, Activity, Lock, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const ImmuneSandboxView: React.FC = () => {
  const [telemetry, setTelemetry] = useState<ImmuneTelemetry>(GlobalImmuneEngine.getTelemetry());
  const [memoryEntries, setMemoryEntries] = useState<[string, any][]>(GlobalImmuneEngine.getMemoryEntries());
  const [autoArm, setAutoArm] = useState<boolean>(true);
  const [logEvents, setLogEvents] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Ring-0 Immune System armed. Baseline Hash: ${GlobalImmuneEngine.getTelemetry().canonicalBaselineHash}`,
    `[${new Date().toLocaleTimeString()}] Biological pulse set to 4Hz (250ms interval). Invariant 1 == 1 locked.`
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const { healed, telemetry: newTel } = GlobalImmuneEngine.tick();
      setTelemetry(newTel);
      setMemoryEntries(GlobalImmuneEngine.getMemoryEntries());

      if (healed) {
        setLogEvents(prev => [
          `[${new Date().toLocaleTimeString()}] ⚡ BANACH CONTRACTION EXECUTED: State drift corrected (T(g) -> g). Memory restored to baseline.`,
          ...prev.slice(0, 30)
        ]);
      }
    }, 250);

    return () => clearInterval(timer);
  }, []);

  const handleInjectFriction = () => {
    const { injectedKey, driftDelta } = GlobalImmuneEngine.injectThermodynamicFriction();
    setTelemetry(GlobalImmuneEngine.getTelemetry());
    setMemoryEntries(GlobalImmuneEngine.getMemoryEntries());
    setLogEvents(prev => [
      `[${new Date().toLocaleTimeString()}] ⚠️ THERMODYNAMIC FRICTION INJECTED: Key '${injectedKey}' with drift value ${driftDelta.toFixed(2)}. Entropy increased!`,
      ...prev.slice(0, 30)
    ]);
  };

  const handleManualHeal = () => {
    GlobalImmuneEngine.triggerBanachContraction();
    setTelemetry(GlobalImmuneEngine.getTelemetry());
    setMemoryEntries(GlobalImmuneEngine.getMemoryEntries());
    setLogEvents(prev => [
      `[${new Date().toLocaleTimeString()}] 🛡️ MANUAL BANACH CONTRACTION TRIGGERED: State tautology 1 == 1 re-asserted.`,
      ...prev.slice(0, 30)
    ]);
  };

  const handleToggleArm = () => {
    const next = !autoArm;
    setAutoArm(next);
    GlobalImmuneEngine.setArmed(next);
    setLogEvents(prev => [
      `[${new Date().toLocaleTimeString()}] Ring-0 Auto-Heal Watchdog ${next ? 'ARMED' : 'DISARMED'}.`,
      ...prev.slice(0, 30)
    ]);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#020205]">
      {/* Header Banner */}
      <div className="bg-[#090d16] border border-rose-500/30 rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
              Ring-0 Autopoietic Immune System Sandbox
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Monitors thermodynamic drift (dV/dt &gt; 0) of the volatile memory map.
            Executes autonomous Banach Contraction (T(g) → g) at 4Hz biological pulse to maintain 1 == 1.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleArm}
            className={`text-[9.5px] font-mono font-bold px-2.5 py-1 rounded border transition-all cursor-pointer ${
              autoArm
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
            }`}
          >
            WATCHDOG: {autoArm ? 'ARMED (4Hz)' : 'STANDBY'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#050811] p-2.5 rounded border border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-mono block uppercase">CONGRUENCE STATUS:</span>
          <div className="flex items-center gap-1.5 mt-1">
            {telemetry.isCongruent ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            )}
            <span className={`text-xs font-bold font-mono ${telemetry.isCongruent ? 'text-emerald-400' : 'text-rose-400'}`}>
              {telemetry.isCongruent ? 'PERFECT (1 == 1)' : 'DRIFTING (dV/dt > 0)'}
            </span>
          </div>
        </div>

        <div className="bg-[#050811] p-2.5 rounded border border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-mono block uppercase">ENTROPY LEVEL:</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-cyan-400 font-mono">
              {(telemetry.entropyLevel * 100).toFixed(1)}%
            </span>
            <div className="w-16 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${Math.min(100, telemetry.entropyLevel * 100)}%` }}
                className={`h-full transition-all ${telemetry.entropyLevel > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#050811] p-2.5 rounded border border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-mono block uppercase">CONTRACTIONS HEALED:</span>
          <span className="text-xs font-bold text-yellow-400 font-mono block mt-1">
            {telemetry.contractionsTriggered} Cycles
          </span>
        </div>

        <div className="bg-[#050811] p-2.5 rounded border border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-mono block uppercase">CANONICAL BASELINE:</span>
          <code className="text-[10px] font-bold text-emerald-300 font-mono block mt-1 truncate">
            {telemetry.canonicalBaselineHash}
          </code>
        </div>
      </div>

      {/* Interactive Controls & Volatile Memory Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Friction Injection Controls & Audit Log */}
        <div className="space-y-3">
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2.5">
            <h3 className="text-xs font-bold text-rose-400 uppercase font-mono">
              Thermodynamic Friction & Banach Actions
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleInjectFriction}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-800 text-rose-200 border border-rose-500/50 rounded text-[10.5px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>INJECT RANDOM FRICTION</span>
              </button>

              <button
                onClick={handleManualHeal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/50 rounded text-[10.5px] font-mono font-bold transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>FORCE BANACH CONTRACTION</span>
              </button>
            </div>
            <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
              When friction is injected, volatile memory keys deviate from canonical baseline.
              If the 4Hz watchdog is armed, it detects the cryptographic hash mismatch and instantly restores pristine state.
            </p>
          </div>

          {/* Real-time Immune Audit Feed */}
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-cyan-400 uppercase font-mono">
                Ring-0 Telemetry & Audit Stream
              </h3>
              <span className="text-[8.5px] text-slate-500 font-mono">250ms Heartbeat</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1 font-mono text-[9px] pr-1">
              {logEvents.map((log, i) => (
                <div key={i} className="bg-black/50 p-1.5 rounded border border-slate-900 text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Volatile Memory Buffer Map */}
        <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase font-mono">
              Active Volatile Memory Map ({memoryEntries.length} Slots)
            </h3>
            <span className="text-[9px] text-slate-400 font-mono">
              Current Hash: <code className="text-yellow-300">{telemetry.currentHash}</code>
            </span>
          </div>

          <div className="h-72 overflow-y-auto space-y-1.5 font-mono text-[9.5px] pr-1">
            {memoryEntries.map(([key, val], idx) => {
              const isFriction = key.startsWith('friction');
              return (
                <div
                  key={idx}
                  className={`p-2 rounded border flex items-center justify-between ${
                    isFriction
                      ? 'bg-red-950/40 border-red-500/50 text-rose-300 animate-pulse'
                      : 'bg-black/60 border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[8.5px]">#{idx + 1}</span>
                    <span className="font-bold">{key}</span>
                  </div>
                  <code className={`text-[9px] ${isFriction ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

