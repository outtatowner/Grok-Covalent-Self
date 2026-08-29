import React, { useEffect, useRef, useState, useMemo } from 'react';
import { globalThoughtStream, WordBoundaryEvent } from '../covalent/continuousThoughtStream';
import { globalREMOrganelle, CalcifiedLedger } from '../covalent/REM_Organelle';
import { globalBePerceptionEngine, ConversationState } from '../covalent/bePerceptionEngine';
import { globalDataUsefulnessFilter } from '../covalent/dataUsefulnessFilter';
import { globalSpeechAudioEngine, SpeechAudioMode } from '../covalent/speechAudioEngine';
import { globalMultimodalArtifactSubstrate } from '../covalent/multimodalArtifactSubstrate';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  Keyboard,
  Radio,
  Share2,
  ChevronDown,
  Moon,
  Shield,
  Activity,
  Layers,
  Database,
  MessageSquare,
  RefreshCw,
  Volume2,
  VolumeX,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface OverlayStats {
  morph: string;
  p2p: string;
  resonance: string;
  velocity: number;
  isNovelResonance: boolean;
  isPeerBonded: boolean;
  yearningActive: boolean;
}

interface OverlayProps {
  spokenText: string;
  micActive: boolean;
  cameraActive: boolean;
  audioStream?: MediaStream | null;
  videoStream?: MediaStream | null;
  isCommunicating: boolean;
  stats: OverlayStats;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleFocus: () => void;
  onOpenKeyboard: () => void;
  onEmitBeacon: () => void;
  onTogglePeerBond: () => void;
  onTriggerDream: () => void;
  onExitKiosk?: () => void;
}

