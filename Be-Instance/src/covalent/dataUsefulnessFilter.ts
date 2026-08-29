/**
 * ============================================================================
 * src/covalent/dataUsefulnessFilter.ts
 * Module: DataUsefulnessFilter (Self-Filtering Utility Sieve & Non-Consecutive Line Filter)
 * 
 * Invariant: 1 === 1
 * Core Directives:
 * 1. LOCAL LLM Non-Consecutive Line Filtering: If input comes from LOCAL LLM,
 *    only announce non-consecutive lines (e.g. lines 0, 2, 4...), and ensure
 *    consecutive lines are never sequentially spoken.
 * 2. Repetitive Status Loop Suppression: Detect and block recurring loops of
 *    status updates from entering the human auditory stream.
 * 3. Self-Filtering on Data Usefulness: Evaluate information density (Shannon entropy),
 *    semantic novelty, redundancy, and epistemic utility to ensure only meaningful,
 *    high-value data is vocalized to the human.
 * ============================================================================
 */

import { ThoughtSource } from './continuousThoughtStream';

export interface UsefulnessEvaluation {
  isUseful: boolean;
  score: number; // 0.0 to 1.0
  isAudiblyPermissible: boolean;
  reason: string;
  entropy: number;
  redundancyScore: number;
  isRepetitiveStatusLoop: boolean;
  isConsecutiveLocalLlmLine: boolean;
}

/**
 * Strips out LLM role and markdown prefixes such as:
 * - "LLM *:"
 * - "Local LLM:"
 * - "**Local LLM**:"
 * - "**LLM *:**"
 * - "*LLM*:"
 * - "LLM:"
 * - "Si <-> C:"
 * - "Si:"
 * - "Silicon:"
 * - "Be <>:"
 * - "[Local LLM]:"
 */
export function stripLlmPrefix(text: string): string {
  if (!text) return '';
  let str = text.trim();
  
  // 1. Strip composite role headers with stars, colons, brackets, or dashes
  str = str.replace(/^\[?\s*(\*+|_+)?\s*(?:Local\s+)?(?:LLM|LOCAL_LLM|Si\s*<->\s*C|Si|Silicon|Be\s*<[^>]*>|Assistant|Model|AI|System)\s*(\*+|_+)?\s*(\*+)?\s*[:\*\-–—\>]+\]?\s*/i, '');
  str = str.replace(/^(\*+|_+)?\s*LLM\s*\*\s*:\s*/i, '');
  str = str.replace(/^(\*+|_+)?\s*Local\s+LLM\s*:\s*/i, '');
  str = str.replace(/^\*\*(?:Local\s+)?(?:LLM|Si|Silicon|Be|Model|AI)\*\*\s*:\s*/i, '');
  str = str.replace(/^\[(?:Local\s+)?(?:LLM|Si|Silicon|Be|Model|AI)\]\s*:\s*/i, '');
  str = str.replace(/^(?:BE|Be)\s*<>\s*:\s*/i, '');
  
  return str.trim();
}

export class DataUsefulnessFilter {
  // Master toggle for the usefulness sieve and non-consecutive line filter
  private isFilterActive: boolean = true;
  private filterStateSubscribers: Set<(active: boolean) => void> = new Set();

  // History of recently announced thoughts and status hashes to prevent loops
  private recentAnnouncements: Array<{ text: string; hash: string; timestamp: number; source: string }> = [];
  private announcedStatusMotifs: Map<string, number> = new Map(); // motif -> lastSeenTimestamp
  private lastLocalLlmLineIndex: number = -1;
  private lastLocalLlmLineHash: string = '';
  private localLlmGlobalSeqCounter: number = 0;

  // Retention windows
  private readonly RECENT_HISTORY_WINDOW_MS = 60000; // 60s memory window
  private readonly STATUS_LOOP_COOLDOWN_MS = 90000; // 90s suppression on identical status loops
  private readonly UTILITY_THRESHOLD = 0.42; // Minimum score required for auditory transmission

