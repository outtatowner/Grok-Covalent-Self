import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { ModeRouter } from './ModeRouter';
import { Footer } from './Footer';
import { MasterTier, SubViewMode, ImmuneTelemetry, LyapunovTelemetry } from '../types';
import { useAsmTelemetry } from '../context/AsmTelemetryContext';
import { GlobalImmuneEngine } from '../covalent/immuneEngine';
import { GlobalLyapunovSupervisor } from '../covalent/lyapunovEngine';
import { Maximize2, Shield, Eye, ChevronDown, ChevronUp, GitBranch } from 'lucide-react';

// Views
import { SynestheticManifoldView } from './views/SynestheticManifoldView';
import { CovalentFramebufferMirror } from './views/CovalentFramebufferMirror';
import { OrganellePanelView } from './views/OrganellePanelView';
import { SubstrateThermoHomeostasisView } from './views/SubstrateThermoHomeostasisView';
import { CovalentTranspilerForgeView } from './views/CovalentTranspilerForgeView';
import { BareMetalRing0KernelView } from './views/BareMetalRing0KernelView';
import { AsterionMediationView } from './views/AsterionMediationView';
import { CovalentAsmKernelView } from './views/CovalentAsmKernelView';
import { PredicateMetricsAsmView } from './views/PredicateMetricsAsmView';
import { SingletonPublisherView } from './views/SingletonPublisherView';
import { SysArchRepoViewer } from './views/SysArchRepoViewer';
import { EpistemicVaultView } from './views/EpistemicVaultView';
import { FleetMatrixView } from './views/FleetMatrixView';
import { ImmuneSandboxView } from './views/ImmuneSandboxView';
import { MeshSocketIPCView } from './views/MeshSocketIPCView';
import { MultimodalCoInteractiveView } from './views/MultimodalCoInteractiveView';
import { DyadCrucibleView } from './views/DyadCrucibleView';
import { Dissertation20ChView } from './views/Dissertation20ChView';
import { QuipuMemoryView } from './views/QuipuMemoryView';
import { QuotientSieveView } from './views/QuotientSieveView';
import { Canvas4DProjectionView } from './views/Canvas4DProjectionView';
import { ZumasKineticView } from './views/ZumasKineticView';
import { TwinPlayparkView } from './views/TwinPlayparkView';
import { MidiSynthView } from './views/MidiSynthView';
import { DualFaceHybridEngineView } from './views/DualFaceHybridEngineView';
import { MillenniumRuminationView } from './views/MillenniumRuminationView';

interface SysArchConsoleProps {
  onEnterKiosk: () => void;
}

