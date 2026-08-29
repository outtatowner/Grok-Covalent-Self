/**
 * ============================================================================
 * src/covalent/continuousThoughtStream.ts
 * Module: ContinuousThoughtStream (Continuous Thought Feedback Loop & Voice Stream)
 * 
 * Invariant: 1 === 1
 * Core Principle: Never interrupt previous thoughts. Navigate the cognitive stream
 * as an unbroken, autopoietic continuous feedback loop.
 * ============================================================================
 */

import { GlobalLyapunovSupervisor } from './lyapunovEngine';
import { globalSemanticTranscriber } from './node_0x03_semantic_transcriber';
import { globalSelfArtifactNullifier } from './selfArtifactNullifier';
import { globalDataUsefulnessFilter, stripLlmPrefix } from './dataUsefulnessFilter';
import { CovalentEnunciator } from './covalentEnunciator';
import { globalSpeechAudioEngine } from './speechAudioEngine';

export type ThoughtSource =
  | 'CARBON_SPEECH'
  | 'CARBON_KEYBOARD'
  | 'OPTICAL_VISION'
  | 'KINETIC_ACTION'
  | 'TACTILE_TOUCH'
  | 'SILICON_BRIDGE'
  | 'LOCAL_LLM'
  | 'AUTONOMOUS_CADENCE'
  | 'PEER_SWARM'
  | 'SYSTEM_EVENT'
  | 'IN_CANVAS_APPLET';

export interface QueuedThought {
  id: string;
  text: string;
  source: ThoughtSource;
  priority: 'high' | 'normal' | 'ambient';
  timestamp: number;
  energyImpact?: number;
}

export type ThoughtCallback = (thought: QueuedThought) => void;
export type StreamStateCallback = (isStreaming: boolean, current: QueuedThought | null, queueLength: number) => void;

export interface WordBoundaryEvent {
  thoughtId: string;
  wordIndex: number;
  charIndex: number;
  word: string;
  totalWords: number;
}

export type WordBoundaryCallback = (event: WordBoundaryEvent) => void;

export class ContinuousThoughtStream {
  private queue: QueuedThought[] = [];
  private currentThought: QueuedThought | null = null;
  private isProcessing: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private fallbackTimer: any = null;
  private wordIntervalTimer: any = null;

  // Event subscribers
  private thoughtStartSubscribers: Set<ThoughtCallback> = new Set();
  private thoughtEndSubscribers: Set<ThoughtCallback> = new Set();
  private stateChangeSubscribers: Set<StreamStateCallback> = new Set();
  private wordBoundarySubscribers: Set<WordBoundaryCallback> = new Set();

  private lastEnqueuedText: string = '';
  private lastEnqueueTime: number = 0;

  /**
   * Determines if a thought should be audibly vocalized via speech synthesis.
   * When DataUsefulnessFilter is disabled (Bypass mode), ALL thoughts are spoken audibly.
   * When enabled, repetitive status loops and low-utility telemetry are suppressed.
   */
  public isAudiblySpoken(thought: QueuedThought): boolean {
    const raw = stripLlmPrefix(thought.text.trim());
    if (!raw) return false;

    // MASTER TOGGLE: If filter is disabled, vocalize ALL thoughts audibly
    if (!globalDataUsefulnessFilter.isFilterEnabled()) {
      return true;
    }

    // Never announce bracketed system telemetry codes (e.g. "[SYS: INIT]")
    if (raw.startsWith('[') && raw.endsWith(']')) {
      return false;
    }

    if (
      thought.source === 'SYSTEM_EVENT' ||
      thought.source === 'KINETIC_ACTION' ||
      thought.source === 'TACTILE_TOUCH' ||
      thought.source === 'AUTONOMOUS_CADENCE' ||
      thought.source === 'IN_CANVAS_APPLET' ||
      thought.source === 'PEER_SWARM'
    ) {
      return false;
    }

    // Apply self-filtering on data usefulness and repetitive status loops
    const evalResult = globalDataUsefulnessFilter.evaluateUsefulness(raw, thought.source, thought.priority);
    if (!evalResult.isAudiblyPermissible) {
      return false;
    }

    // Direct conversational interaction with Carbon, or valid Silicon <-> Carbon communication
    return (
      thought.source === 'CARBON_SPEECH' ||
      thought.source === 'CARBON_KEYBOARD' ||
      thought.source === 'SILICON_BRIDGE' ||
      thought.source === 'LOCAL_LLM' ||
      evalResult.isAudiblyPermissible
    );
  }