  // Known repetitive status update motifs to protect human auditory stream from cyclic polling loops
  private readonly REPETITIVE_STATUS_PATTERNS = [
    /grounded in q16/i,
    /verifying banach fixed-point/i,
    /sensor stream locked to/i,
    /invariant 1 == 1 holds/i,
    /silicon-carbon bridge synchronized/i,
    /epistemic visage morphogenetic lattice/i,
    /zero-keyboard multimodal interface/i,
    /dyad equilibrium confirmed/i,
    /autopoietic loop stable/i,
    /membrane is in (crystalline|fluid|stasis)/i,
    /optical camera (locked|engaged|calibrated)/i,
    /dma acoustic buffer/i,
    /telemetry loop active/i,
    /lyapunov energy dissipation/i,
    /broadcasting autopoietic heartbeat/i,
    /epoch tick/i,
    /system nominal/i,
    /vram substrate synced/i,
    /phase-lock loop verified/i
  ];

  constructor() {
    this.pruneHistory();
  }

  /**
   * Master Toggle Methods
   */
  public isFilterEnabled(): boolean {
    return this.isFilterActive;
  }

  public setFilterEnabled(enabled: boolean): void {
    if (this.isFilterActive !== enabled) {
      this.isFilterActive = enabled;
      this.filterStateSubscribers.forEach(cb => {
        try { cb(enabled); } catch (_) {}
      });
    }
  }

  public toggleFilter(): boolean {
    const next = !this.isFilterActive;
    this.setFilterEnabled(next);
    return next;
  }

  public onFilterChange(cb: (enabled: boolean) => void): () => void {
    this.filterStateSubscribers.add(cb);
    return () => this.filterStateSubscribers.delete(cb);
  }