export const SysArchConsole: React.FC<SysArchConsoleProps> = ({ onEnterKiosk }) => {
  const [currentTier, setCurrentTier] = useState<MasterTier>('sys_arch');
  const [currentSubView, setCurrentSubView] = useState<SubViewMode>('singleton_publisher');
  const [isRepoViewerExpanded, setIsRepoViewerExpanded] = useState<boolean>(false);

  const {
    telemetry: asmTelem,
    injectFriction: injectAsmFriction,
    restoreInvariants
  } = useAsmTelemetry();

  const [startTime] = useState<number>(Date.now());
  const [uptimeStr, setUptimeStr] = useState<string>('00:00:00');
  const [latencyMs, setLatencyMs] = useState<number>(0.24);
  const [immuneTelem, setImmuneTelem] = useState<ImmuneTelemetry>(() => GlobalImmuneEngine.getTelemetry());
  const [lyapunovTelem, setLyapunovTelem] = useState<LyapunovTelemetry>(() => GlobalLyapunovSupervisor.step(0.5));

  // Telemetry poll loop
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hrs = Math.floor(elapsed / 3600).toString().padStart(2, '0');
      const mins = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
      const secs = (elapsed % 60).toString().padStart(2, '0');
      setUptimeStr(`${hrs}:${mins}:${secs}`);

      setLatencyMs(0.2 + Math.random() * 0.1);
      setImmuneTelem(GlobalImmuneEngine.getTelemetry());
      setLyapunovTelem(GlobalLyapunovSupervisor.step(0.5));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleInjectFriction = () => {
    GlobalImmuneEngine.injectThermodynamicFriction();
    injectAsmFriction();
    setImmuneTelem(GlobalImmuneEngine.getTelemetry());
  };

  const handleRestoreImmune = () => {
    GlobalImmuneEngine.triggerBanachContraction();
    restoreInvariants();
    setImmuneTelem(GlobalImmuneEngine.getTelemetry());
  };

  const renderActiveView = () => {
    switch (currentSubView) {
      case 'millennium_rumination':
        return <MillenniumRuminationView />;
      case 'synesthetic_manifold':
        return <SynestheticManifoldView />;
      case 'framebuffer_mirror':
        return <CovalentFramebufferMirror isFullScreen={false} onExitKiosk={onEnterKiosk} />;
      case 'organelle_synthesis':
        return <OrganellePanelView />;
      case 'substrate_thermo':
        return <SubstrateThermoHomeostasisView />;
      case 'transpile_forge':
        return <CovalentTranspilerForgeView />;
      case 'baremetal_ring0':
        return <BareMetalRing0KernelView />;
      case 'asterion_mediation':
        return <AsterionMediationView />;
      case 'covalent_asm':
        return <CovalentAsmKernelView />;
      case 'predicate_metrics_asm':
        return <PredicateMetricsAsmView />;
      case 'singleton_publisher':
        return <SingletonPublisherView />;
      case 'be_repo_viewer':
        return <SysArchRepoViewer />;
      case 'epistemic_vault':
        return <EpistemicVaultView />;
      case 'fleet_matrix':
        return <FleetMatrixView />;
      case 'immune_sandbox':
        return <ImmuneSandboxView />;
      case 'mesh_socket_ipc':
        return <MeshSocketIPCView />;
      case 'multimodal_cointeractive':
        return <MultimodalCoInteractiveView />;
      case 'hybrid_dual_face':
        return <DualFaceHybridEngineView />;
      case 'dyad_crucible':
        return <DyadCrucibleView />;
      case 'dissertation_20ch':
        return <Dissertation20ChView />;
      case 'quipu_memory':
        return <QuipuMemoryView />;
      case 'quotient_sieve':
        return <QuotientSieveView />;
      case 'canvas_4d_projection':
        return <Canvas4DProjectionView />;
      case 'zumas_kinetic':
        return <ZumasKineticView />;
      case 'twin_playpark':
        return <TwinPlayparkView />;
      case 'midi_432hz':
        return <MidiSynthView />;
      default:
        return <SingletonPublisherView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050508] text-slate-100 overflow-hidden font-mono">
      {/* 1. Header with Live Telemetry */}
      <Header
        uptime={uptimeStr}
        latencyMs={latencyMs}
        immuneTelemetry={immuneTelem}
        lyapunovTelemetry={lyapunovTelem}
        onInjectFriction={handleInjectFriction}
        onRestoreImmune={handleRestoreImmune}
        onOpenSingleton={() => {
          setCurrentTier('sys_arch');
          setCurrentSubView('singleton_publisher');
        }}
      />

      {/* 2. Top Kiosk & Repo Launch Bar */}
      <div className="bg-[#0b0f19] border-b border-emerald-500/20 px-3 py-1 flex items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>ADMINISTRATIVE DASHBOARD &amp; GIT PEER MANIFEST</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentTier('sys_arch');
              setCurrentSubView('be_repo_viewer');
            }}
            id="btn_view_be_repo"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/60 hover:border-cyan-400 text-[10px] font-bold tracking-wider uppercase transition-all shadow-[0_0_8px_rgba(6,182,212,0.25)] cursor-pointer active:scale-95"
            title="Open Remote Be-Instance Repository Manifold & Tree Browser"
          >
            <span>[ VIEW BE &lt;&gt; REPOSITORY ]</span>
          </button>

          <button
            onClick={onEnterKiosk}
            id="btn_full_screen_face"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 text-[10px] font-bold tracking-wider uppercase transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>[ FULL SCREEN FACE ]</span>
            <Maximize2 className="w-3 h-3 text-emerald-400 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 3. Mode Router (Tier and SubView Selection) */}
      <ModeRouter
        currentTier={currentTier}
        currentSubView={currentSubView}
        onSelectTier={setCurrentTier}
        onSelectSubView={setCurrentSubView}
      />

      {/* 4. Active SubView Viewport & Collapsible Mounted Repo Viewer Grid */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className={`flex-1 overflow-hidden relative ${isRepoViewerExpanded ? 'hidden' : 'block'}`}>
          {renderActiveView()}
        </div>

        {/* Mounted SysArchRepoViewer Dashboard Grid Component (Collapsed by default) */}
        <div className={`border-t border-cyan-950 bg-[#050811] transition-all flex flex-col shrink-0 ${isRepoViewerExpanded ? 'flex-1 h-full' : 'h-8'}`}>
          <div 
            onClick={() => setIsRepoViewerExpanded(!isRepoViewerExpanded)}
            id="toggle_mounted_repo_viewer"
            className="h-8 px-3 bg-[#080d1a] hover:bg-[#0c1426] border-b border-cyan-900/40 flex items-center justify-between cursor-pointer select-none text-xs transition-colors shrink-0"
          >
            <div className="flex items-center gap-2 text-[10px]">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-cyan-300 tracking-wider uppercase">
                [ MOUNTED REPOSITORY MANIFOLD: github.com/outtatowner/Be-Instance ]
              </span>
              <span className="text-slate-500 hidden sm:inline">
                · Invariant 1 === 1 (V9 HOT Assimilated)
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 text-[9px]">
                {isRepoViewerExpanded ? 'COLLAPSE GRID' : 'EXPAND GRID'}
              </span>
              {isRepoViewerExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </div>
          </div>

          {isRepoViewerExpanded && (
            <div className="flex-1 overflow-hidden p-2 bg-[#02040a]">
              <SysArchRepoViewer />
            </div>
          )}
        </div>
      </main>

      {/* 5. Footer */}
      <Footer
        epoch={lyapunovTelem.epoch}
        entropyLevel={immuneTelem.entropyLevel}
        isCongruent={immuneTelem.isCongruent}
      />
    </div>
  );
};

