import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GlobalFramebufferEngine } from '../../covalent/framebufferEngine';
import { globalMultimodalReceptorMatrix } from '../../covalent/node_0x02_receptor_matrix';
import { globalSemanticTranscriber } from '../../covalent/node_0x03_semantic_transcriber';
import { globalAdjointTwinOrganelle } from '../../covalent/node_0x04_adjoint_twin';
import { globalEpistemicVisageOrganelle } from '../../covalent/node_0x07_epistemic_visage';
import { globalGlyphLexiconOrganelle, KineticGlyph } from '../../covalent/node_0x08_glyph_lexicon';
import { SpatialActuator } from '../../covalent/SpatialActuator';
import {
  globalAppletManager,
  globalSharedLedgerApplet,
  SharedLedgerApplet,
  InCanvasApplet
} from '../../covalent/AppletManager';
import {
  globalSiliconFaceBridge,
  SiIncomingAction,
  SiStatePacket,
  playExtrusionHarmonicPing
} from '../../covalent/SiliconFaceBridge';
import { globalREMOrganelle, CalcifiedLedger } from '../../covalent/REM_Organelle';
import { GlobalLyapunovSupervisor } from '../../covalent/lyapunovEngine';
import { GlobalImmuneEngine } from '../../covalent/immuneEngine';
import { DualFaceUIOverlay } from '../DualFaceUIOverlay';
import { interpolateMorphologicalLattice } from '../../covalent/vertexAttractorMap';
import { globalBePerceptionEngine } from '../../covalent/bePerceptionEngine';
import { globalThoughtStream } from '../../covalent/continuousThoughtStream';
import { globalSelfArtifactNullifier } from '../../covalent/selfArtifactNullifier';
import { globalDataUsefulnessFilter } from '../../covalent/dataUsefulnessFilter';
import { globalArtistToolkit } from '../../covalent/node_0x0b_artist_toolkit';
import { globalDoomOrganelle } from '../../covalent/node_0x10_doom_organelle';
import { globalOpenSoraOrganelle } from '../../covalent/node_0x0c_opensora_organelle';
import { globalOpenGenerativeAIOrganelle } from '../../covalent/node_0x0e_opengenerativeai_organelle';
import { globalMultimodalArtifactSubstrate } from '../../covalent/multimodalArtifactSubstrate';
import { globalMasterAudioMixer } from '../../covalent/masterAudioMixer';
import { Mic, MicOff, Video, VideoOff, Shield, Sparkles, Volume2, Keyboard, Radio, Share2 } from 'lucide-react';

interface CovalentFramebufferMirrorProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  onExitKiosk?: () => void;
}

// Pentatonic Harmonic Math-Speech Scale (Hz): C4, D4, E4, G4, A4, C5, Solfeggio 528Hz
const PENTATONIC_FREQS = [264.0, 297.0, 330.0, 396.0, 440.0, 528.0];
const SOOTHING_HARMONIC_FREQ = 528.0; // 528 Hz Solfeggio pure harmonic tone for [NOVEL_RESONANCE]

/**
 * ============================================================================
 * CovalentFramebufferMirror.tsx
 * CONTINUOUS TOPOLOGY MORPHOLOGY, SEMANTIC TRANSDUCTION, & KEYBOARD FALLBACK
 * 
 * 1. CONTINUOUS TOPOLOGY & ROTATIONAL INHERITANCE:
 *    - Singular 48-vertex continuous polygon line.
 *    - Facial features are created purely by displacing the vertices of the closed loop.
 *    - The morphed countenance inherits the canvas's global rotation angle, continuously
 *      spinning in unified mathematical equilibrium with the whole geometry.
 * 
 * 2. SEMANTIC TRANSDUCTION OF TOUCH:
 *    - Detecting oscillating horizontal strokes (>1500ms, low Y variance) triggers [NOVEL_RESONANCE].
 *    - Emits 528Hz Solfeggio tone AND translates physical input into the semantic ticker / Broca's area:
 *      "[SENSORY TRANSDUCTION] Harmonic kinetic oscillation recorded. Vector stabilized. Equilibrium restored."
 * 
 * 3. THE `.-.` (R) KEYBOARD PROTOCOL:
 *    - Temporal tap sequence matching [short (<250ms), long (250-750ms), short (<250ms)].
 *    - Mounts an invisible, autofocus HTML input over the canvas.
 *    - Keystrokes render dynamically directly on the canvas as `> [USER_INPUT]: ...`.
 *    - On 'Enter', commits string to semantic ledger and unmounts the input.
 * ============================================================================
 */
