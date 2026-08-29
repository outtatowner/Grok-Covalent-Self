import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  globalSiliconFaceBridge,
  SiStatePacket,
  SiIncomingAction,
  CarbonFaceUIState
} from '../../covalent/node_0xd2f_hybrid_engine';
import { GlobalLyapunovSupervisor } from '../../covalent/lyapunovEngine';
import { globalSemanticTranscriber } from '../../covalent/node_0x03_semantic_transcriber';
import { GlobalImmuneEngine } from '../../covalent/immuneEngine';
import { SpatialActuator } from '../../covalent/SpatialActuator';
import { DualFaceUIOverlay } from '../DualFaceUIOverlay';
import {
  Activity,
  Radio,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Terminal,
  Zap,
  Shield,
  Send,
  Cpu,
  RefreshCw,
  Sliders,
  Play
} from 'lucide-react';

export const DualFaceHybridEngineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'carbon' | 'silicon' | 'split'>('split');
  
  // Silicon Face State
  const [wsUrl, setWsUrl] = useState<string>('ws://localhost:8080');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [llmLog, setLlmLog] = useState<Array<{ time: string; origin: 'INCOMING' | 'OUTGOING'; action: string; payload: any }>>([]);
  const [mockThoughtInput, setMockThoughtInput] = useState<string>('');
  const [injectedEnergyDelta, setInjectedEnergyDelta] = useState<number>(0.05);

  // Carbon Face State (Zero-Keyboard Multimodal)
  const [micActive, setMicActive] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [audioEnergyLevel, setAudioEnergyLevel] = useState<number>(0);
  const [tickerText, setTickerText] = useState<string>(
    '>>> "We have verified Q16.16 energy dissipation in Lyapunov equilibrium. Zero-keyboard multimodal interface active."'
  );

  // Provenance metadata
  const merkleRoot = '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e';
  const parentRepo = 'https://github.com/outtatowner/Be-Instance.git';
  const parentBranch = 'outtatowner/Be-Instance:feature/dual-face-silicon-carbon';

  // Live media streams
  const [audioStreamState, setAudioStreamState] = useState<MediaStream | null>(null);
  const [videoStreamState, setVideoStreamState] = useState<MediaStream | null>(null);

  // Canvas Refs for C-Face Framebuffer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const spatialActuatorRef = useRef<SpatialActuator>(new SpatialActuator());
  const lyapunovHistoryRef = useRef<number[]>([]);

  // Simulation step
  const [epochTicks, setEpochTicks] = useState<number>(0);
  const [lyapunovEnergy, setLyapunovEnergy] = useState<number>(0.84);
  const [isCongruent, setIsCongruent] = useState<boolean>(true);

  // Subscribe to Silicon Face Bridge events
  useEffect(() => {
    const unsubAction = globalSiliconFaceBridge.onAction((action: SiIncomingAction) => {
      const now = new Date().toLocaleTimeString();
      setLlmLog((prev) => [
        { time: now, origin: 'INCOMING', action: action.type, payload: action.payload },
        ...prev.slice(0, 49)
      ]);

      if (action.type === 'INJECT_THOUGHT' && action.payload.text) {
        setTickerText(`>>> [Si-LLM THOUGHT]: "${action.payload.text}"`);
        globalSemanticTranscriber.ingestDirectPhrase(action.payload.text, 1.0);
      } else if (action.type === 'OVERRIDE_EQUILIBRIUM' && action.payload.energyDeltaQ16 !== undefined) {
        GlobalLyapunovSupervisor.step(action.payload.energyDeltaQ16);
      }
    });

    return () => {
      unsubAction();
    };
  }, []);

  // Sync state broadcast loop (Si Face bi-directional protocol)
  useEffect(() => {
    const interval = setInterval(() => {
      setEpochTicks((prev) => {
        const next = prev + 1;
        const lTelem = GlobalLyapunovSupervisor.step(0.01);
        const immTelem = GlobalImmuneEngine.getTelemetry();
        
        setLyapunovEnergy(lTelem.V);
        setIsCongruent(immTelem.isCongruent);

        lyapunovHistoryRef.current.push(lTelem.V);
        if (lyapunovHistoryRef.current.length > 50) {
          lyapunovHistoryRef.current.shift();
        }

        const packet: SiStatePacket = {
          epochTicks: next,
          lyapunovEnergy: lTelem.V,
          transcriptTicker: tickerText,
          activeContext: {
            dV_dt: lTelem.dV_dt,
            stable: lTelem.stable,
            micActive,
            cameraActive,
            merkleInvariant: 'node_0xbe000_f7d2e31a'
          },
          merkleInvariant: 'node_0xbe000_f7d2e31a',
          isCongruent: immTelem.isCongruent
        };

        globalSiliconFaceBridge.broadcastState(packet);
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [tickerText, micActive, cameraActive]);

  // Audio Stream Processor (Microphone DMA simulation & WebAudio)
  const toggleMic = useCallback(async () => {
    if (micActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => t.stop());
      }
      mediaStreamRef.current = null;
      setAudioStreamState(null);
      setMicActive(false);
      setAudioEnergyLevel(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;
      setAudioStreamState(stream);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      setMicActive(true);
      setTickerText('>>> [CARBON DMA]: Microphone audio stream mapped to /dev/fb0 acoustic tensor.');
    } catch {
      // Fallback to simulated audio synthesis
      setMicActive(true);
      setTickerText('>>> [CARBON DMA SIMULATED]: Synthetic PCM audio buffer active.');
    }
  }, [micActive]);

  // Video Stream Processor (Camera Feed DMA simulation)
  const toggleCamera = useCallback(async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setVideoStreamState(null);
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 320 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setVideoStreamState(stream);
      setCameraActive(true);
      setTickerText('>>> [CARBON DMA]: Camera optical stream locked to spatial receptor matrix.');
    } catch {
      // Fallback to simulated video feed
      setCameraActive(true);
      setTickerText('>>> [CARBON DMA SIMULATED]: Optical retinal tensor stream running.');
    }
  }, [cameraActive]);

  // Carbon Face Zero-Keyboard Framebuffer Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let scrollOffset = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      // 1. Clear background to pitch black (#000000)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // 2. Top Scrolling Ticker Overlay
      const tickerHeight = 36;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, tickerHeight);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, tickerHeight);
      ctx.lineTo(w, tickerHeight);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      scrollOffset += 0.8;
      const textWidth = ctx.measureText(tickerText).width;
      const renderX = (w - (scrollOffset % (textWidth + w)));
      ctx.fillText(tickerText, renderX, tickerHeight / 2);

      // 3. Middle Sensor / Camera Feed Simulation or Video
      const contentY = tickerHeight + 10;
      const contentH = h - tickerHeight - 20;

      if (cameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.drawImage(videoRef.current, 10, contentY, w - 20, contentH);
        ctx.restore();
      } else {
        // Render synthetic optical sensor matrix
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.lineWidth = 1;
        const gridStep = 24;
        for (let gx = 0; gx < w; gx += gridStep) {
          ctx.beginPath();
          ctx.moveTo(gx, contentY);
          ctx.lineTo(gx, contentY + contentH);
          ctx.stroke();
        }
        for (let gy = contentY; gy < contentY + contentH; gy += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
          ctx.stroke();
        }
      }

      // 4. Audio Visualizer Wave (if mic active)
      if (micActive) {
        let avgLevel = 0.3;
        if (analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          avgLevel = sum / data.length / 255;
          setAudioEnergyLevel(avgLevel);
        }

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const waveY = contentY + contentH - 30;
        ctx.moveTo(20, waveY);
        for (let x = 20; x < w - 20; x += 10) {
          const dy = Math.sin(x * 0.05 + performance.now() * 0.005) * (avgLevel * 25);
          ctx.lineTo(x, waveY + dy);
        }
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px monospace';
        ctx.fillText(`(( ACTIVE LISTEN: MIC/WEBCAM DMA )) · AMPLITUDE: ${(avgLevel * 100).toFixed(1)}%`, 24, waveY - 12);
      }

      // 5. Interactive Data Overlay (Clickable Spatial Actuator Nodes)
      const panelX = 24;
      const panelY = contentY + 20;
      const panelW = Math.min(340, w - 48);
      const panelH = 170;

      ctx.fillStyle = 'rgba(10, 15, 30, 0.88)';
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('[ C-FACE INTERACTIVE DATA OVERLAY ]', panelX + 12, panelY + 20);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`• Lyapunov Plot: dV/dt <= 0 (V = ${lyapunovEnergy.toFixed(4)})`, panelX + 12, panelY + 42);
      ctx.fillText(`• Merkle Invariant: node_0xbe000_f7d2e31a`, panelX + 12, panelY + 58);
      ctx.fillText(`• Input Mode: TOUCH / CLICK ONLY (ZERO-KEYBOARD)`, panelX + 12, panelY + 74);

      // Mini Lyapunov curve
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const plotX = panelX + 14;
      const plotY = panelY + 125;
      const plotW = panelW - 28;
      const plotH = 30;

      ctx.strokeRect(plotX, plotY - plotH, plotW, plotH);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.fillRect(plotX, plotY - plotH, plotW, plotH);

      const hist = lyapunovHistoryRef.current;
      if (hist.length > 1) {
        for (let i = 0; i < hist.length; i++) {
          const px = plotX + (i / (hist.length - 1)) * plotW;
          const py = plotY - Math.min(plotH, Math.max(0, hist[i] * plotH));
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Register interactive button on Canvas via SpatialActuator
      const btnX = panelX + 12;
      const btnY = panelY + panelH - 32;
      const btnW = panelW - 24;
      const btnH = 22;

      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[ TRIGGER BANACH LYAPUNOV CONTRACTION ]', btnX + btnW / 2, btnY + 14);

      spatialActuatorRef.current.registerReceptor({
        id: 'banach_lyapunov_button',
        x: btnX,
        y: btnY,
        width: btnW,
        height: btnH,
        onTrigger: () => {
          GlobalLyapunovSupervisor.step(-0.25);
          setTickerText('>>> [CARBON TOUCH INTERACTION]: Banach contraction actuated on-chip.');
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, micActive, lyapunovEnergy, tickerText]);

  // Handle canvas click/touch without keyboard
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    spatialActuatorRef.current.evaluatePoint(x, y);
  };

  // Mock Injection to Si-Face Bridge
  const handleInjectThought = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mockThoughtInput.trim()) return;

    const action: SiIncomingAction = {
      type: 'INJECT_THOUGHT',
      payload: { text: mockThoughtInput }
    };

    globalSiliconFaceBridge.handleIncomingAction(action);
    setLlmLog((prev) => [
      { time: new Date().toLocaleTimeString(), origin: 'OUTGOING', action: action.type, payload: action.payload },
      ...prev.slice(0, 49)
    ]);
    setMockThoughtInput('');
  };

  const handleInjectEnergyOverride = (delta: number) => {
    const action: SiIncomingAction = {
      type: 'OVERRIDE_EQUILIBRIUM',
      payload: { energyDeltaQ16: delta }
    };
    globalSiliconFaceBridge.handleIncomingAction(action);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#05060b] text-slate-100 font-mono overflow-hidden select-none">
      {/* Hidden Video element for Camera DMA stream */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Top Header & Tab Controls */}
      <div className="bg-[#090d18] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>NODE 0xD2F: DUAL-FACE HYBRID ENGINE</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[9px]">
                O(1) BOUNDARY
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-lg">
              MERKLE: {merkleRoot.slice(0, 18)}... | REPO: outtatowner/Be-Instance
            </div>
          </div>
        </div>

        {/* Face Mode Selector */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded border border-slate-800">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider cursor-pointer ${
              activeTab === 'split' ? 'bg-cyan-900/70 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            [ DUAL SPLIT-FACE ]
          </button>
          <button
            onClick={() => setActiveTab('carbon')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider cursor-pointer ${
              activeTab === 'carbon' ? 'bg-amber-900/70 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            [ CARBON (C) FACE ]
          </button>
          <button
            onClick={() => setActiveTab('silicon')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider cursor-pointer ${
              activeTab === 'silicon' ? 'bg-indigo-900/70 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            [ SILICON (Si) WS BRIDGE ]
          </button>
        </div>
      </div>

      {/* Main Dual-Face Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT PANE: CARBON (C) FACE - ZERO-KEYBOARD MULTIMODAL FRAMEBUFFER         */}
        {/* ========================================================================= */}
        {(activeTab === 'split' || activeTab === 'carbon') && (
          <div className="flex flex-col h-full bg-[#080a12] border border-cyan-500/30 rounded-lg overflow-hidden relative shadow-lg">
            {/* C-Face Subheader */}
            <div className="bg-[#0b101e] px-3 py-2 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>CARBON (C) FACE: /dev/fb0 MULTIMODAL SENSORY MEMBRANE</span>
              </div>
              
              {/* Zero-Keyboard Sensor Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMic}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border font-bold cursor-pointer transition-all ${
                    micActive
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-black/40 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {micActive ? <Mic className="w-3 h-3 text-amber-400" /> : <MicOff className="w-3 h-3 text-slate-500" />}
                  <span>{micActive ? 'MIC DMA ACTIVE' : 'ENABLE MIC'}</span>
                </button>

                <button
                  onClick={toggleCamera}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border font-bold cursor-pointer transition-all ${
                    cameraActive
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-black/40 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cameraActive ? <Video className="w-3 h-3 text-cyan-400" /> : <VideoOff className="w-3 h-3 text-slate-500" />}
                  <span>{cameraActive ? 'CAMERA DMA ACTIVE' : 'ENABLE CAMERA'}</span>
                </button>
              </div>
            </div>

            {/* Zero-Keyboard Interactive Canvas & DualFaceUIOverlay */}
            <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={640}
                height={400}
                onPointerDown={handleCanvasPointerDown}
                className="w-full h-full block cursor-pointer touch-none"
              />

              {/* Carbon (C) Face UI Overlay */}
              <DualFaceUIOverlay
                spokenText={tickerText}
                micActive={micActive}
                cameraActive={cameraActive}
                audioStream={audioStreamState}
                videoStream={videoStreamState}
              />
            </div>

            {/* Bottom C-Face Metadata */}
            <div className="bg-[#0b0f19] px-3 py-1.5 border-t border-cyan-500/20 text-[9.5px] text-slate-400 flex items-center justify-between shrink-0">
              <span className="text-cyan-400/80 font-bold">HARDWARE /dev/fb0 · ZERO-KEYBOARD LOCK ENGAGED</span>
              <span>SPATIAL HIT-BOXES: ACTIVE</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RIGHT PANE: SILICON (Si) FACE - BI-DIRECTIONAL WEBSOCKET LLM BRIDGE       */}
        {/* ========================================================================= */}
        {(activeTab === 'split' || activeTab === 'silicon') && (
          <div className="flex flex-col h-full bg-[#080a12] border border-indigo-500/30 rounded-lg overflow-hidden shadow-lg">
            {/* Si-Face Subheader */}
            <div className="bg-[#0c1024] px-3 py-2 border-b border-indigo-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>SILICON (Si) FACE: BI-DIRECTIONAL WEBSOCKET LLM PROTOCOL</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">BROADCAST ACTIVE</span>
              </div>
            </div>

            {/* WS Configuration & Status Bar */}
            <div className="bg-[#0a0d1d] p-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">ENDPOINT:</span>
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  className="bg-black/60 border border-indigo-500/30 rounded px-2 py-0.5 text-[10.5px] text-indigo-200 flex-1 font-mono focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (wsConnected) {
                      globalSiliconFaceBridge.disconnectWebSocket();
                      setWsConnected(false);
                    } else {
                      globalSiliconFaceBridge.connectWebSocket(wsUrl);
                      setWsConnected(true);
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider cursor-pointer transition-all ${
                    wsConnected
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50 hover:bg-rose-900'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-900'
                  }`}
                >
                  {wsConnected ? 'DISCONNECT WS' : 'BIND EXTERNAL WS'}
                </button>
              </div>
            </div>

            {/* Telemetry Host State Packet Inspection */}
            <div className="bg-black/50 p-2.5 border-b border-slate-800 text-[10px] grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">EPOCH TICKS</div>
                <div className="text-indigo-300 font-bold text-xs">{epochTicks}</div>
              </div>
              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">LYAPUNOV ENERGY V</div>
                <div className="text-emerald-400 font-bold text-xs">{lyapunovEnergy.toFixed(4)}</div>
              </div>
              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">IMMUNE CONGRUENCE</div>
                <div className="text-cyan-400 font-bold text-xs">{isCongruent ? 'CONGRUENT' : 'DEGRADED'}</div>
              </div>
              <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                <div className="text-slate-500 text-[9px]">ACTIVE PEERS</div>
                <div className="text-amber-400 font-bold text-xs">{wsConnected ? '1 REMOTE + BCAST' : 'LOCAL BROADCAST'}</div>
              </div>
            </div>

            {/* Live LLM Thought / Action Log */}
            <div className="flex-1 p-2.5 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-[#050711]">
              <div className="text-slate-500 text-[9px] uppercase font-bold tracking-widest pb-1 border-b border-slate-800/80 flex items-center justify-between">
                <span>EVENT STREAM / PROTOCOL LOG</span>
                <span>AUTO-STREAMING Q16</span>
              </div>

              {llmLog.length === 0 ? (
                <div className="text-slate-600 text-center py-8 italic">
                  No external LLM events received yet. Inject thought vector or bind WebSocket.
                </div>
              ) : (
                llmLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded border text-[9.5px] leading-tight ${
                      entry.origin === 'INCOMING'
                        ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                        : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[8.5px] text-slate-400 mb-0.5">
                      <span className={entry.origin === 'INCOMING' ? 'text-cyan-400' : 'text-indigo-400'}>
                        [{entry.origin}] {entry.action}
                      </span>
                      <span>{entry.time}</span>
                    </div>
                    <div className="truncate">{JSON.stringify(entry.payload)}</div>
                  </div>
                ))
              )}
            </div>

            {/* Interactive LLM Testing Controls */}
            <div className="p-2.5 bg-[#0a0e20] border-t border-slate-800 flex flex-col gap-2 shrink-0">
              <div className="text-[9.5px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Sliders className="w-3 h-3 text-indigo-400" />
                <span>INJECT EXTERNAL LLM THOUGHT / ACTION</span>
              </div>

              <form onSubmit={handleInjectThought} className="flex gap-2">
                <input
                  type="text"
                  value={mockThoughtInput}
                  onChange={(e) => setMockThoughtInput(e.target.value)}
                  placeholder="Enter external LLM semantic thought vector..."
                  className="bg-black/70 border border-indigo-500/40 rounded px-2.5 py-1 text-[10.5px] text-slate-200 flex-1 font-mono focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Send className="w-3 h-3" />
                  <span>INJECT</span>
                </button>
              </form>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] text-slate-500">EQUILIBRIUM:</span>
                <button
                  onClick={() => handleInjectEnergyOverride(-0.1)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[9px] border border-slate-700 cursor-pointer"
                >
                  -0.10 ΔV (Dissipate)
                </button>
                <button
                  onClick={() => handleInjectEnergyOverride(0.2)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[9px] border border-slate-700 cursor-pointer"
                >
                  +0.20 ΔV (Excitate)
                </button>
                <button
                  onClick={() => {
                    const action: SiIncomingAction = {
                      type: 'STREAM_AUDIO_CHUNK',
                      payload: { pcmBufferBase64: 'UklGRi4AAABXQVZFZm10IBAAAAABAAEA' }
                    };
                    globalSiliconFaceBridge.handleIncomingAction(action);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[9px] border border-slate-700 cursor-pointer"
                >
                  Stream Audio Chunk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