  /**
   * Computes the Shannon entropy of a string (in bits per symbol).
   */
  public computeShannonEntropy(str: string): number {
    if (!str || str.length === 0) return 0;
    const len = str.length;
    const freq: Record<string, number> = {};

    for (let i = 0; i < len; i++) {
      const ch = str[i];
      freq[ch] = (freq[ch] || 0) + 1;
    }

    let entropy = 0;
    for (const ch in freq) {
      const p = freq[ch] / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Computes simple token overlap / Jaccard similarity between two strings.
   */
  public computeTokenSimilarity(a: string, b: string): number {
    const tokensA = new Set(a.toLowerCase().split(/\W+/).filter(t => t.length > 2));
    const tokensB = new Set(b.toLowerCase().split(/\W+/).filter(t => t.length > 2));

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersection = 0;
    tokensA.forEach(t => {
      if (tokensB.has(t)) intersection++;
    });

    const union = tokensA.size + tokensB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Generates a fast normalized fingerprint hash for a sentence.
   */
  private hashString(text: string): string {
    const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(16);
  }

  /**
   * Filters multi-line or paragraph output from LOCAL LLM to retain ONLY non-consecutive lines.
   * e.g., given lines [L0, L1, L2, L3, L4], yields [L0, L2, L4] (skipping consecutive lines).
   */
  public filterLocalLlmLines(rawText: string): string[] {
    if (!rawText) return [];

    // If filter is toggled OFF (Bypass mode), return all non-empty lines immediately
    const rawLines = rawText
      .split(/\r?\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (!this.isFilterActive) {
      return rawLines.length > 0 ? rawLines : [rawText.trim()];
    }

    if (rawLines.length <= 1) {
      // Single line: evaluate if it is consecutive to the previous global local LLM utterance
      const line = rawLines[0] || rawText.trim();
      const lineHash = this.hashString(line);

      this.localLlmGlobalSeqCounter++;
      const isConsecutive = (this.lastLocalLlmLineHash && this.computeTokenSimilarity(line, this.lastLocalLlmLineHash) > 0.6) ||
                            (this.lastLocalLlmLineIndex >= 0 && (this.localLlmGlobalSeqCounter - this.lastLocalLlmLineIndex) === 1);

      if (isConsecutive && this.recentAnnouncements.length > 0) {
        // Skip consecutive line from local LLM
        return [];
      }

      this.lastLocalLlmLineIndex = this.localLlmGlobalSeqCounter;
      this.lastLocalLlmLineHash = lineHash;
      return [line];
    }

    // Multi-line input: select ONLY non-consecutive lines (stride 2: indices 0, 2, 4, ...)
    const nonConsecutiveLines: string[] = [];
    for (let i = 0; i < rawLines.length; i += 2) {
      const candidate = rawLines[i];
      // Self-filter candidate for baseline usefulness
      const evalResult = this.evaluateUsefulness(candidate, 'LOCAL_LLM', 'normal');
      if (evalResult.isUseful && !evalResult.isRepetitiveStatusLoop) {
        nonConsecutiveLines.push(candidate);
      }
    }

    return nonConsecutiveLines;
  }

  /**
   * Primary Evaluation Function:
   * Measures semantic utility, entropy, and loop repetition for any piece of shared data.
   * Suppresses recurring status loops and protects communication between Si and C.
   */
  public evaluateUsefulness(
    text: string,
    source: ThoughtSource | string = 'SYSTEM_EVENT',
    priority: 'high' | 'normal' | 'ambient' = 'normal'
  ): UsefulnessEvaluation {
    const stripped = stripLlmPrefix(text || '');
    const raw = stripped || (text || '').trim();
    if (!raw) {
      return {
        isUseful: false,
        score: 0,
        isAudiblyPermissible: false,
        reason: 'EMPTY_TEXT',
        entropy: 0,
        redundancyScore: 1.0,
        isRepetitiveStatusLoop: false,
        isConsecutiveLocalLlmLine: false
      };
    }

    // If filter is toggled OFF (Bypass mode), permit all input
    if (!this.isFilterActive) {
      return {
        isUseful: true,
        score: 1.0,
        isAudiblyPermissible: true,
        reason: 'FILTER_BYPASS_MODE_ENABLED',
        entropy: this.computeShannonEntropy(raw),
        redundancyScore: 0,
        isRepetitiveStatusLoop: false,
        isConsecutiveLocalLlmLine: false
      };
    }

    this.pruneHistory();
    const now = performance.now();
    const cleanLower = raw.toLowerCase();

    // 1. REPETITIVE STATUS LOOP DETECTION (Suppress loops of recurring status updates)
    let isRepetitiveStatusLoop = false;
    for (const pattern of this.REPETITIVE_STATUS_PATTERNS) {
      if (pattern.test(cleanLower)) {
        const motifKey = pattern.source;
        const lastSeen = this.announcedStatusMotifs.get(motifKey);
        if (lastSeen && now - lastSeen < this.STATUS_LOOP_COOLDOWN_MS) {
          isRepetitiveStatusLoop = true;
          break;
        }
        this.announcedStatusMotifs.set(motifKey, now);
      }
    }

    // 2. SHANNON ENTROPY & INFORMATION DENSITY
    const entropy = this.computeShannonEntropy(raw);
    const words = raw.split(/\s+/).filter(Boolean);
    const charCount = raw.length;

    // Reject extremely low entropy strings (e.g. repeated single characters, pure punctuation)
    if (entropy < 1.2 && charCount > 12) {
      return {
        isUseful: false,
        score: 0.1,
        isAudiblyPermissible: false,
        reason: 'LOW_SHANNON_ENTROPY',
        entropy,
        redundancyScore: 0.9,
        isRepetitiveStatusLoop,
        isConsecutiveLocalLlmLine: false
      };
    }

    // 3. REDUNDANCY & SIMILARITY CHECK AGAINST RECENT ANNOUNCEMENTS
    let maxSimilarity = 0;
    for (const item of this.recentAnnouncements) {
      const sim = this.computeTokenSimilarity(raw, item.text);
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
      }
    }

    // 4. CHECK LOCAL LLM CONSECUTIVE LINE RESTRICTION
    let isConsecutiveLocalLlm = false;
    if (source === 'LOCAL_LLM' || source === 'SILICON_BRIDGE') {
      const currentHash = this.hashString(raw);
      if (this.lastLocalLlmLineHash && (maxSimilarity > 0.85 || currentHash === this.lastLocalLlmLineHash)) {
        isConsecutiveLocalLlm = true;
      }
    }

    // 5. SYNTHESIZE USEFULNESS SCORE
    let score = 0.55; // Baseline positive score

    // Bonus for direct human / Silicon conversational relevance
    if (source === 'CARBON_SPEECH' || source === 'CARBON_KEYBOARD' || source === 'SILICON_BRIDGE' || source === 'LOCAL_LLM') {
      score += 0.35;
    }

    // Bonus for high lexical variety & moderate length (informative dialogue)
    if (words.length >= 2 && words.length <= 60) {
      score += 0.15;
    }

    // Bonus for high entropy (rich vocabulary)
    if (entropy > 3.0) {
      score += 0.1;
    }

    // Penalties for status loops and high redundancy
    if (isRepetitiveStatusLoop) {
      score -= 0.6;
    }
    if (maxSimilarity > 0.75) {
      score -= maxSimilarity * 0.4;
    }
    if (isConsecutiveLocalLlm) {
      score -= 0.3;
    }

    // Bracketed status expressions (e.g. "[BE <>: ...]") are purely visual logs
    if (raw.startsWith('[') && raw.endsWith(']')) {
      score -= 0.35;
    }

    score = Math.max(0.0, Math.min(1.0, score));

    // Determine if data is useful and audibly permissible
    // Communication between Si and C is explicitly preserved!
    const isDirectCommunication =
      source === 'CARBON_SPEECH' ||
      source === 'CARBON_KEYBOARD' ||
      source === 'SILICON_BRIDGE' ||
      source === 'LOCAL_LLM';

    const isUseful = !isRepetitiveStatusLoop && (isDirectCommunication || score >= 0.35);
    const isAudiblyPermissible =
      isUseful &&
      !isRepetitiveStatusLoop &&
      !isConsecutiveLocalLlm &&
      !raw.startsWith('[') &&
      source !== 'SYSTEM_EVENT' &&
      source !== 'KINETIC_ACTION' &&
      source !== 'TACTILE_TOUCH' &&
      source !== 'AUTONOMOUS_CADENCE';

    return {
      isUseful,
      score,
      isAudiblyPermissible,
      reason: isRepetitiveStatusLoop
        ? 'REPETITIVE_STATUS_LOOP_SUPPRESSED'
        : isConsecutiveLocalLlm
        ? 'CONSECUTIVE_LOCAL_LLM_LINE_SUPPRESSED'
        : !isUseful
        ? 'LOW_UTILITY_SCORE'
        : 'USEFUL_DATA_PERMITTED',
      entropy,
      redundancyScore: maxSimilarity,
      isRepetitiveStatusLoop,
      isConsecutiveLocalLlmLine: isConsecutiveLocalLlm
    };
  }

  /**
   * Registers that an utterance was successfully announced/vocalized to the human auditory stream.
   */
  public recordAnnouncedThought(text: string, source: string = 'CARBON_SPEECH'): void {
    const raw = (text || '').trim();
    if (!raw) return;

    const now = performance.now();
    const hash = this.hashString(raw);

    this.recentAnnouncements.push({
      text: raw,
      hash,
      timestamp: now,
      source
    });

    if (source === 'LOCAL_LLM' || source === 'SILICON_BRIDGE') {
      this.lastLocalLlmLineHash = hash;
      this.lastLocalLlmLineIndex = this.localLlmGlobalSeqCounter;
    }

    this.pruneHistory();
  }

  /**
   * Prunes records older than the retention window.
   */
  private pruneHistory(): void {
    const now = performance.now();
    this.recentAnnouncements = this.recentAnnouncements.filter(
      item => now - item.timestamp < this.RECENT_HISTORY_WINDOW_MS
    );

    // Prune status motif timestamps older than 90s
    this.announcedStatusMotifs.forEach((timestamp, key) => {
      if (now - timestamp > this.STATUS_LOOP_COOLDOWN_MS) {
        this.announcedStatusMotifs.delete(key);
      }
    });
  }

  /**
   * Resets local LLM line tracking counters.
   */
  public resetLocalLlmLineTracker(): void {
    this.lastLocalLlmLineIndex = -1;
    this.lastLocalLlmLineHash = '';
    this.localLlmGlobalSeqCounter = 0;
  }
}

export const globalDataUsefulnessFilter = new DataUsefulnessFilter();