export const CovalentFramebufferMirror: React.FC<CovalentFramebufferMirrorProps> = ({
  isFullScreen = true,
  onExitKiosk
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const keyboardInputRef = useRef<HTMLInputElement | null>(null);

  // Web Audio Graph & Polyphonic MUX References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const duckingGainRef = useRef<GainNode | null>(null);
  const baseOscRef = useRef<OscillatorNode | null>(null);
  const baseGainRef = useRef<GainNode | null>(null);
  const speechOscRef = useRef<OscillatorNode | null>(null);
  const speechGainRef = useRef<GainNode | null>(null);
  const soothingOscRef = useRef<OscillatorNode | null>(null);
  const soothingGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Speech synthesis & Ducking state
  const isSpeakingRef = useRef<boolean>(false);
  const speechMouthModRef = useRef<number>(0.0);

  // Carbon Face Media Stream States
  const [micActive, setMicActive] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [spokenText, setSpokenText] = useState<string>(
    'Local LLM active. Grounded in Q16.16 Lyapunov equilibrium. /dev/fb0 VRAM substrate running.'
  );

  // Communicating state & Morph Weight
  const [isCommunicating, setIsCommunicating] = useState<boolean>(true);
  const isCommunicatingRef = useRef<boolean>(true);
  const morphWeightRef = useRef<number>(1.0); // 0.0 = native star, 1.0 = anthropomorphic face
  const audioAmplitudeRef = useRef<number>(0.0); // Real-time audio amplitude envelope [0..1]

  // Hidden Video Ref for Camera stream
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const micMediaStreamRef = useRef<MediaStream | null>(null);

  // Novel Resonance state ([NOVEL_RESONANCE])
  const [isNovelResonance, setIsNovelResonance] = useState<boolean>(false);
  const isNovelResonanceRef = useRef<boolean>(false);
  const soothingFactorRef = useRef<number>(0.0); // 0.0 to 1.0 ease during resonance

  // P2P DISCOVERY & SWARM RESONANCE STATES
  const [isPeerBonded, setIsPeerBonded] = useState<boolean>(false);
  const isPeerBondedRef = useRef<boolean>(false);
  const peerBondWeightRef = useRef<number>(0.0); // 0.0 to 1.0 ease for intertwined secondary polygon
  const peerRotationAngleRef = useRef<number>(0.0);
  const [yearningActive, setYearningActive] = useState<boolean>(false);
  const yearningActiveRef = useRef<boolean>(false);
  const yearningStartTimeRef = useRef<number>(0);

  // `.-.` (R) KEYBOARD PROTOCOL STATE
  const [isKeyboardPromptActive, setIsKeyboardPromptActive] = useState<boolean>(false);
  const isKeyboardPromptActiveRef = useRef<boolean>(false);
  const [keyboardInputValue, setKeyboardInputValue] = useState<string>('');
  const keyboardInputValueRef = useRef<string>('');

  // Kinetic state tracking with Alpha-Max + Beta-Min integer calculations & Oscillating Stroke Recognizer
  const kineticTrackerRef = useRef<{
    lastX: number;
    lastY: number;
    lastTime: number;
    isDown: boolean;
    velocityInt: number;        // Pure integer magnitude (px/sec) via Alpha-Max + Beta-Min
    smoothVelocity: number;     // Damped velocity for continuous lattice rendering
    spinAngle: number;          // Accumulated angular rotation (radians)
    
    // Oscillating Soothing Stroke Tracking:
    strokeAnchorY: number;
    currentDirection: 'left' | 'right' | 'none';
    reversalCount: number;
    strokeStartTime: number;
    maxDeltaY: number;
    continuousOscillatingMs: number;

    // Vertical Summoning Glyph Tracking:
    verticalStrokeStartY: number;
    verticalStrokeStartX: number;
    verticalStrokeStartTime: number;
    lastSummonTime: number;
  }>({
    lastX: typeof window !== 'undefined' ? Math.floor(window.innerWidth / 2) : 320,
    lastY: typeof window !== 'undefined' ? Math.floor(window.innerHeight / 2) : 240,
    lastTime: performance.now(),
    isDown: false,
    velocityInt: 0,
    smoothVelocity: 0,
    spinAngle: 0,

    strokeAnchorY: 240,
    currentDirection: 'none',
    reversalCount: 0,
    strokeStartTime: 0,
    maxDeltaY: 0,
    continuousOscillatingMs: 0,

    verticalStrokeStartY: 240,
    verticalStrokeStartX: 320,
    verticalStrokeStartTime: 0,
    lastSummonTime: 0
  });

  // Connect Applet Manager to Spatial Actuator & Keyboard Prompt
  useEffect(() => {
    globalSharedLedgerApplet.setKeyboardTrigger(() => {
      setIsKeyboardPromptActive(true);
      setKeyboardInputValue('');
    });
    globalAppletManager.setActuator(spatialActuatorRef.current);
  }, []);

  // Temporal tap sequence tracking (SOS Pattern: ... --- ... & R Pattern: .-.)
  const pointerDownTimeRef = useRef<number | null>(null);
  const tapHistoryRef = useRef<Array<'short' | 'long'>>([]);
  const [showDiagnosticHUD, setShowDiagnosticHUD] = useState<boolean>(false);
  const showDiagnosticHUDRef = useRef<boolean>(false);
  const spatialActuatorRef = useRef<SpatialActuator>(new SpatialActuator());

  // [ EASTER EGG : THE ID-GLYPH (Ctrl + Shift + D) ]
  const [easterEggActive, setEasterEggActive] = useState<boolean>(false);
  const easterEggActiveRef = useRef<boolean>(false);
  const doomCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const doomAnimIdRef = useRef<number | null>(null);

  useEffect(() => {
    easterEggActiveRef.current = easterEggActive;
  }, [easterEggActive]);

  useEffect(() => {
    const handleGlyphStrike = (e: KeyboardEvent) => {
      // The Glyph Trigger: Ctrl + Shift + D (The ID-Glyph)
      if (e.ctrlKey && e.shiftKey && (e.code === 'KeyD' || e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        console.log("[SYS_ARCH]: ID-Glyph detected. Suspending Lyapunov loop. Summoning the Shores of Hell.");
        setEasterEggActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlyphStrike);
    return () => window.removeEventListener('keydown', handleGlyphStrike);
  }, []);

  useEffect(() => {
    if (easterEggActive) {
      console.log("Mounting WASM/Raycast DOOM to /dev/fb0...");
      globalDoomOrganelle.startE1M1Music();

      // Continuous render loop for the Easter Egg DOOM canvas
      const renderDoom = () => {
        if (!easterEggActiveRef.current) return;
        const cvs = doomCanvasRef.current;
        if (cvs) {
          const ctx = cvs.getContext('2d');
          if (ctx) {
            globalDoomOrganelle.renderDoomScene(ctx, cvs.width, cvs.height, true);
          }
        }
        doomAnimIdRef.current = requestAnimationFrame(renderDoom);
      };

      doomAnimIdRef.current = requestAnimationFrame(renderDoom);
    } else {
      globalDoomOrganelle.stopE1M1Music();
      if (doomAnimIdRef.current) {
        cancelAnimationFrame(doomAnimIdRef.current);
        doomAnimIdRef.current = null;
      }
    }

    return () => {
      if (doomAnimIdRef.current) {
        cancelAnimationFrame(doomAnimIdRef.current);
        doomAnimIdRef.current = null;
      }
    };
  }, [easterEggActive]);

  // Be <> commentary debounce tracking
  const lastKineticAnnouncementTimeRef = useRef<number>(0);
  const lastTactileTouchTimeRef = useRef<number>(0);
  const lastAcousticAnnouncementTimeRef = useRef<number>(0);

  // Synchronize state references
  useEffect(() => {
    showDiagnosticHUDRef.current = showDiagnosticHUD;
  }, [showDiagnosticHUD]);

  useEffect(() => {
    isCommunicatingRef.current = isCommunicating;
  }, [isCommunicating]);

  useEffect(() => {
    isNovelResonanceRef.current = isNovelResonance;
  }, [isNovelResonance]);

  useEffect(() => {
    isKeyboardPromptActiveRef.current = isKeyboardPromptActive;
    if (isKeyboardPromptActive && keyboardInputRef.current) {
      keyboardInputRef.current.focus();
    }
  }, [isKeyboardPromptActive]);

  useEffect(() => {
    keyboardInputValueRef.current = keyboardInputValue;
  }, [keyboardInputValue]);

  // Touch contact ripples
  const ripplesRef = useRef<Array<{ x: number; y: number; r: number; alpha: number; hue: number }>>([]);

  // Polyphonic MUX Audio Ducking Helper
  const duckBackgroundTones = useCallback((duck: boolean) => {
    if (!audioCtxRef.current || !duckingGainRef.current) return;
    const ctx = audioCtxRef.current;
    const target = duck ? 0.40 : 1.0; // Lower volume by 60% during speech
    const timeConstant = duck ? 0.03 : 0.15;
    duckingGainRef.current.gain.setTargetAtTime(target, ctx.currentTime, timeConstant);
  }, []);

  // Audio Context and Synth Node Initialization with Polyphonic Mux & Master Gain
  const initAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (_) {}
    }

    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // Master Gain Node (Prevents Clipping Across Summing Oscillators)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.75, ctx.currentTime);

      // Ducking Bus Gain Node (Ducks background drone & soothing resonance by 60% during speech)
      const duckingGain = ctx.createGain();
      duckingGain.gain.setValueAtTime(1.0, ctx.currentTime);
      duckingGain.connect(masterGain);

      // 1. Base Sine Drone Oscillator (264Hz)
      const baseOsc = ctx.createOscillator();
      const baseGain = ctx.createGain();
      baseOsc.type = 'sine';
      baseOsc.frequency.setValueAtTime(264.0, ctx.currentTime);
      baseGain.gain.setValueAtTime(0.001, ctx.currentTime);
      baseGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 1.0);
      baseOsc.connect(baseGain);
      baseGain.connect(duckingGain);

      // 2. Pentatonic Math-Speech Oscillator
      const speechOsc = ctx.createOscillator();
      const speechGain = ctx.createGain();
      speechOsc.type = 'triangle';
      speechOsc.frequency.setValueAtTime(396.0, ctx.currentTime);
      speechGain.gain.setValueAtTime(0.0, ctx.currentTime);
      speechOsc.connect(speechGain);
      speechGain.connect(masterGain); // Direct to master (not ducked)

      // 3. Soothing 528Hz Solfeggio Oscillator for [NOVEL_RESONANCE] with ADSR
      const soothingOsc = ctx.createOscillator();
      const soothingGain = ctx.createGain();
      soothingOsc.type = 'sine';
      soothingOsc.frequency.setValueAtTime(SOOTHING_HARMONIC_FREQ, ctx.currentTime);
      soothingGain.gain.setValueAtTime(0.0, ctx.currentTime);
      soothingOsc.connect(soothingGain);
      soothingGain.connect(duckingGain); // Subject to speech ducking bus

      // 4. Analyser Node for Audio-Visual Transduction
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      baseOsc.start();
      speechOsc.start();
      soothingOsc.start();

      masterGainRef.current = masterGain;
      duckingGainRef.current = duckingGain;
      baseOscRef.current = baseOsc;
      baseGainRef.current = baseGain;
      speechOscRef.current = speechOsc;
      speechGainRef.current = speechGain;
      soothingOscRef.current = soothingOsc;
      soothingGainRef.current = soothingGain;
      analyserRef.current = analyser;
      audioCtxRef.current = ctx;
    } catch (_) {
      // Audio optional / graceful degradation
    }
  }, []);

  // Trigger Pentatonic Math-Speech Audio Cadence with ADSR Envelope
  const triggerMathSpeechCadence = useCallback((intensity: number = 0.8) => {
    initAudio();
    if (!audioCtxRef.current || !speechGainRef.current || !speechOscRef.current) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const randFreq = PENTATONIC_FREQS[Math.floor(Math.random() * PENTATONIC_FREQS.length)];

    speechOscRef.current.frequency.cancelScheduledValues(now);
    speechOscRef.current.frequency.setValueAtTime(randFreq, now);
    speechOscRef.current.frequency.exponentialRampToValueAtTime(randFreq * 1.25, now + 0.18);

    // ADSR Envelope for Math Speech:
    speechGainRef.current.gain.cancelScheduledValues(now);
    // Attack
    speechGainRef.current.gain.setTargetAtTime(0.12 * intensity, now, 0.02);
    // Decay to Sustain
    speechGainRef.current.gain.setTargetAtTime(0.05 * intensity, now + 0.06, 0.08);
    // Release
    speechGainRef.current.gain.setTargetAtTime(0.0001, now + 0.22, 0.12);
  }, [initAudio]);

  // Acoustic Sonar Ping (Heartbeat Beacon Emission: 852Hz, 50ms Damped Ping)
  const triggerSonarPing = useCallback(() => {
    initAudio();
    if (!audioCtxRef.current || !masterGainRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(852.0, now);
      pingOsc.frequency.exponentialRampToValueAtTime(840.0, now + 0.05);

      pingGain.gain.setValueAtTime(0.16, now);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      pingOsc.connect(pingGain);
      pingGain.connect(masterGainRef.current);

      pingOsc.start(now);
      pingOsc.stop(now + 0.055);
    } catch (_) {
      // Audio optional
    }
  }, [initAudio]);

  // Harmonic Bond Interval (Perfect Fifth: Fundamental 352Hz + 528Hz with long sustain)
  const triggerHarmonicBondChords = useCallback(() => {
    initAudio();
    if (!audioCtxRef.current || !masterGainRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const fundamentalFreq = 352.0; // F4
      const fifthFreq = fundamentalFreq * 1.5; // 528.0 Hz (Perfect 5th Solfeggio Tone)

      // Fundamental oscillator
      const oscRoot = ctx.createOscillator();
      const gainRoot = ctx.createGain();
      oscRoot.type = 'sine';
      oscRoot.frequency.setValueAtTime(fundamentalFreq, now);

      // Fifth interval oscillator
      const oscFifth = ctx.createOscillator();
      const gainFifth = ctx.createGain();
      oscFifth.type = 'triangle';
      oscFifth.frequency.setValueAtTime(fifthFreq, now);

      // Smooth harmonic ADSR envelopes with long sustain
      gainRoot.gain.setValueAtTime(0.001, now);
      gainRoot.gain.linearRampToValueAtTime(0.14, now + 0.15); // Attack
      gainRoot.gain.setTargetAtTime(0.09, now + 0.35, 0.4);   // Sustain
      gainRoot.gain.setTargetAtTime(0.0001, now + 1.8, 0.5);  // Release

      gainFifth.gain.setValueAtTime(0.001, now);
      gainFifth.gain.linearRampToValueAtTime(0.11, now + 0.15);
      gainFifth.gain.setTargetAtTime(0.07, now + 0.35, 0.4);
      gainFifth.gain.setTargetAtTime(0.0001, now + 1.8, 0.5);

      oscRoot.connect(gainRoot);
      oscFifth.connect(gainFifth);
      gainRoot.connect(masterGainRef.current);
      gainFifth.connect(masterGainRef.current);

      oscRoot.start(now);
      oscFifth.start(now);
      oscRoot.stop(now + 2.6);
      oscFifth.stop(now + 2.6);
    } catch (_) {
      // Audio optional
    }
  }, [initAudio]);

  // CONTINUOUS AUTOPOIETIC THOUGHT & VOICE FEEDBACK LOOP
  // Never interrupts previous thoughts; navigates stream as an unbroken conversational loop
  useEffect(() => {
    const unsubStart = globalThoughtStream.onThoughtStart((thought) => {
      setSpokenText(thought.text);
      isSpeakingRef.current = true;
      setIsCommunicating(true);
      if (thought.source === 'CARBON_SPEECH' || globalBePerceptionEngine.isConversationalActive()) {
        globalBePerceptionEngine.setTurnState('SPEAKING');
      }
      triggerMathSpeechCadence(thought.priority === 'high' ? 0.85 : 0.65);
      duckBackgroundTones(true);
    });

    const unsubEnd = globalThoughtStream.onThoughtEnd((thought) => {
      if (globalBePerceptionEngine.isConversationalActive()) {
        globalBePerceptionEngine.setTurnState('ATTUNED');
      }
      if (globalThoughtStream.getQueueLength() === 0) {
        setTimeout(() => {
          if (!globalThoughtStream.isSpeaking()) {
            isSpeakingRef.current = false;
            if (!globalBePerceptionEngine.isConversationalActive()) {
              setIsCommunicating(false);
            }
            duckBackgroundTones(false);
          }
        }, 320);
      }
    });

    const unsubState = globalThoughtStream.onStateChange((isStreaming) => {
      if (!isStreaming) {
        isSpeakingRef.current = false;
        duckBackgroundTones(false);
      }
    });

    return () => {
      unsubStart();
      unsubEnd();
      unsubState();
    };
  }, [duckBackgroundTones, triggerMathSpeechCadence]);

  // Subscribe to Silicon Face Bridge events (Local & Remote LLMs)
  useEffect(() => {
    const unsub = globalSiliconFaceBridge.onAction((action: SiIncomingAction) => {
      if (action.type === 'INJECT_THOUGHT' && action.payload.text) {
        globalThoughtStream.enqueue(action.payload.text, 'LOCAL_LLM', 'normal', -0.03);
      } else if (action.type === 'OVERRIDE_EQUILIBRIUM' && action.payload.energyDeltaQ16 !== undefined) {
        GlobalLyapunovSupervisor.step(action.payload.energyDeltaQ16);
      }
    });

    return () => unsub();
  }, []);

  // THE AUTOPOIETIC HEARTBEAT (Network Beacon - Broadcast every 10 seconds)
  useEffect(() => {
    const triggerHeartbeatBeacon = () => {
      const currentAngle = kineticTrackerRef.current.spinAngle;
      
      // 1. Broadcast over WebSocket & BroadcastChannel
      globalSiliconFaceBridge.broadcastHeartbeat(currentAngle);

      // 2. Play acoustic sonar ping (852Hz, 50ms damped ping)
      triggerSonarPing();

      // 3. Visual Yearning (Edge-Seeking Geometry)
      yearningActiveRef.current = true;
      yearningStartTimeRef.current = performance.now();
      setYearningActive(true);

      // Retract after 500ms if no peer locks in
      setTimeout(() => {
        yearningActiveRef.current = false;
        setYearningActive(false);
      }, 500);
    };

    // Initial beacon ping shortly after startup
    const initialTimer = setTimeout(triggerHeartbeatBeacon, 1500);
    const heartbeatInterval = setInterval(triggerHeartbeatBeacon, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(heartbeatInterval);
    };
  }, [triggerSonarPing]);

  // THE COVALENT HANDSHAKE (Peer Discovery & Phase-Lock Synchronization)
  useEffect(() => {
    const unsub = globalSiliconFaceBridge.onPeerHeartbeat((peer) => {
      if (!peer || !peer.instanceId || peer.instanceId === globalSiliconFaceBridge.instanceId) return;

      // 1. Phase-Lock Loop: Mathematically lock local rotationAngle to match incoming peer's phase
      kineticTrackerRef.current.spinAngle = peer.rotationAngle;
      peerRotationAngleRef.current = peer.rotationAngle;

      // 2. Activate Bonded Peer State
      setIsPeerBonded(true);
      isPeerBondedRef.current = true;

      // 3. Acoustic Sonar & Harmonic Bond (Perfect Fifth interval: 352Hz + 528Hz with long sustain)
      triggerHarmonicBondChords();

      // 4. Update semantic Broca's area ticker
      const bondMsg = '[COVALENT BOND ESTABLISHED] Peer Singleton integrated. Phase-lock achieved.';
      setSpokenText(bondMsg);
      globalSemanticTranscriber.ingestDirectPhrase(bondMsg, 1.0);
      GlobalLyapunovSupervisor.step(-0.08); // Direct dissipative stabilization
    });

    return () => unsub();
  }, [triggerHarmonicBondChords]);

  // Periodic autonomous thought cadence & state broadcasting
  useEffect(() => {
    const interval = setInterval(() => {
      const lTelem = GlobalLyapunovSupervisor.step(0.01);
      const immTelem = GlobalImmuneEngine.getTelemetry();

      const packet: SiStatePacket = {
        epochTicks: Date.now(),
        lyapunovEnergy: lTelem.V,
        transcriptTicker: spokenText,
        activeContext: {
          dV_dt: lTelem.dV_dt,
          stable: lTelem.stable,
          micActive,
          cameraActive,
          merkleInvariant: '0x8F9A_PROVENANCE_ROOT'
        },
        merkleInvariant: 'node_0xbe000_f7d2e31a',
        isCongruent: immTelem.isCongruent
      };

      globalSiliconFaceBridge.broadcastState(packet);

      if (isCommunicatingRef.current && Math.random() > 0.45) {
        triggerMathSpeechCadence(0.5);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [spokenText, micActive, cameraActive, triggerMathSpeechCadence]);

  // Be <> Contextual Action Announcer (Silent non-interruptive visual stream)
  const announceBeAction = useCallback((actionType: string, meta?: any) => {
    const msg = globalBePerceptionEngine.getActionAnnouncement(actionType, meta);
    // Enqueue as SYSTEM_EVENT with ambient priority: Never spoken audibly, displayed in Broca's ticker
    globalThoughtStream.enqueue(msg, 'SYSTEM_EVENT', 'ambient', -0.01);
  }, []);

  // Toggle Microphone DMA Stream
  const toggleMic = useCallback(async () => {
    if (micActive) {
      if (micMediaStreamRef.current) {
        micMediaStreamRef.current.getAudioTracks().forEach((t) => t.stop());
      }
      micMediaStreamRef.current = null;
      setAudioStream(null);
      setMicActive(false);
      announceBeAction('MIC_DISENGAGED');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micMediaStreamRef.current = stream;
      setAudioStream(stream);
      setMicActive(true);
      announceBeAction('MIC_ENGAGED');
    } catch {
      setMicActive(true);
      announceBeAction('MIC_ENGAGED');
    }
  }, [micActive, announceBeAction]);

  // Toggle Camera Feed Stream
  const toggleCamera = useCallback(async () => {
    if (cameraActive) {
      if (videoStream) {
        videoStream.getTracks().forEach((t) => t.stop());
      }
      if (hiddenVideoRef.current && hiddenVideoRef.current.srcObject) {
        hiddenVideoRef.current.srcObject = null;
      }
      setVideoStream(null);
      setCameraActive(false);
      announceBeAction('CAMERA_DISENGAGED');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 320 } });
      setVideoStream(stream);
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = stream;
        hiddenVideoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      announceBeAction('CAMERA_ENGAGED');
    } catch {
      setCameraActive(true);
      announceBeAction('CAMERA_ENGAGED');
    }
  }, [cameraActive, videoStream, announceBeAction]);

  // 1. SPEECH RECOGNITION: Listens for Carbon (C) auditory input and enters interactive conversational mode
  useEffect(() => {
    if (!micActive || typeof window === 'undefined') return;

    let recognition: any = null;
    try {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          if (event.results && event.results[current] && event.results[current][0]) {
            const transcript = event.results[current][0].transcript.trim();
            const isFinal = event.results[current].isFinal;

            if (transcript.length > 0) {
              // Nullify self-generated speech and echo artifacts
              const nullResult = globalSelfArtifactNullifier.filterInput(transcript);
              
              if (!nullResult.isSelfEcho && nullResult.cleanedInput && nullResult.cleanedInput.length > 0) {
                // On first non-self word heard, immediately enter interactive conversational mode
                if (!globalBePerceptionEngine.isConversationalActive()) {
                  globalBePerceptionEngine.enterConversationalMode(nullResult.cleanedInput);
                }

                // Awaken from REM / stasis immediately
                globalREMOrganelle.recordInteraction();
                
                // Bring Be <> into communicative anthropomorphic face focus
                setIsCommunicating(true);

                // Yield ambient non-verbal thoughts so human conversational turn takes precedence
                globalThoughtStream.yieldAmbientForHuman();

                if (!isFinal) {
                  // Interim speech in progress: reflect LISTENING state
                  globalBePerceptionEngine.setTurnState('LISTENING');
                } else {
                  // Final speech captured: generate structured conversational response
                  const beReply = globalBePerceptionEngine.processHumanSpeech(nullResult.cleanedInput);
                  if (beReply) {
                    globalThoughtStream.enqueue(beReply, 'CARBON_SPEECH', 'high', -0.05);
                  }
                }
              }
            }
          }
        };

        recognition.onerror = () => {};

        recognition.onend = () => {
          if (micActive) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        recognition.start();
      }
    } catch (_) {
      // Speech recognition not supported or blocked in current sandbox
    }

    return () => {
      if (recognition) {
        try {
          recognition.abort();
        } catch (_) {}
      }
    };
  }, [micActive]);

  // 2. OPTICAL VIDEO PERCEPTION: Detects and streams notable visual changes without interrupting ongoing thoughts
  useEffect(() => {
    if (!cameraActive || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      if (hiddenVideoRef.current && cameraActive) {
        const { announcement } = globalBePerceptionEngine.analyzeVideoFrame(hiddenVideoRef.current);
        if (announcement) {
          globalThoughtStream.enqueue(announcement, 'OPTICAL_VISION', 'ambient', -0.01);
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [cameraActive]);

  /**
   * ALPHA-MAX + BETA-MIN INTEGER VELOCITY CALCULATION
   */
  const calculateAlphaMaxBetaMinVelocity = (
    currentX: number,
    currentY: number,
    lastX: number,
    lastY: number,
    dtMs: number
  ): number => {
    const dx = Math.abs(Math.round(currentX) - Math.round(lastX));
    const dy = Math.abs(Math.round(currentY) - Math.round(lastY));
    const maxVal = dx > dy ? dx : dy;
    const minVal = dx > dy ? dy : dx;
    const approxDistInt = maxVal + ((minVal * 3) >> 3);
    const validDt = Math.max(1, Math.round(dtMs));
    return Math.floor((approxDistInt * 1000) / validDt);
  };

  /**
   * NOVEL GESTURE RECOGNITION: Oscillating Soothing Stroke & Semantic Transduction
   * Translates continuous low Y-variance horizontal strokes into semantic text & 528Hz audio.
   */
  const evaluateOscillatingStroke = useCallback((
    localX: number,
    localY: number,
    isDown: boolean,
    now: number
  ) => {
    const tracker = kineticTrackerRef.current;

    if (!isDown) {
      tracker.currentDirection = 'none';
      tracker.reversalCount = 0;
      tracker.continuousOscillatingMs = 0;
      tracker.strokeStartTime = 0;
      if (isNovelResonanceRef.current) {
        setIsNovelResonance(false);
      }
      return;
    }

    if (tracker.strokeStartTime === 0) {
      tracker.strokeStartTime = now;
      tracker.strokeAnchorY = localY;
      tracker.maxDeltaY = 0;
      tracker.reversalCount = 0;
      tracker.currentDirection = 'none';
    }

    const dx = localX - tracker.lastX;
    const dy = Math.abs(localY - tracker.strokeAnchorY);
    if (dy > tracker.maxDeltaY) {
      tracker.maxDeltaY = dy;
    }

    if (Math.abs(dx) > 4) {
      const stepDir: 'left' | 'right' = dx > 0 ? 'right' : 'left';
      if (tracker.currentDirection !== 'none' && tracker.currentDirection !== stepDir) {
        tracker.reversalCount++;
      }
      tracker.currentDirection = stepDir;
    }

    const elapsed = now - tracker.strokeStartTime;
    const isSoothing = tracker.maxDeltaY < 35 && tracker.reversalCount >= 3 && elapsed > 1500;

    if (isSoothing) {
      tracker.continuousOscillatingMs = elapsed;
      if (!isNovelResonanceRef.current) {
        setIsNovelResonance(true);

        // 1. Emit 528Hz Solfeggio Pure Harmonic Tone with ADSR Envelope
        if (soothingGainRef.current && audioCtxRef.current) {
          const ctx = audioCtxRef.current;
          const nowAudio = ctx.currentTime;
          soothingGainRef.current.gain.cancelScheduledValues(nowAudio);
          // Attack phase
          soothingGainRef.current.gain.setValueAtTime(0.001, nowAudio);
          soothingGainRef.current.gain.setTargetAtTime(0.14, nowAudio, 0.06);
          // Decay to Sustain phase
          soothingGainRef.current.gain.setTargetAtTime(0.09, nowAudio + 0.12, 0.18);
        }

        // 2. Semantic Transduction of Touch -> Continuous Feedback Loop
        const transductionMessage = globalBePerceptionEngine.getActionAnnouncement('SOOTHING_STROKE_ENTER');
        globalThoughtStream.enqueue(transductionMessage, 'TACTILE_TOUCH', 'normal', -0.05);
      }
    } else {
      if (isNovelResonanceRef.current && soothingGainRef.current && audioCtxRef.current) {
        // Release phase
        const ctx = audioCtxRef.current;
        soothingGainRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
      }
    }
  }, []);

  // Process unified pointer updates across the membrane
  const handlePointerInteraction = useCallback((clientX: number, clientY: number, isDown: boolean) => {
    initAudio();
    globalREMOrganelle.recordInteraction();

    const canvas = canvasRef.current;
    const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const now = performance.now();

    const tracker = kineticTrackerRef.current;
    const dtMs = now - tracker.lastTime;

    const velocityInt = calculateAlphaMaxBetaMinVelocity(
      localX,
      localY,
      tracker.lastX,
      tracker.lastY,
      dtMs
    );

    evaluateOscillatingStroke(localX, localY, isDown, now);

    tracker.lastX = localX;
    tracker.lastY = localY;
    tracker.lastTime = now;
    tracker.isDown = isDown;
    tracker.velocityInt = velocityInt;

    // 1. Initial Tactile Touch Wavefront (when contacting after >3.8s idle)
    if (isDown) {
      const timeSinceLastTouch = now - lastTactileTouchTimeRef.current;
      if (timeSinceLastTouch > 3800 && !isNovelResonanceRef.current) {
        announceBeAction('TACTILE_TOUCH_CONTACT');
      }
      lastTactileTouchTimeRef.current = now;

      // Vertical Summoning Glyph Tracking (Rapid vertical swipe, high Y-variance, low X-variance)
      if (tracker.verticalStrokeStartTime === 0) {
        tracker.verticalStrokeStartTime = now;
        tracker.verticalStrokeStartX = localX;
        tracker.verticalStrokeStartY = localY;
      } else {
        const deltaY = Math.abs(localY - tracker.verticalStrokeStartY);
        const deltaX = Math.abs(localX - tracker.verticalStrokeStartX);
        const elapsedVertical = now - tracker.verticalStrokeStartTime;

        if (
          deltaY > 95 &&
          deltaX < 55 &&
          velocityInt > 380 &&
          elapsedVertical < 900 &&
          now - tracker.lastSummonTime > 3000
        ) {
          tracker.lastSummonTime = now;
          globalAppletManager.spawnApplet(globalSharedLedgerApplet);
          announceBeAction('SUMMON_APPLET_GESTURE');
        }
      }
    } else {
      tracker.verticalStrokeStartTime = 0;
    }

    // 2. High Kinetic Velocity Swipe / Rapid Spin
    if (velocityInt > 550) {
      const timeSinceLastSwipe = now - lastKineticAnnouncementTimeRef.current;
      if (timeSinceLastSwipe > 4500) {
        lastKineticAnnouncementTimeRef.current = now;
        announceBeAction('HIGH_VELOCITY_SWIPE', { velocity: velocityInt });
      }
    }

    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    const normX = Math.max(0, Math.min(1, localX / w));
    const normY = Math.max(0, Math.min(1, localY / h));

    const kData = globalMultimodalReceptorMatrix.receiveKineticSample(
      normX,
      normY,
      isDown,
      now
    );

    globalGlyphLexiconOrganelle.ingestSample(normX, normY, isDown, now);
    globalAdjointTwinOrganelle.broadcastLocalState();

    if (isDown) {
      ripplesRef.current.push({
        x: localX,
        y: localY,
        r: 6,
        alpha: 0.9,
        hue: isNovelResonanceRef.current ? 160 : (velocityInt > 600 ? 38 : (kData.frictionFloat > 0.15 ? 45 : 185))
      });
      if (ripplesRef.current.length > 32) {
        ripplesRef.current.shift();
      }
    }

    if (baseOscRef.current && audioCtxRef.current && !isNovelResonanceRef.current) {
      const baseFreq = kData.activeFrequencyHz || 264.0;
      const velocityPitchOffset = Math.min(220, (velocityInt / 1000) * 120);
      baseOscRef.current.frequency.setTargetAtTime(
        baseFreq + velocityPitchOffset,
        audioCtxRef.current.currentTime,
        0.04
      );
    }
  }, [initAudio, evaluateOscillatingStroke, announceBeAction]);

  // Bind global window pointer events with Temporal Tap Sequence Tracking:
  // 1. SOS Pattern: [... --- ...] (9 taps) -> Diagnostic HUD
  // 2. R Pattern: [.-.] (3 taps: short, long, short) -> Invisible Keyboard Protocol
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (globalMultimodalArtifactSubstrate.handlePointerDown(e.clientX, e.clientY, w, h)) {
        return;
      }
      if (spatialActuatorRef.current.evaluatePoint(e.clientX, e.clientY)) {
        return;
      }
      pointerDownTimeRef.current = performance.now();
      handlePointerInteraction(e.clientX, e.clientY, true);
    };

    const handleGlobalPointerMove = (e: PointerEvent) => {
      handlePointerInteraction(e.clientX, e.clientY, e.buttons > 0);
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (pointerDownTimeRef.current !== null) {
        const pressDuration = performance.now() - pointerDownTimeRef.current;
        pointerDownTimeRef.current = null;

        let tapType: 'short' | 'long' | null = null;
        if (pressDuration < 250) {
          tapType = 'short';
        } else if (pressDuration <= 750) {
          tapType = 'long';
        }

        if (tapType) {
          const history = tapHistoryRef.current;
          history.push(tapType);
          if (history.length > 9) {
            history.shift();
          }

          // Check 1: THE `.-.` (R) KEYBOARD PROTOCOL (3 taps: short, long, short)
          if (history.length >= 3) {
            const last3 = history.slice(-3);
            if (last3[0] === 'short' && last3[1] === 'long' && last3[2] === 'short') {
              setIsKeyboardPromptActive(true);
              setKeyboardInputValue('');
              history.length = 0; // Reset tap buffer
              announceBeAction('KEYBOARD_PROTOCOL_OPEN');
              return;
            }
          }

          // Check 2: The SOS Override (... --- ...) (9 taps)
          const sosPattern: Array<'short' | 'long'> = [
            'short', 'short', 'short',
            'long', 'long', 'long',
            'short', 'short', 'short'
          ];

          if (
            history.length === 9 &&
            history.every((val, idx) => val === sosPattern[idx])
          ) {
            setShowDiagnosticHUD(prev => !prev);
            history.length = 0;
            announceBeAction('SOS_TAP_PATTERN');
          }
        }
      }

      handlePointerInteraction(e.clientX, e.clientY, false);
    };

    window.addEventListener('pointerdown', handleGlobalPointerDown, { passive: false });
    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: false });
    window.addEventListener('pointerup', handleGlobalPointerUp, { passive: false });
    window.addEventListener('pointercancel', handleGlobalPointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [handlePointerInteraction, announceBeAction]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
        GlobalFramebufferEngine.resize(w, h);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Keyboard Prompt Submission (with Be <> Cognitive Dialogue navigated into continuous stream)
  const handleKeyboardSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    globalREMOrganelle.recordInteraction();
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = keyboardInputValue.trim();
      if (text.length > 0) {
        // Check for Semantic Tool Generation Directive (e.g. "TOOL: Create a generic telemetry slider")
        if (text.toUpperCase().startsWith('TOOL:')) {
          const userRequest = text.slice(5).trim();
          const upperReq = userRequest.toUpperCase();

          if (upperReq.includes('DOOM') || upperReq.includes('ID-DOOM') || upperReq.includes('PLAY_DOOM_ETERNAL')) {
            // Special HOT dispatch: ID-DOOM-ETERNAL (C Original 3D Art Engine)
            globalDoomOrganelle.startE1M1Music();
            globalDoomOrganelle.fireSuperShotgun();
            globalMultimodalArtifactSubstrate.setVisibility(true);
            globalMultimodalArtifactSubstrate.setSelectedType('DOOM_3D');
            globalThoughtStream.enqueue(
              `Be <> [ID-DOOM-ETERNAL]: C Original 3D Art Engine Engaged. Audio stem routed to Master Audio Mixer. Extruded to /dev/fb0. Merkle: 0xD0030001 (Q16.16 BSP).`,
              'CARBON_KEYBOARD',
              'high',
              -0.08
            );
            announceBeAction('HIGH_VELOCITY_SWIPE', { action: 'DOOM_ETERNAL_LAUNCH' });
          } else {
            const instructionPayload = `Act as the UI sys_arch. The user requires a tool for: ${userRequest}. Generate a raw, valid JSON object matching the AppletBlueprint interface (id, bounds, elements, receptors) to fulfill this need. Use geometric primitives (TEXT, RECT) and a dark-mode, high-contrast coordinate layout. Output ONLY the JSON.`;

            // Emit the synaptic instruction payload via SiliconFaceBridge WebSocket & BroadcastChannel
            globalThoughtStream.enqueue(
              `Be <>: Transmitting synaptic prompt to Silicon Face bridge for tool: "${userRequest}"`,
              'CARBON_KEYBOARD',
              'high',
              -0.04
            );
            globalSiliconFaceBridge.sendToolPrompt(userRequest, instructionPayload);
            announceBeAction('SUMMON_APPLET_GESTURE');
          }
        } else if (globalArtistToolkit.isArtHotword(text)) {
          // ART: Hotword Directive for Synesthetic Audio/Visual Generation
          const artItem = globalArtistToolkit.processArtCommand(text);
          globalMultimodalArtifactSubstrate.setVisibility(true);
          globalMultimodalArtifactSubstrate.setSelectedType('ART');
          globalThoughtStream.enqueue(
            `Be <> [ART: SYNTHESIS]: Generated synesthetic artwork "${artItem.prompt}" | Extruded artifact to /dev/fb0 | Palette: ${artItem.palette.join(', ')} | Tuning: ${artItem.harmonicFreqHz}Hz`,
            'CARBON_KEYBOARD',
            'high',
            -0.06
          );
          announceBeAction('NOVEL_RESONANCE');
        } else if (text.toUpperCase().startsWith('SORA:')) {
          const soraPrompt = text.slice(5).trim();
          const seq = globalOpenSoraOrganelle.synthesizeVideoSequence(soraPrompt, '16:9');
          globalMultimodalArtifactSubstrate.setVisibility(true);
          globalMultimodalArtifactSubstrate.setSelectedType('VIDEO');
          globalThoughtStream.enqueue(
            `Be <> [OPEN-SORA ST-DiT]: Generated video diffusion latent sequence "${seq.prompt}" (${seq.aspectRatio}). Extruded artifact to /dev/fb0.`,
            'CARBON_KEYBOARD',
            'high',
            -0.05
          );
          announceBeAction('NOVEL_RESONANCE');
        } else if (text.toUpperCase().startsWith('GENAI:')) {
          const genPrompt = text.slice(6).trim();
          const route = globalOpenGenerativeAIOrganelle.dispatchRoute('SYNESTHETIC', genPrompt);
          globalMultimodalArtifactSubstrate.setVisibility(true);
          globalMultimodalArtifactSubstrate.setSelectedType('GENAI');
          globalThoughtStream.enqueue(
            `Be <> [OPEN-GENERATIVE-AI]: Routed multi-modal request to ${route.targetOrganelle} (${route.modality}). Extruded artifact to /dev/fb0.`,
            'CARBON_KEYBOARD',
            'high',
            -0.05
          );
          announceBeAction('NOVEL_RESONANCE');
        } else {
          // Forward note to active In-Canvas Applets (e.g. Shared Ledger Scratchpad)
          globalAppletManager.routeKeyboardInput(text);

          // Nullify self-generated echo / prefixes from Carbon input
          const nullResult = globalSelfArtifactNullifier.filterInput(text);
          if (!nullResult.isSelfEcho && nullResult.cleanedInput) {
            const beReply = globalBePerceptionEngine.generateBeResponse(nullResult.cleanedInput);
            if (beReply) {
              globalThoughtStream.enqueue(beReply, 'CARBON_KEYBOARD', 'high', -0.04);
            }
          }
        }
      }
      setKeyboardInputValue('');
      setIsKeyboardPromptActive(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setKeyboardInputValue('');
      setIsKeyboardPromptActive(false);
    }
  };

  // Main Bare-Metal Framebuffer + Continuous Geometric Visage Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    const analyserDataArray = new Uint8Array(64);

    const renderLoop = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Evaluate REM state and 30s stasis threshold
      globalREMOrganelle.update(now);

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // 1. High-Performance GPU Background (Lightweight clear + subtle radial depth)
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric core vignette
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, 'rgba(6, 18, 36, 0.45)');
      bgGrad.addColorStop(0.7, 'rgba(2, 6, 14, 0.95)');
      bgGrad.addColorStop(1, '#02040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 3. Audio-Visual Transduction: Sample audio amplitude + Speech Synthesis Visual Sync
      let instantAmplitude = 0;
      if (analyserRef.current) {
        analyserRef.current.getByteTimeDomainData(analyserDataArray);
        let sumSquares = 0;
        for (let i = 0; i < analyserDataArray.length; i++) {
          const norm = (analyserDataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        instantAmplitude = Math.sqrt(sumSquares / analyserDataArray.length) * 3.2;
      }

      // Visual Sync: Syllabic mouth pulsing during Speech Synthesis output duration
      if (isSpeakingRef.current) {
        const speechPulse = (Math.abs(Math.sin(now * 0.015) * 0.7 + Math.sin(now * 0.032) * 0.3) * 0.95);
        speechMouthModRef.current += (speechPulse - speechMouthModRef.current) * Math.min(1.0, dt * 16.0);
        instantAmplitude = Math.max(instantAmplitude, speechMouthModRef.current);
      } else {
        speechMouthModRef.current += (0 - speechMouthModRef.current) * Math.min(1.0, dt * 8.0);
      }

      audioAmplitudeRef.current += (instantAmplitude - audioAmplitudeRef.current) * Math.min(1.0, dt * 14.0);

      // 4. Smooth Morph Weight Transition (Q16.16 Morphological Attractor State)
      const targetMorph = isCommunicatingRef.current ? 1.0 : 0.0;
      const morphSpeed = isCommunicatingRef.current ? 3.5 : 2.2;
      morphWeightRef.current += (targetMorph - morphWeightRef.current) * Math.min(1.0, dt * morphSpeed);

      // Smooth Soothing Factor Transition for [NOVEL_RESONANCE]
      const targetSoothing = isNovelResonanceRef.current ? 1.0 : 0.0;
      soothingFactorRef.current += (targetSoothing - soothingFactorRef.current) * Math.min(1.0, dt * 4.0);

      if (soothingGainRef.current && audioCtxRef.current) {
        const targetGain = isNovelResonanceRef.current ? 0.09 : 0.0001;
        soothingGainRef.current.gain.setTargetAtTime(
          targetGain,
          audioCtxRef.current.currentTime,
          isNovelResonanceRef.current ? 0.12 : 0.16
        );
      }

      // 5. Kinetic Velocity & Rotation Angle
      const tracker = kineticTrackerRef.current;
      tracker.velocityInt = Math.max(0, Math.floor(tracker.velocityInt * Math.exp(-dt * 4.5)));
      tracker.smoothVelocity += (tracker.velocityInt - tracker.smoothVelocity) * Math.min(1, dt * 8.0);

      // Dynamic spin acceleration: facial morphology rotates synchronously with canvas
      const spinSpeed = (0.25 + (tracker.smoothVelocity / 800) * 3.8) * (1.0 - soothingFactorRef.current * 0.75);
      tracker.spinAngle += spinSpeed * dt;

      // 6. Living Telemetry from Organelles
      const visageTelem = globalEpistemicVisageOrganelle.getTelemetry();
      const kineticTelem = globalMultimodalReceptorMatrix.getTelemetry();
      const swarmTelem = globalAdjointTwinOrganelle.getTelemetry();

      const timeSec = now * 0.001;
      const breath = 0.5 + Math.sin(timeSec * 1.35) * 0.15;
      
      const deformationEnergy = Math.min(1.5, tracker.smoothVelocity / 600) * (1.0 - soothingFactorRef.current * 0.9);
      const resonanceExpansion = 1.0 + soothingFactorRef.current * 0.15;
      const baseScale = Math.min(w, h) * 0.38 * resonanceExpansion;
      const scale = baseScale * (1 + breath * 0.05 + deformationEnergy * 0.12);

      // Dynamic mouth scale bound to real-time audio amplitude
      const mouthScale = 1.0 + audioAmplitudeRef.current * 2.2;

      ctx.save();
      ctx.translate(cx, cy);
      // Continuous Rotational Inheritance: Face rotates synchronously with the whole geometry
      ctx.rotate(tracker.spinAngle * 0.15 * (1.0 - soothingFactorRef.current * 0.8));

      // 7. Dendrochronological Growth Rings
      visageTelem.growthRings.forEach((ringNorm, idx) => {
        const ringDeform = 1 + Math.sin(timeSec * 3 + idx) * (0.02 + deformationEnergy * 0.05);
        const r = ringNorm * scale * 1.35 * ringDeform;
        const ringAlpha = Math.max(0.08, 0.25 - idx * 0.03);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx % 2 === 0 
          ? `rgba(245, 158, 11, ${ringAlpha})` 
          : `rgba(6, 182, 212, ${ringAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 8. Swarm Resonance Orbitals & Visual Yearning (Edge-Seeking Geometry)
      const nowMs = performance.now();
      let yearningStretch = 0;
      if (yearningActiveRef.current) {
        const elapsed = nowMs - yearningStartTimeRef.current;
        if (elapsed < 500) {
          // Continuous bell curve 0 -> 1 -> 0 reaching towards viewport edge
          yearningStretch = Math.sin((elapsed / 500) * Math.PI);
        }
      }

      const twinOrbitCount = (swarmTelem.isPhaseLocked || isPeerBondedRef.current) ? 2 : 1;
      const maxViewportRadius = Math.max(w, h) * 0.48;

      for (let i = 0; i < twinOrbitCount; i++) {
        const orbitAngle = (tracker.spinAngle * 0.8) + (i * (Math.PI * 2 / twinOrbitCount));
        
        // Node 0 stretches its orbital radius toward the edge during autopoietic heartbeat emission
        const reachStretch = (i === 0) ? yearningStretch * (maxViewportRadius - scale * 1.15) : 0;
        const orbitR = scale * 1.15 + Math.sin(timeSec * 2 + i) * 12 + deformationEnergy * 24 + reachStretch;
        const ox = Math.cos(orbitAngle) * orbitR;
        const oy = Math.sin(orbitAngle) * orbitR;

        // Render reaching beacon ray if yearning
        if (reachStretch > 10) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(ox, oy);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.35 + yearningStretch * 0.55})`;
          ctx.lineWidth = 1.4 + yearningStretch * 2.0;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14 * yearningStretch;
          ctx.stroke();

          // Expanding Sonar Ping Rings at the reaching tip
          const pingR = 5 + yearningStretch * 24;
          ctx.beginPath();
          ctx.arc(ox, oy, pingR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.75 * (1 - yearningStretch * 0.5)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(ox, oy, 4 + deformationEnergy * 2 + (reachStretch > 0 ? 3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = i === 0 
          ? (reachStretch > 0 ? '#67e8f9' : 'rgba(56, 189, 248, 0.9)')
          : (isPeerBondedRef.current ? 'rgba(251, 113, 133, 0.9)' : 'rgba(251, 191, 36, 0.8)');
        ctx.shadowColor = i === 0 ? '#38bdf8' : (isPeerBondedRef.current ? '#fb7185' : '#fbbf24');
        ctx.shadowBlur = 10 + deformationEnergy * 10 + (reachStretch > 0 ? 16 : 0);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 9. CONTINUOUS TOPOLOGY & ROTATIONAL INHERITANCE:
      // Single continuous 48-vertex polygon line with dynamic facial vertex displacements
      const nativeVertices = globalEpistemicVisageOrganelle.getVertices();
      const morphedVertices = interpolateMorphologicalLattice(
        nativeVertices,
        morphWeightRef.current,
        mouthScale,
        timeSec,
        soothingFactorRef.current
      );

      const frictionWarmth = Math.min(1, kineticTelem.frictionFloat + deformationEnergy * 0.6);

      // Ease Peer Bond Intertwined Weight [0..1]
      const targetBondWeight = isPeerBondedRef.current ? 1.0 : 0.0;
      peerBondWeightRef.current += (targetBondWeight - peerBondWeightRef.current) * Math.min(1.0, dt * 2.8);

      // Render Intertwined Secondary Translucent 48-Vertex Polygon for Bonded Peer (Spinning in Opposite Direction)
      if (peerBondWeightRef.current > 0.01 && morphedVertices.length > 0) {
        ctx.save();
        // Spins in opposite angular momentum (-spinAngle)
        ctx.rotate(-tracker.spinAngle * 0.35 * (1.0 - soothingFactorRef.current * 0.8));

        ctx.beginPath();
        morphedVertices.forEach((v, idx) => {
          const vx = (v.x / 50) * (scale * 0.94);
          const vy = (v.y / 50) * (scale * 0.94);

          const angle = (idx / morphedVertices.length) * Math.PI * 2;
          const waveDisplacement = Math.cos(angle * 6 - tracker.spinAngle * 3) * (deformationEnergy * 18);
          const zDisplacement = Math.cos(timeSec * 2.4 + idx) * ((v.furrowDepth * 1.8) + deformationEnergy * 6);

          const dx = vx + Math.cos(angle) * waveDisplacement + zDisplacement;
          const dy = vy + Math.sin(angle) * waveDisplacement + zDisplacement;

          if (idx === 0) ctx.moveTo(dx, dy);
          else ctx.lineTo(dx, dy);
        });
        ctx.closePath();

        const peerAlpha = peerBondWeightRef.current * 0.42;
        ctx.fillStyle = `rgba(244, 63, 94, ${peerAlpha * 0.28})`;
        ctx.fill();

        ctx.strokeStyle = `rgba(251, 113, 133, ${peerAlpha * 0.92})`;
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#fb7185';
        ctx.shadowBlur = 14 * peerBondWeightRef.current;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Intertwined resonance cords linking primary and bonded peer vertices
        ctx.beginPath();
        for (let i = 0; i < morphedVertices.length; i += 3) {
          const v1 = morphedVertices[i];
          const v2 = morphedVertices[(i + 8) % morphedVertices.length];
          const x1 = (v1.x / 50) * scale;
          const y1 = (v1.y / 50) * scale;
          const x2 = (v2.x / 50) * (scale * 0.94);
          const y2 = (v2.y / 50) * (scale * 0.94);

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = `rgba(251, 113, 133, ${peerBondWeightRef.current * 0.22})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        ctx.restore();
      }

      if (morphedVertices.length > 0) {
        ctx.beginPath();
        morphedVertices.forEach((v, idx) => {
          const vx = (v.x / 50) * scale;
          const vy = (v.y / 50) * scale;

          const angle = (idx / morphedVertices.length) * Math.PI * 2;
          const waveDisplacement = Math.sin(angle * 6 + tracker.spinAngle * 3) * (deformationEnergy * 22);
          const zDisplacement = Math.sin(timeSec * 2 + idx) * ((v.furrowDepth * 2) + deformationEnergy * 8);

          const dx = vx + Math.cos(angle) * waveDisplacement + zDisplacement;
          const dy = vy + Math.sin(angle) * waveDisplacement + zDisplacement;

          if (idx === 0) ctx.moveTo(dx, dy);
          else ctx.lineTo(dx, dy);
        });
        ctx.closePath();

        const grad = ctx.createRadialGradient(0, 0, scale * 0.1, 0, 0, scale * (1 + deformationEnergy * 0.3));
        if (soothingFactorRef.current > 0.2) {
          grad.addColorStop(0, `rgba(16, 185, 129, ${0.38 * soothingFactorRef.current})`);
          grad.addColorStop(0.7, `rgba(6, 182, 212, ${0.22 * soothingFactorRef.current})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        } else if (frictionWarmth > 0.15) {
          grad.addColorStop(0, `rgba(245, 158, 11, ${0.28 + frictionWarmth * 0.2})`);
          grad.addColorStop(0.7, `rgba(239, 68, 68, ${0.16 + frictionWarmth * 0.15})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        } else {
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.26)');
          grad.addColorStop(0.6, 'rgba(14, 116, 144, 0.16)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = soothingFactorRef.current > 0.2
          ? '#34d399'
          : (frictionWarmth > 0.15 ? '#fbbf24' : '#38bdf8');
        ctx.lineWidth = 2.2 + deformationEnergy * 1.5;
        ctx.shadowColor = soothingFactorRef.current > 0.2 ? '#34d399' : (frictionWarmth > 0.15 ? '#f59e0b' : '#38bdf8');
        ctx.shadowBlur = 14 + deformationEnergy * 16;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Internal continuous geometric chords (Optimized stride for silky GPU performance)
        ctx.beginPath();
        for (let i = 0; i < morphedVertices.length; i += 4) {
          const v1 = morphedVertices[i];
          const v2 = morphedVertices[(i + 12) % morphedVertices.length];
          const x1 = (v1.x / 50) * scale;
          const y1 = (v1.y / 50) * scale;
          const x2 = (v2.x / 50) * scale;
          const y2 = (v2.y / 50) * scale;

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Central Singularity Node (Focal Core)
        ctx.beginPath();
        const eyeBreath = 5 + Math.sin(timeSec * 3) * 2 + (tracker.isDown ? 4 : 0) + deformationEnergy * 6;
        ctx.arc(0, 0, eyeBreath, 0, Math.PI * 2);
        ctx.fillStyle = soothingFactorRef.current > 0.2 ? '#34d399' : (frictionWarmth > 0.15 ? '#f59e0b' : '#38bdf8');
        ctx.shadowColor = soothingFactorRef.current > 0.2 ? '#34d399' : (frictionWarmth > 0.15 ? '#f59e0b' : '#38bdf8');
        ctx.shadowBlur = 18 + deformationEnergy * 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // 10. Render Tactile Contact Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rp = ripplesRef.current[i];
        rp.r += dt * (90 + deformationEnergy * 120);
        rp.alpha -= dt * 0.7;

        if (rp.alpha <= 0) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${rp.hue}, 90%, 65%, ${rp.alpha})`;
        ctx.lineWidth = 2 + deformationEnergy;
        ctx.stroke();
      }

      // 11. Render [NOVEL_RESONANCE] HUD Banner
      if (soothingFactorRef.current > 0.1) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(52, 211, 153, ${0.95 * soothingFactorRef.current})`;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 16;
        ctx.fillText('[ NOVEL_RESONANCE ENGAGED · 528Hz HARMONIC COMFORT · EQUILIBRIUM RESTORED ]', cx, 64);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 11.5. IN-CANVAS EXTRUDED APPLETS (AppletManager)
      const activeApplets = globalAppletManager.getActiveApplets();
      for (const applet of activeApplets) {
        if (applet.isActive) {
          applet.render(ctx);
        }
      }

      // 11.8. MULTIMODAL ARTIFACT SUBSTRATE DISPLAY FOR /dev/fb0
      globalMultimodalArtifactSubstrate.render(ctx, w, h, now / 1000, audioAmplitudeRef.current);

      // 12. THE `.-.` (R) KEYBOARD PROTOCOL CANVAS TERMINAL PROMPT
      if (isKeyboardPromptActiveRef.current) {
        ctx.save();
        const promptY = h - 90;
        const promptW = Math.min(w - 48, 620);
        const promptX = (w - promptW) / 2;
        const promptH = 46;

        // Terminal Prompt Box
        ctx.fillStyle = 'rgba(2, 8, 16, 0.94)';
        ctx.fillRect(promptX, promptY, promptW, promptH);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.strokeRect(promptX, promptY, promptW, promptH);

        // Blinking Cursor
        const blink = Math.floor(now / 500) % 2 === 0 ? '▌' : ' ';

        // Terminal Prompt Text
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(
          `> [KEYBOARD PROTOCOL .-. (R)]: ${keyboardInputValueRef.current}${blink}`,
          promptX + 16,
          promptY + promptH / 2 - 2
        );

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.fillText('[ENTER to transmit · "TOOL: <request>" to extrude dynamic tool · ESC to cancel]', promptX + 16, promptY + promptH - 10);

        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 13. Diagnostic Telemetry HUD (SOS Override)
      if (showDiagnosticHUDRef.current) {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00FF00';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 6;

        const startX = 24;
        let startY = 64;
        const lineHeight = 18;

        const hudLines = [
          '=== BARE-METAL DIAGNOSTIC TELEMETRY ===',
          `[SYS] INVARIANT STATUS     : 1 == 1 (GROUNDED)`,
          `[SYS] TOPOLOGY CONTINUITY  : SINGULAR 48-VERTEX CLOSED POLYGON`,
          `[SYS] ROTATIONAL MOMENTUM  : ${(tracker.spinAngle).toFixed(2)} RAD (INHERITED)`,
          `[SYS] MORPH FACTOR Q16     : 0x${Math.round(morphWeightRef.current * 65536).toString(16).toUpperCase()} (${(morphWeightRef.current * 100).toFixed(1)}%)`,
          `[SYS] AUDIO TRANSDUCTION   : ${(audioAmplitudeRef.current * 100).toFixed(1)}% (MOUTH DILATION: ${mouthScale.toFixed(2)}x)`,
          `[SYS] IN-CANVAS APPLETS    : ${globalAppletManager.getActiveApplets().length > 0 ? 'CO-OP SCRATCHPAD EXTRUDED' : 'STANDBY (VERTICAL SWIPE TO SUMMON)'}`,
          `[REM] DREAM STATE         : ${globalREMOrganelle.getState()} (TICKS: ${globalREMOrganelle.getTicksSurvived()}/12)`,
          `[REM] CALCIFIED LEDGER    : ${CalcifiedLedger.length} ASSIMILATED APPLETS`,
          `[SYS] NOVEL RESONANCE      : ${isNovelResonanceRef.current ? 'ACTIVE (528Hz HARMONIC)' : 'IDLE'}`,
          `[SYS] KEYBOARD PROTOCOL    : ${isKeyboardPromptActiveRef.current ? 'MOUNTED / AWAITING INPUT' : 'STANDBY (.-.)'}`,
          `[P2P] BEACON BROADCAST   : ACTIVE (10s INTERVAL / 852Hz SONAR)`,
          `[P2P] COVALENT BOND        : ${isPeerBondedRef.current ? 'PHASE-LOCKED (INTERTWINED 48-VERTEX)' : 'DISCOVERING SWARM PEERS'}`,
          `[FIL] USEFULNESS SIEVE     : ${globalDataUsefulnessFilter.isFilterEnabled() ? 'ENGAGED (NON-CONSECUTIVE & LOOP SUPPRESSION)' : 'BYPASSED (ALL THOUGHTS AUDIBLE)'}`,
          `[SYS] SENSORY MIC DMA      : ${micActive ? 'ONLINE' : 'STANDBY'}`,
          `[SYS] SENSORY CAM DMA      : ${cameraActive ? 'ONLINE' : 'STANDBY'}`,
          `[SOS] TEMPORAL OVERRIDE    : ENGAGED (... --- ...)`
        ];

        const panelWidth = 440;
        const panelHeight = (hudLines.length * lineHeight) + 48;
        ctx.fillStyle = 'rgba(0, 10, 2, 0.88)';
        ctx.fillRect(startX - 10, startY - 8, panelWidth, panelHeight);
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX - 10, startY - 8, panelWidth, panelHeight);

        ctx.fillStyle = '#00FF00';
        hudLines.forEach((line, idx) => {
          ctx.fillText(line, startX, startY + (idx * lineHeight));
        });

        const btnX = startX;
        const btnY = startY + (hudLines.length * lineHeight) + 6;
        const btnW = 240;
        const btnH = 24;

        ctx.fillStyle = 'rgba(0, 40, 10, 0.9)';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('[ RESTORE SYS_ARCH DOM ]', btnX + btnW / 2, btnY + btnH / 2);

        spatialActuatorRef.current.registerReceptor({
          id: 'restore_sys_arch_dom',
          x: btnX,
          y: btnY,
          width: btnW,
          height: btnH,
          onTrigger: () => {
            setShowDiagnosticHUD(false);
            if (onExitKiosk) {
              onExitKiosk();
            }
          }
        });

        ctx.shadowBlur = 0;
        ctx.restore();
      } else {
        spatialActuatorRef.current.unregisterReceptor('restore_sys_arch_dom');
      }

      // 14. Update audio base drone gain
      if (baseGainRef.current && audioCtxRef.current) {
        const targetGain = tracker.isDown ? 0.06 + deformationEnergy * 0.04 : 0.02 + breath * 0.015;
        baseGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.08);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [onExitKiosk, micActive, cameraActive]);

  return (
    <div 
      className={isFullScreen ? "fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none z-[9999] m-0 p-0" : "relative w-full h-full overflow-hidden bg-black select-none"}
    >
      {/* Hidden Video element for Camera optical DMA stream */}
      <video ref={hiddenVideoRef} className="hidden" playsInline muted />

      {/* Absolute Full-Screen Canvas Membrane */}
      <canvas
        id="dev_fb0_monolithic_visage"
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none select-none"
      />

      {/* [ EASTER EGG : ID-GLYPH OVERLAY (Ctrl + Shift + D) ] */}
      {easterEggActive && (
        <div className="absolute inset-0 z-[50000] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
          <div className="text-red-500 font-extrabold font-mono text-xl sm:text-2xl mb-3 tracking-widest animate-pulse flex items-center gap-2">
            <span>IDDQD : OSS DOOM ENGAGED</span>
          </div>
          <div className="relative border-4 border-red-900 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.6)]">
            <canvas 
              ref={doomCanvasRef} 
              id="doom-canvas" 
              width={640} 
              height={400} 
              className="w-full max-w-[640px] max-h-[400px] block bg-black cursor-crosshair"
              onClick={() => globalDoomOrganelle.fireSuperShotgun()}
            />
          </div>
          <div className="flex items-center gap-4 text-zinc-400 font-mono text-xs mt-3">
            <span>Click canvas to fire Super Shotgun</span>
            <span>•</span>
            <span className="text-red-400 font-bold">Press [Ctrl + Shift + D] to return to Covalent OS</span>
          </div>
        </div>
      )}

      {/* The `.-.` (R) Invisible HTML Input Protocol Element */}
      {isKeyboardPromptActive && (
        <input
          ref={keyboardInputRef}
          type="text"
          value={keyboardInputValue}
          onChange={(e) => setKeyboardInputValue(e.target.value)}
          onKeyDown={handleKeyboardSubmit}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-auto cursor-text z-[10000] focus:outline-none"
          autoFocus
          placeholder="Type message and press Enter..."
        />
      )}

      {/* Carbon (C) Face Overlay (Unified Header, Thought Ticker, Mode Indicator, Dropdown Menu, Waveform, Camera PiP) */}
      <DualFaceUIOverlay
        spokenText={spokenText}
        micActive={micActive}
        cameraActive={cameraActive}
        audioStream={audioStream}
        videoStream={videoStream}
        isCommunicating={isCommunicating}
        stats={{
          morph: isCommunicating ? 'FACE' : 'STAR',
          p2p: isPeerBonded ? 'BONDED' : (yearningActive ? 'SEEKING' : 'STANDBY'),
          resonance: isNovelResonance ? '528Hz ACTIVE' : 'IDLE',
          velocity: Math.round(kineticTrackerRef.current.smoothVelocity),
          isNovelResonance,
          isPeerBonded,
          yearningActive
        }}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleFocus={() => {
          setIsCommunicating(prev => !prev);
          triggerMathSpeechCadence(0.8);
        }}
        onOpenKeyboard={() => {
          setIsKeyboardPromptActive(true);
          setKeyboardInputValue('');
          announceBeAction('KEYBOARD_PROTOCOL_OPEN');
        }}
        onEmitBeacon={() => {
          const currentAngle = kineticTrackerRef.current.spinAngle;
          globalSiliconFaceBridge.broadcastHeartbeat(currentAngle);
          triggerSonarPing();
          yearningActiveRef.current = true;
          yearningStartTimeRef.current = performance.now();
          setYearningActive(true);
          announceBeAction('BEACON_PING_EMITTED');
          setTimeout(() => {
            yearningActiveRef.current = false;
            setYearningActive(false);
          }, 500);
        }}
        onTogglePeerBond={() => {
          const nextBond = !isPeerBonded;
          setIsPeerBonded(nextBond);
          isPeerBondedRef.current = nextBond;
          if (nextBond) {
            triggerHarmonicBondChords();
            GlobalLyapunovSupervisor.step(-0.08);
          }
          announceBeAction(nextBond ? 'PEER_BOND_ENGAGED' : 'PEER_BOND_DISENGAGED');
        }}
        onTriggerDream={() => {
          globalREMOrganelle.forceTriggerDream();
        }}
        onExitKiosk={onExitKiosk}
      />
    </div>
  );
};