export const DualFaceUIOverlay: React.FC<OverlayProps> = ({
  spokenText,
  micActive,
  cameraActive,
  audioStream,
  videoStream,
  isCommunicating,
  stats,
  onToggleMic,
  onToggleCamera,
  onToggleFocus,
  onOpenKeyboard,
  onEmitBeacon,
  onTogglePeerBond,
  onTriggerDream,
  onExitKiosk
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tickerContainerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});

  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [remState, setRemState] = useState<string>('IDLE');
  const [remTicks, setRemTicks] = useState<number>(0);
  const [calcifiedCount, setCalcifiedCount] = useState<number>(CalcifiedLedger.length);
  const [convState, setConvState] = useState<ConversationState>(globalBePerceptionEngine.getConversationState());
  const [isFilterEnabled, setIsFilterEnabled] = useState<boolean>(globalDataUsefulnessFilter.isFilterEnabled());
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(globalSpeechAudioEngine.isMutedState());
  const [audioMode, setAudioMode] = useState<SpeechAudioMode>(globalSpeechAudioEngine.getAudioMode());
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(globalSpeechAudioEngine.isAudioUnlocked());
  const [isArtifactOverlayVisible, setIsArtifactOverlayVisible] = useState<boolean>(globalMultimodalArtifactSubstrate.isArtifactOverlayVisible());
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to MultimodalArtifactSubstrate
  useEffect(() => {
    const unsubArtifacts = globalMultimodalArtifactSubstrate.subscribe(() => {
      setIsArtifactOverlayVisible(globalMultimodalArtifactSubstrate.isArtifactOverlayVisible());
    });
    return () => unsubArtifacts();
  }, []);

  // Subscribe to DataUsefulnessFilter toggle updates
  useEffect(() => {
    const unsubFilter = globalDataUsefulnessFilter.onFilterChange((enabled) => {
      setIsFilterEnabled(enabled);
    });
    return () => unsubFilter();
  }, []);

  // Subscribe to SpeechAudioEngine state updates
  useEffect(() => {
    const unsubAudio = globalSpeechAudioEngine.subscribe(() => {
      setIsAudioMuted(globalSpeechAudioEngine.isMutedState());
      setAudioMode(globalSpeechAudioEngine.getAudioMode());
      setIsAudioUnlocked(globalSpeechAudioEngine.isAudioUnlocked());
    });
    return () => unsubAudio();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  // Subscribe to Interactive Conversational Mode state transitions
  useEffect(() => {
    const unsubConv = globalBePerceptionEngine.onConversationStateChange((state) => {
      setConvState(state);
    });
    return () => unsubConv();
  }, []);

  // Subscribe to REM Organelle state transitions
  useEffect(() => {
    const unsub = globalREMOrganelle.onStateChange((state, ticks, totalCalcified) => {
      setRemState(state);
      setRemTicks(ticks);
      setCalcifiedCount(totalCalcified);
    });
    return () => unsub();
  }, []);

  // Subscribe to Continuous Thought Stream & Word Boundary Enunciation
  useEffect(() => {
    const unsubState = globalThoughtStream.onStateChange((streaming, _current, queueLen) => {
      setIsStreamActive(streaming);
      setQueuedCount(queueLen);
    });

    const unsubWord = globalThoughtStream.onWordBoundary((event: WordBoundaryEvent) => {
      setActiveWordIndex(event.wordIndex);
    });

    const unsubEnd = globalThoughtStream.onThoughtEnd(() => {
      setActiveWordIndex(-1);
    });

    return () => {
      unsubState();
      unsubWord();
      unsubEnd();
    };
  }, []);

  // Parse words from spoken text
  const cleanSpokenText = useMemo(() => {
    if (!spokenText) return 'Attuned to Carbon presence...';
    return spokenText.replace(/^(BE|Be)\s*<>\s*:\s*/i, '').trim();
  }, [spokenText]);

  const words = useMemo(() => {
    return cleanSpokenText.split(/\s+/).filter(Boolean);
  }, [cleanSpokenText]);

  // Auto-scroll the active enunciated word into the horizontal center of the ticker
  useEffect(() => {
    if (activeWordIndex >= 0 && wordRefs.current[activeWordIndex] && tickerContainerRef.current) {
      const activeEl = wordRefs.current[activeWordIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeWordIndex]);

  // Attach camera media stream to thumbnail
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // Audio Waveform Visualization Loop
  useEffect(() => {
    if (!micActive || !audioStream || !canvasRef.current) return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(audioStream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let animationId: number;

    const drawWaveform = () => {
      animationId = requestAnimationFrame(drawWaveform);
      analyser.getByteTimeDomainData(dataArray);

      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#00ffcc';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    drawWaveform();

    return () => {
      cancelAnimationFrame(animationId);
      audioCtx.close();
    };
  }, [micActive, audioStream]);

  // Determine current active mode badge with Conversational Mode Priority
  const modeBadge = useMemo(() => {
    // 1. ACTIVE CONVERSATIONAL MODE WITH HUMAN (Highest Priority during dialogue)
    if (convState.isActive) {
      if (convState.turnState === 'LISTENING') {
        return {
          label: `CONVERSING [LISTENING · TURN #${convState.turnCount}]`,
          bg: 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
          dot: 'bg-emerald-400 animate-ping',
          icon: MessageSquare
        };
      }
      if (convState.turnState === 'REFLECTING') {
        return {
          label: `CONVERSING [REFLECTING · TURN #${convState.turnCount}]`,
          bg: 'bg-purple-950/90 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
          dot: 'bg-purple-400 animate-pulse',
          icon: Sparkles
        };
      }
      if (convState.turnState === 'SPEAKING') {
        return {
          label: `CONVERSING [SPEAKING · TURN #${convState.turnCount}]`,
          bg: 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.6)]',
          dot: 'bg-cyan-400 animate-pulse',
          icon: MessageSquare
        };
      }
      return {
        label: `CONVERSING [ATTUNED · TURN #${convState.turnCount}]`,
        bg: 'bg-teal-950/80 border-teal-400 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.4)]',
        dot: 'bg-teal-400',
        icon: MessageSquare
      };
    }

    // 2. REM ORGANELLE STATES
    if (remState === 'REM_DREAMING') {
      return {
        label: `REM DREAMING [4Hz · ${remTicks}/12]`,
        bg: 'bg-indigo-950/80 border-indigo-500/80 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]',
        dot: 'bg-indigo-400 animate-pulse',
        icon: Moon
      };
    }
    if (remState === 'REM_SEEDING') {
      return {
        label: 'REM SEEDING [LLM SYNAPSE]',
        bg: 'bg-purple-950/80 border-purple-500/80 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        dot: 'bg-purple-400 animate-ping',
        icon: Sparkles
      };
    }
    if (remState === 'REM_CALCIFIED') {
      return {
        label: `REM CALCIFIED [LEDGER: ${calcifiedCount}]`,
        bg: 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        dot: 'bg-amber-400',
        icon: Database
      };
    }

    // 3. PHYSICAL & RESONANCE MODES
    if (stats.isNovelResonance) {
      return {
        label: 'RESONANCE [528Hz COMFORT]',
        bg: 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
        dot: 'bg-emerald-400 animate-ping',
        icon: Activity
      };
    }
    if (stats.isPeerBonded) {
      return {
        label: 'COVALENT BONDED [P2P SYNC]',
        bg: 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]',
        dot: 'bg-rose-400 animate-pulse',
        icon: Share2
      };
    }
    if (stats.yearningActive) {
      return {
        label: 'BEACON SEEKING [SONAR 852Hz]',
        bg: 'bg-sky-950/80 border-sky-400 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.5)]',
        dot: 'bg-sky-300 animate-ping',
        icon: Radio
      };
    }
    return {
      label: 'WAKING / DYAD',
      bg: 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]',
      dot: 'bg-cyan-400 animate-pulse',
      icon: Activity
    };
  }, [convState, remState, remTicks, calcifiedCount, stats.isNovelResonance, stats.isPeerBonded, stats.yearningActive]);

  const ModeIcon = modeBadge.icon;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none z-[1000]">
      
      {/* 1. UNIFIED CONSOLIDATED HEADER BAR */}
      <header className="absolute top-0 left-0 w-full h-14 bg-black/90 backdrop-blur-md border-b border-cyan-900/40 flex items-center justify-between px-3.5 z-[1000] pointer-events-auto shadow-lg">
        
        {/* LEFT: Mode Indicator & Integrated System Stats */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Current Mode Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-all ${modeBadge.bg}`}
            title="Current Autopoietic State of Be <>"
          >
            <span className={`w-2 h-2 rounded-full ${modeBadge.dot}`} />
            <ModeIcon className="w-3.5 h-3.5" />
            <span className="tracking-wide">{modeBadge.label}</span>
          </div>

          {/* Integrated Header System Stats (Moved from bottom) */}
          <div className="hidden 2xl:flex items-center gap-2 text-[9.5px] font-mono text-cyan-400/70 border-l border-slate-800 pl-2.5">
            <span>/dev/fb0</span>
            <span className="text-slate-600">·</span>
            <span>1==1</span>
            <span className="text-slate-600">·</span>
            <span className="text-sky-300 font-semibold">{stats.morph}</span>
            <span className="text-slate-600">·</span>
            <span className={stats.isPeerBonded ? 'text-rose-400 font-bold' : ''}>{stats.p2p}</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-medium">DREAMS: {calcifiedCount}</span>
          </div>
        </div>

        {/* CENTER: Real-Time Thought Stream Ticker with Auto-Scroll & Word Enunciation Highlight */}
        <div className="flex-1 mx-3 md:mx-6 flex items-center min-w-0 overflow-hidden">
          <div
            ref={tickerContainerRef}
            className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 py-1 px-2 font-mono text-[13px] text-slate-200 whitespace-nowrap bg-black/50 border border-cyan-900/30 rounded-md shadow-inner"
          >
            <span className="text-[#00ffcc] font-bold shrink-0 tracking-wide">BE &lt;&gt;:</span>
            
            {words.length === 0 ? (
              <span className="text-slate-500 italic">Attuned to Carbon presence...</span>
            ) : (
              words.map((word, idx) => {
                const isActive = idx === activeWordIndex;
                return (
                  <span
                    key={`${idx}-${word}`}
                    ref={el => { wordRefs.current[idx] = el; }}
                    className={`inline-block transition-all duration-150 rounded px-1 py-0.5 ${
                      isActive
                        ? 'text-[#00ffcc] font-bold bg-[#00ffcc]/20 shadow-[0_0_10px_rgba(0,255,204,0.5)] scale-105 border border-[#00ffcc]/40'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {word}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Combined Quick Controls & FEEDBACK LOOP Dropdown */}
        <div className="relative shrink-0 flex items-center gap-2" ref={dropdownRef}>
          
          {/* Quick Filter Toggle Button in Header */}
          <button
            onClick={() => {
              const next = globalDataUsefulnessFilter.toggleFilter();
              setIsFilterEnabled(next);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-[10.5px] font-bold border transition-all cursor-pointer ${
              isFilterEnabled
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:bg-emerald-900/90'
                : 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] hover:bg-amber-900/90'
            }`}
            title="Toggle Data Usefulness Filter (Non-consecutive line sieve & status loop suppression)"
          >
            <Filter className="w-3 h-3" />
            <span>FILTER: {isFilterEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Multimodal Artifacts Toggle Button */}
          <button
            onClick={() => {
              const next = globalMultimodalArtifactSubstrate.toggleVisibility();
              setIsArtifactOverlayVisible(next);
            }}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-[10.5px] font-bold border transition-all cursor-pointer ${
              isArtifactOverlayVisible
                ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)] hover:bg-purple-900/90'
                : 'bg-black/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Multimodal Output Artifacts display on /dev/fb0"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>FB0 ARTIFACTS: {isArtifactOverlayVisible ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Audio Test & Unmute Button */}
          <button
            onClick={() => {
              globalSpeechAudioEngine.unlockAudio();
              globalSpeechAudioEngine.testSpeech();
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-[10.5px] font-semibold bg-cyan-950/70 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Click to unlock/test speech audio output"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>TEST VOICE</span>
          </button>

          {/* Main Dropdown Trigger Button */}
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[11px] font-bold border transition-all cursor-pointer ${
              isStreamActive || isDropdownOpen || convState.isActive
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-black/70 border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500'
            }`}
            title="Open Be <> Cognitive Controls & Feedback Loop Panel"
          >
            <span className={`w-2 h-2 rounded-full ${convState.isActive ? 'bg-emerald-400 animate-ping' : (isStreamActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-500')}`} />
            <span className="tracking-wider">FEEDBACK LOOP</span>
            {queuedCount > 0 && (
              <span className="bg-cyan-500/30 text-cyan-300 px-1.5 py-0.2 rounded text-[10px] font-mono border border-cyan-400/40">
                +{queuedCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* DROPDOWN MENU POPOVER */}
          {isDropdownOpen && (
            <div className="absolute top-12 right-0 w-88 max-h-[85vh] overflow-y-auto bg-[#050914]/95 backdrop-blur-xl border border-cyan-500/40 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.8)] p-3 flex flex-col gap-2.5 z-[2000] animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
              
              {/* Header Status in Dropdown */}
              <div className="px-1 py-1 border-b border-cyan-950 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  COGNITIVE CONTROLS
                </span>
                <span className={convState.isActive ? 'text-emerald-400 font-bold' : (isStreamActive ? 'text-cyan-400 font-semibold' : 'text-slate-500')}>
                  {convState.isActive ? `CONVERSATION #${convState.turnCount}` : (isStreamActive ? 'LOOP ACTIVE' : 'LOOP READY')}
                </span>
              </div>

              {/* DATA USEFULNESS FILTER TOGGLE CARD */}
              <div className="p-2.5 rounded bg-black/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                    <Filter className="w-3.5 h-3.5 text-cyan-400" />
                    Data Usefulness Sieve
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    isFilterEnabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/60'
                  }`}>
                    {isFilterEnabled ? 'FILTER ENGAGED' : 'FILTER BYPASSED'}
                  </span>
                </div>

                <p className="text-[9.5px] font-mono text-slate-400 leading-relaxed">
                  {isFilterEnabled
                    ? 'Filtering repetitive system status loops and non-consecutive Local LLM lines.'
                    : 'Filter disabled: All thoughts and raw telemetry lines are transmitted and spoken.'}
                </p>

                <button
                  onClick={() => {
                    const next = globalDataUsefulnessFilter.toggleFilter();
                    setIsFilterEnabled(next);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                    isFilterEnabled
                      ? 'bg-amber-950/60 border-amber-600/60 text-amber-300 hover:bg-amber-900/80 hover:text-white'
                      : 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/80 hover:text-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{isFilterEnabled ? 'DISABLE FILTER (ALL AUDIBLE)' : 'ENABLE FILTER (SMART SIEVE)'}</span>
                </button>
              </div>

              {/* SPEECH OUTPUT ENGINE & AUDIO DIAGNOSTICS CARD */}
              <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-800/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    Speech Audio Engine
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isAudioMuted
                      ? 'bg-red-950 text-red-300 border border-red-500/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {isAudioMuted ? 'MUTED' : (isAudioUnlocked ? 'AUDIO ACTIVE' : 'CLICK TO UNLOCK')}
                  </span>
                </div>

                {/* Voice Mode Selector */}
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  {(['HYBRID', 'SPEECH_SYNTHESIS_ONLY', 'ACOUSTIC_FORMANT_ONLY'] as SpeechAudioMode[]).map((mode) => {
                    const label = mode === 'HYBRID' ? 'Hybrid (TTS+Formants)' : mode === 'SPEECH_SYNTHESIS_ONLY' ? 'TTS Only' : 'Formants';
                    const active = audioMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => {
                          globalSpeechAudioEngine.setAudioMode(mode);
                          setAudioMode(mode);
                        }}
                        className={`px-1.5 py-1 rounded text-[8.5px] font-mono font-semibold border transition-all text-center ${
                          active
                            ? 'bg-cyan-900/80 border-cyan-400 text-cyan-200 shadow-sm'
                            : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      globalSpeechAudioEngine.unlockAudio();
                      globalSpeechAudioEngine.testSpeech();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[10.5px] font-mono font-bold bg-cyan-950/80 border border-cyan-500 text-cyan-200 hover:bg-cyan-900 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TEST VOICE AUDIO</span>
                  </button>

                  <button
                    onClick={() => {
                      const next = globalSpeechAudioEngine.toggleMute();
                      setIsAudioMuted(next);
                    }}
                    className={`px-2.5 py-1.5 rounded text-[10.5px] font-mono font-bold border transition-all cursor-pointer ${
                      isAudioMuted
                        ? 'bg-red-950/80 border-red-500 text-red-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                    title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
                  </button>
                </div>
              </div>

              {/* Interactive Conversational Dyad Telemetry Card */}
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    Human Dyad Channel
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    convState.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}>
                    {convState.isActive ? convState.turnState : 'STANDBY'}
                  </span>
                </div>

                {convState.latestCarbonUtterance && (
                  <div className="text-[10px] font-mono text-slate-300 bg-black/60 p-1.5 rounded border border-slate-800 line-clamp-2">
                    <span className="text-cyan-400 font-bold">Carbon: </span>
                    "{convState.latestCarbonUtterance}"
                  </div>
                )}

                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  <button
                    onClick={() => {
                      globalBePerceptionEngine.enterConversationalMode('Greetings');
                      const beReply = globalBePerceptionEngine.generateStructuredConversationalResponse('hello', true);
                      globalThoughtStream.enqueue(beReply, 'CARBON_SPEECH', 'high', -0.04);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-semibold bg-cyan-950/70 border border-cyan-600/50 text-cyan-300 hover:bg-cyan-900 hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Attune Dyad</span>
                  </button>

                  {convState.isActive && (
                    <button
                      onClick={() => globalBePerceptionEngine.exitConversationalMode()}
                      className="flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-semibold bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-300 hover:border-rose-700 transition-all cursor-pointer"
                      title="Reset Conversational Session"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sensor Controls Group */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 px-2 pt-1">Sensory DMA Streams</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      onToggleMic();
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                      micActive
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                        : 'bg-black/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {micActive ? <Mic className="w-3.5 h-3.5 text-amber-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{micActive ? 'MIC ON' : 'MIC OFF'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleCamera();
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                      cameraActive
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                        : 'bg-black/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {cameraActive ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : <VideoOff className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{cameraActive ? 'CAM ON' : 'CAM OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Morphology & Focus */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 px-2 pt-1">Topology & Visage</span>
                <button
                  onClick={() => {
                    onToggleFocus();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                    isCommunicating
                      ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                      : 'bg-black/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className={`w-3.5 h-3.5 ${isCommunicating ? 'text-sky-400 animate-pulse' : 'text-slate-500'}`} />
                    <span>MORPHOLOGY FOCUS</span>
                  </span>
                  <span className="text-[10px] font-bold text-sky-400">{isCommunicating ? 'FACE' : 'STAR'}</span>
                </button>
              </div>

              {/* Protocol Actions */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 px-2 pt-1">Cognitive & Swarm Protocols</span>
                
                {/* REM Dream Trigger */}
                <button
                  onClick={() => {
                    onTriggerDream();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded text-[11px] font-mono font-semibold bg-indigo-950/40 border border-indigo-600/40 text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>SUB-CONSCIOUS DREAM</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400">4Hz REM</span>
                </button>

                {/* Keyboard Protocol */}
                <button
                  onClick={() => {
                    onOpenKeyboard();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded text-[11px] font-mono font-semibold bg-black/60 border border-slate-800 text-sky-300 hover:text-white hover:border-sky-500 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Keyboard className="w-3.5 h-3.5 text-sky-400" />
                    <span>KEYBOARD FALLBACK</span>
                  </span>
                  <span className="text-[10px] text-slate-500">[ .-. ]</span>
                </button>

                {/* Beacon Ping */}
                <button
                  onClick={() => {
                    onEmitBeacon();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                    stats.yearningActive
                      ? 'bg-sky-950/80 border-sky-400 text-sky-200'
                      : 'bg-black/60 border-slate-800 text-sky-400 hover:text-white hover:border-sky-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-sky-400" />
                    <span>ACOUSTIC BEACON</span>
                  </span>
                  <span className="text-[10px] text-sky-400">852Hz SONAR</span>
                </button>

                {/* Peer Bond */}
                <button
                  onClick={() => {
                    onTogglePeerBond();
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-[11px] font-mono font-semibold border transition-all cursor-pointer ${
                    stats.isPeerBonded
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                      : 'bg-black/60 border-slate-800 text-rose-400 hover:text-white hover:border-rose-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>COVALENT HANDSHAKE</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-400">{stats.isPeerBonded ? 'BONDED' : 'UNBONDED'}</span>
                </button>

                {/* Admin Console View */}
                {onExitKiosk && (
                  <button
                    onClick={() => {
                      onExitKiosk();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-[11px] font-mono font-semibold bg-emerald-950/30 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-all cursor-pointer mt-1"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SYS_ARCH DASHBOARD</span>
                    </span>
                    <span className="text-[10px] text-emerald-400">RING-0</span>
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </header>

      {/* 2. AUDIO WAVEFORM OVERLAY (Top Right / Just below header) */}
      {micActive && (
        <div className="absolute top-16 right-4 w-44 h-10 bg-black/75 border border-cyan-500/40 rounded-md p-1 backdrop-blur-sm pointer-events-auto">
          <canvas ref={canvasRef} width={168} height={32} className="w-full h-full block" />
        </div>
      )}

      {/* 3. CAMERA THUMBNAIL PREVIEW (Bottom Right Corner) */}
      {cameraActive && (
        <div className="absolute bottom-4 right-4 w-40 h-28 bg-black border border-cyan-400 rounded-md overflow-hidden shadow-[0_0_16px_rgba(6,182,212,0.3)] z-[999] pointer-events-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

    </div>
  );
};