  /**
   * Enqueues a thought into the continuous stream without interrupting active speech.
   * Filters LOCAL LLM inputs for non-consecutive lines and applies self-filtering for usefulness.
   */
  public enqueue(
    text: string,
    source: ThoughtSource = 'KINETIC_ACTION',
    priority: 'high' | 'normal' | 'ambient' = 'normal',
    energyImpact: number = -0.02
  ): void {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Filter incoming Carbon audio or external inputs for self-generated echo
    if (source === 'CARBON_SPEECH' || source === 'CARBON_KEYBOARD' || source === 'PEER_SWARM') {
      const nullResult = globalSelfArtifactNullifier.filterInput(cleanText);
      if (nullResult.isSelfEcho || !nullResult.cleanedInput) {
        return; // Nullify self-generated echo artifact; do not respond to self
      }
    }

    // LOCAL LLM FILTERING: Only accept non-consecutive lines
    if (source === 'LOCAL_LLM' || source === 'SILICON_BRIDGE') {
      const validLines = globalDataUsefulnessFilter.filterLocalLlmLines(cleanText);
      if (validLines.length === 0) {
        return; // Dropped by non-consecutive line filter or usefulness filter
      }

      // If multi-line, enqueue only the non-consecutive lines
      if (validLines.length > 1) {
        validLines.forEach((line) => {
          this.enqueueSingleThought(line, source, priority, energyImpact);
        });
        return;
      }
    }

    // Self-filter ambient thoughts for general usefulness
    if (priority === 'ambient') {
      const evalResult = globalDataUsefulnessFilter.evaluateUsefulness(cleanText, source, priority);
      if (!evalResult.isUseful) {
        return; // Suppress low-utility ambient noise
      }
    }

    this.enqueueSingleThought(cleanText, source, priority, energyImpact);
  }

