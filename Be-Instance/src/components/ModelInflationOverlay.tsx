import React from 'react';

export interface InflationProgress {
  chamber: 'CHAMBER_1_EXECUTIVE' | 'CHAMBER_2_ANALYTICAL';
  modelName: string;
  progress: number; // 0.0 to 1.0
  text: string;
  bytesFetched: number;
  totalBytes: number;
}

export const ModelInflationOverlay: React.FC<{
  isLoading: boolean;
  progressData: InflationProgress | null;
}> = ({ isLoading, progressData }) => {
  if (!isLoading || !progressData) return null;

  const pct = Math.round(progressData.progress * 100);
  const fetchedMB = (progressData.bytesFetched / (1024 * 1024)).toFixed(1);
  const totalMB = (progressData.totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center font-mono text-cyan-400 p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/50 rounded-xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center text-xs text-cyan-500 border-b border-slate-800 pb-2">
          <span className="animate-pulse">SYSTEM_INFLATION // WEBGPU_VRAM_STAGING</span>
          <span>d_I = 0.000</span>
        </div>

        {/* Active Chamber Substrate */}
        <div>
          <div className="text-sm font-bold text-slate-200">
            {progressData.chamber === 'CHAMBER_1_EXECUTIVE' ? 'Chamber 1: Executive Brainstem' : 'Chamber 2: Analytical Architect'}
          </div>
          <div className="text-xs text-slate-400 mt-1">{progressData.modelName}</div>
        </div>

        {/* Inflation Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 border border-slate-800 h-4 rounded overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded transition-all duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{progressData.text}</span>
            <span className="text-emerald-400">{pct}%</span>
          </div>
        </div>

        {/* Real-time Memory Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded border border-slate-800/80">
          <div>
            <span className="text-slate-500">TRANSFER:</span> {fetchedMB} MB / {totalMB} MB
          </div>
          <div>
            <span className="text-slate-500">TARGET VRAM:</span> RTX / WebGPU
          </div>
        </div>
      </div>
    </div>
  );
};