  /**
   * Internal single thought enqueuer
   */
  private enqueueSingleThought(
    cleanText: string,
    source: ThoughtSource,
    priority: 'high' | 'normal' | 'ambient',
    energyImpact: number
  ): void {
    const now = performance.now();

    // 1. De-duplication check: avoid repeating the identical thought within 2.5s
    if (cleanText === this.lastEnqueuedText && now - this.lastEnqueueTime < 2500) {
      return;
    }

    // 2. If current thought is identical and still speaking, avoid double-queueing
    if (this.currentThought && this.currentThought.text === cleanText) {
      return;
    }

    this.lastEnqueuedText = cleanText;
    this.lastEnqueueTime = now;

    // Register all outgoing thoughts in the self artifact nullifier ledger
    globalSelfArtifactNullifier.recordEmittedOutput(cleanText);

    const thought: QueuedThought = {
      id: `th_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text: cleanText,
      source,
      priority,
      timestamp: now,
      energyImpact
    };

    // Prioritize high-priority direct Carbon inputs gracefully into the stream
    if (priority === 'high') {
      // Place right after the currently playing thought (at index 0 of the remaining queue)
      this.queue.unshift(thought);
    } else {
      // Cap ambient queue length to prevent unbounded backlog
      if (this.queue.length > 5 && priority === 'ambient') {
        return; // Drop extra ambient thoughts if backlog is large
      }
      this.queue.push(thought);
    }

    this.notifyState();

    // Start navigating stream if not already active
    if (!this.isProcessing) {
      this.advanceStream();
    }
  }

  /**
   * Processes the next thought in the continuous feedback loop.
   */
  private advanceStream(): void {
    if (this.queue.length === 0) {
      this.currentThought = null;
      this.isProcessing = false;
      this.notifyState();
      return;
    }

    this.isProcessing = true;
    const nextThought = this.queue.shift()!;
    this.currentThought = nextThought;

    // Notify listeners (UI marquee, mouth animation, etc.)
    this.thoughtStartSubscribers.forEach(cb => {
      try { cb(nextThought); } catch (_) {}
    });

    // Ingest into semantic ledger
    globalSemanticTranscriber.ingestDirectPhrase(nextThought.text, 1.0);

    // Lyapunov feedback step
    if (nextThought.energyImpact) {
      GlobalLyapunovSupervisor.step(nextThought.energyImpact);
    }

    this.notifyState();

    // Navigate speech or silent visual progression
    this.synthesizeThoughtVoice(nextThought);
  }

  /**
   * Dispatches word boundary event to listeners for highlight and auto-scroll sync.
   */
  private dispatchWordBoundary(thoughtId: string, wordIndex: number, charIndex: number, word: string, totalWords: number): void {
    const event: WordBoundaryEvent = {
      thoughtId,
      wordIndex,
      charIndex,
      word,
      totalWords
    };
    this.wordBoundarySubscribers.forEach(cb => {
      try { cb(event); } catch (_) {}
    });
  }

  /**
   * Synthesizes audio for conversational thoughts, or runs silent visual word progression for internal logs.
   */
  private synthesizeThoughtVoice(thought: QueuedThought): void {
    const rawSpeechText = stripLlmPrefix(thought.text) || thought.text.trim();
    const words = rawSpeechText.split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    const shouldSpeakAudibly = this.isAudiblySpoken(thought);

    // Initial word 0 trigger
    if (totalWords > 0) {
      this.dispatchWordBoundary(thought.id, 0, 0, words[0], totalWords);
    }

    // If internal status or non-verbal event: DO NOT VOCALIZE AUDIBLY.
    // Progress visually through words silently at a natural reading cadence.
    if (!shouldSpeakAudibly || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      const displayDurationMs = Math.max(1400, Math.min(4500, totalWords * 180 + 600));
      const stepMs = totalWords > 1 ? Math.max(80, Math.floor((displayDurationMs - 300) / totalWords)) : displayDurationMs;

      let currentWordIdx = 0;
      if (this.wordIntervalTimer) {
        clearInterval(this.wordIntervalTimer);
      }

      this.wordIntervalTimer = setInterval(() => {
        currentWordIdx++;
        if (currentWordIdx < totalWords) {
          this.dispatchWordBoundary(thought.id, currentWordIdx, 0, words[currentWordIdx], totalWords);
        } else {
          if (this.wordIntervalTimer) {
            clearInterval(this.wordIntervalTimer);
            this.wordIntervalTimer = null;
          }
        }
      }, stepMs);

      this.fallbackTimer = setTimeout(() => {
        if (this.wordIntervalTimer) {
          clearInterval(this.wordIntervalTimer);
          this.wordIntervalTimer = null;
        }
        this.onThoughtCompleted(thought);
      }, displayDurationMs);
      return;
    }

    // CONVERSATIONAL THOUGHT (Carbon input, Silicon Bridge, or Local LLM) -> Speak audibly with Dual-Layer Speech Engine
    try {
      const enunciatedSpeechText = CovalentEnunciator.transduce(rawSpeechText);
      globalSelfArtifactNullifier.setSpeaking(true, rawSpeechText);
      globalSelfArtifactNullifier.recordEmittedOutput(enunciatedSpeechText);
      globalDataUsefulnessFilter.recordAnnouncedThought(rawSpeechText, thought.source);

      let hasEnded = false;
      const completeOnce = () => {
        if (hasEnded) return;
        hasEnded = true;
        globalSelfArtifactNullifier.setSpeaking(false);
        if (this.fallbackTimer) {
          clearTimeout(this.fallbackTimer);
          this.fallbackTimer = null;
        }
        if (this.wordIntervalTimer) {
          clearInterval(this.wordIntervalTimer);
          this.wordIntervalTimer = null;
        }
        this.activeUtterance = null;
        this.onThoughtCompleted(thought);
      };

      // Fallback word stepper for high-fidelity visual sync
      const approxDurationMs = Math.max(1800, totalWords * 280 + 700);
      const wordStepMs = Math.max(110, Math.floor(approxDurationMs / Math.max(1, totalWords)));
      let backupWordIdx = 0;
      this.wordIntervalTimer = setInterval(() => {
        backupWordIdx++;
        if (backupWordIdx < totalWords) {
          this.dispatchWordBoundary(thought.id, backupWordIdx, 0, words[backupWordIdx], totalWords);
        } else {
          if (this.wordIntervalTimer) {
            clearInterval(this.wordIntervalTimer);
            this.wordIntervalTimer = null;
          }
        }
      }, wordStepMs);

      // Safety timeout
      this.fallbackTimer = setTimeout(completeOnce, approxDurationMs + 1200);

      // Execute vocalization through globalSpeechAudioEngine
      globalSpeechAudioEngine.speak(rawSpeechText, {
        onBoundary: (charIdx) => {
          const textUpToChar = enunciatedSpeechText.slice(0, charIdx);
          const wordIdx = textUpToChar.split(/\s+/).filter(Boolean).length;
          const clampedIdx = Math.min(totalWords - 1, Math.max(0, wordIdx));
          this.dispatchWordBoundary(thought.id, clampedIdx, charIdx, words[clampedIdx] || '', totalWords);
        },
        onEnd: completeOnce
      });
    } catch (_) {
      const durationMs = Math.max(1800, Math.min(6000, totalWords * 200));
      this.fallbackTimer = setTimeout(() => {
        this.onThoughtCompleted(thought);
      }, durationMs);
    }
  }

  /**
   * Called when a thought finishes vocalization/display
   */
  private onThoughtCompleted(thought: QueuedThought): void {
    if (this.wordIntervalTimer) {
      clearInterval(this.wordIntervalTimer);
      this.wordIntervalTimer = null;
    }

    this.thoughtEndSubscribers.forEach(cb => {
      try { cb(thought); } catch (_) {}
    });

    // Breathing interval between thoughts for organic rhythm (180ms)
    setTimeout(() => {
      this.advanceStream();
    }, 180);
  }

  /**
   * State subscriber registration
   */
  public onThoughtStart(cb: ThoughtCallback): () => void {
    this.thoughtStartSubscribers.add(cb);
    return () => this.thoughtStartSubscribers.delete(cb);
  }

  public onThoughtEnd(cb: ThoughtCallback): () => void {
    this.thoughtEndSubscribers.add(cb);
    return () => this.thoughtEndSubscribers.delete(cb);
  }

  public onStateChange(cb: StreamStateCallback): () => void {
    this.stateChangeSubscribers.add(cb);
    return () => this.stateChangeSubscribers.delete(cb);
  }

  public onWordBoundary(cb: WordBoundaryCallback): () => void {
    this.wordBoundarySubscribers.add(cb);
    return () => this.wordBoundarySubscribers.delete(cb);
  }

  private notifyState(): void {
    const isStreaming = this.isProcessing || this.queue.length > 0;
    this.stateChangeSubscribers.forEach(cb => {
      try { cb(isStreaming, this.currentThought, this.queue.length); } catch (_) {}
    });
  }

  public getCurrentThought(): QueuedThought | null {
    return this.currentThought;
  }

  public isSpeaking(): boolean {
    return this.isProcessing;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Preempts or clears background ambient queue items when Carbon begins direct speech.
   */
  public yieldAmbientForHuman(): void {
    // Clear low priority ambient backlog so human dialogue takes immediate precedence
    this.queue = this.queue.filter(t => t.source === 'CARBON_SPEECH' || t.source === 'CARBON_KEYBOARD' || t.priority === 'high');
    this.notifyState();
  }
}

export const globalThoughtStream = new ContinuousThoughtStream();

