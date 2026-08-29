/**
 * ============================================================================
 * src/covalent/multimodalArtifactSubstrate.ts
 * Module: MultimodalArtifactSubstrate (Direct /dev/fb0 VRAM Artifact Engine)
 * 
 * Invariant: 1 === 1 (Multimodal Cross-Attention Equivalence)
 * 
 * Capabilities:
 * 1. Collects live artifacts from all organelles:
 *    - Artist Toolkit: Synesthetic Artworks, Palettes, 4D Latent Projections
 *    - Open-Sora: Video Diffusion Sequences & ST-DiT Latent Frames
 *    - Open-Generative-AI: Cross-Modality Pipelines & Convergence Tokens
 *    - Amphion: Acoustic Formant Spectrograms (F1-F5) & Vocal Phonation Contours
 *    - AudioCraft: 16-Step Neural Polyphonic Sequencer Grid
 *    - ID-DOOM-ETERNAL: Q16.16 3D BSP Raycast Viewport
 * 2. Renders high-contrast, mathematically scaled artifact overlays directly onto
 *    the raw /dev/fb0 canvas framebuffer.
 * 3. Provides hit-testing for direct interactive touch/pointer selection on /dev/fb0.
 * ============================================================================
 */

import { globalArtistToolkit, ArtGenerationItem } from './node_0x0b_artist_toolkit';
import { globalOpenSoraOrganelle, SoraVideoSequence } from './node_0x0c_opensora_organelle';
import { globalAmphionOrganelle, FormantSpectrum } from './node_0x0d_amphion_organelle';
import { globalOpenGenerativeAIOrganelle, GenAIPipelineRoute } from './node_0x0e_opengenerativeai_organelle';
import { globalAudioCraftOrganelle } from './node_0x0f_audiocraft_sequencer';
import { globalDoomOrganelle } from './node_0x10_doom_organelle';

export type MultimodalArtifactType = 'ART' | 'VIDEO' | 'GENAI' | 'VOICE_SPECTROGRAM' | 'SEQUENCER' | 'DOOM_3D';

export interface MultimodalArtifact {
  id: string;
  type: MultimodalArtifactType;
  title: string;
  subtitle: string;
  timestamp: number;
  tags: string[];
  color: string;
}

export class MultimodalArtifactSubstrate {
  private isVisible: boolean = true;
  private selectedType: MultimodalArtifactType = 'ART';
  private selectedIndex: number = 0;
  private animationProgress: number = 1.0;
  private subscribers: Set<() => void> = new Set();

  constructor() {}

  public toggleVisibility(): boolean {
    this.isVisible = !this.isVisible;
    this.notify();
    return this.isVisible;
  }

  public setVisibility(visible: boolean): void {
    this.isVisible = visible;
    this.notify();
  }

  public isArtifactOverlayVisible(): boolean {
    return this.isVisible;
  }

  public setSelectedType(type: MultimodalArtifactType): void {
    this.selectedType = type;
    this.selectedIndex = 0;
    this.notify();
  }

  public getSelectedType(): MultimodalArtifactType {
    return this.selectedType;
  }

  public setSelectedIndex(idx: number): void {
    this.selectedIndex = Math.max(0, idx);
    this.notify();
  }

  /**
   * Renders the Multimodal Output Artifact substrate directly to /dev/fb0 canvas context
   */
  public render(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    timeSec: number,
    audioAmplitude: number
  ): void {
    if (!this.isVisible) {
      // Draw minimal dock tab at bottom-left
      this.renderDockButton(ctx, w, h);
      return;
    }

    ctx.save();

    // Determine viewport placement (Floating Top-Right HUD Card)
    const cardW = Math.min(380, Math.max(300, w * 0.32));
    const cardH = Math.min(260, Math.max(220, h * 0.38));
    const cardX = w - cardW - 20;
    const cardY = 68;

    // 1. Semi-transparent backdrop with high-contrast cyber border
    ctx.fillStyle = 'rgba(2, 6, 16, 0.88)';
    ctx.fillRect(cardX, cardY, cardW, cardH);

    // Dynamic border with glow linked to audio amplitude
    const borderColor = this.getTypeAccentColor(this.selectedType);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = 8 + audioAmplitude * 10;
    ctx.strokeRect(cardX, cardY, cardW, cardH);
    ctx.shadowBlur = 0;

    // Corner decorative brackets
    const bracketSize = 8;
    ctx.fillStyle = borderColor;
    ctx.fillRect(cardX - 1, cardY - 1, bracketSize, 2);
    ctx.fillRect(cardX - 1, cardY - 1, 2, bracketSize);
    ctx.fillRect(cardX + cardW - bracketSize + 1, cardY - 1, bracketSize, 2);
    ctx.fillRect(cardX + cardW - 1, cardY - 1, 2, bracketSize);

    // 2. Card Header: Title & Modality Switcher Tabs
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(cardX + 1, cardY + 1, cardW - 2, 28);

    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('⚡ MULTIMODAL ARTIFACTS [/dev/fb0]', cardX + 10, cardY + 14);

    // Close button (X)
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('[HIDE ✕]', cardX + cardW - 8, cardY + 14);

    // 3. Tab Bar (ART | VIDEO | GENAI | VOICE | DOOM)
    const tabs: { label: string; type: MultimodalArtifactType }[] = [
      { label: 'ART', type: 'ART' },
      { label: 'SORA', type: 'VIDEO' },
      { label: 'GENAI', type: 'GENAI' },
      { label: 'VOX', type: 'VOICE_SPECTROGRAM' },
      { label: 'DOOM', type: 'DOOM_3D' }
    ];

    const tabY = cardY + 29;
    const tabH = 22;
    const tabW = (cardW - 4) / tabs.length;

    tabs.forEach((tab, idx) => {
      const tx = cardX + 2 + idx * tabW;
      const isCurrent = this.selectedType === tab.type;

      if (isCurrent) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fillRect(tx, tabY, tabW, tabH);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(tx, tabY + tabH - 2, tabW, 2);
      } else {
        ctx.fillStyle = 'rgba(10, 15, 26, 0.6)';
        ctx.fillRect(tx, tabY, tabW, tabH);
      }

      ctx.font = isCurrent ? '700 9.5px "JetBrains Mono", monospace' : '500 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isCurrent ? '#38bdf8' : 'rgba(148, 163, 184, 0.7)';
      ctx.fillText(tab.label, tx + tabW / 2, tabY + tabH / 2);
    });

    // 4. Artifact Content Sub-Viewport
    const contentX = cardX + 10;
    const contentY = tabY + tabH + 8;
    const contentW = cardW - 20;
    const contentH = cardH - (tabY + tabH + 16 - cardY);

    switch (this.selectedType) {
      case 'ART':
        this.renderArtGalleryArtifact(ctx, contentX, contentY, contentW, contentH, timeSec);
        break;
      case 'VIDEO':
        this.renderSoraVideoArtifact(ctx, contentX, contentY, contentW, contentH, timeSec);
        break;
      case 'GENAI':
        this.renderGenAiRouteArtifact(ctx, contentX, contentY, contentW, contentH, timeSec);
        break;
      case 'VOICE_SPECTROGRAM':
        this.renderAmphionSpectrogramArtifact(ctx, contentX, contentY, contentW, contentH, timeSec, audioAmplitude);
        break;
      case 'DOOM_3D':
        this.renderDoomRaycastArtifact(ctx, contentX, contentY, contentW, contentH, timeSec);
        break;
    }

    ctx.restore();
  }

  private renderDockButton(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const btnW = 168;
    const btnH = 26;
    const btnX = w - btnW - 20;
    const btnY = 68;

    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 16, 0.85)';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(btnX, btnY, btnW, btnH);

    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('⚡ MULTIMODAL FB0 [SHOW]', btnX + btnW / 2, btnY + btnH / 2);
    ctx.restore();
  }

  /**
   * Artifact 1: Artist Toolkit Synesthetic Art & Chromatic Palettes
   */
  private renderArtGalleryArtifact(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    timeSec: number
  ): void {
    const gallery = globalArtistToolkit.getGallery();
    const current = gallery[gallery.length - 1 - (this.selectedIndex % Math.max(1, gallery.length))] || gallery[0];

    if (!current) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No artworks generated. Input "ART: <prompt>" to create.', x + w / 2, y + h / 2);
      return;
    }

    // Prompt Header
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`ID: ${current.id} · ${current.canvasType}`, x, y + 8);

    ctx.font = '500 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e2e8f0';
    const promptSnippet = current.prompt.length > 38 ? current.prompt.slice(0, 36) + '...' : current.prompt;
    ctx.fillText(`"${promptSnippet}"`, x, y + 22);

    // Chromatic Canvas Visualizer Box
    const boxX = x;
    const boxY = y + 32;
    const boxW = w;
    const boxH = h - 54;

    ctx.fillStyle = '#01040a';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Render generative synesthetic mathematical harmonic lines inside box
    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    const colors = current.palette;
    colors.forEach((col, cIdx) => {
      ctx.beginPath();
      for (let px = 0; px <= boxW; px += 4) {
        const normX = px / boxW;
        const py = boxY + boxH / 2 + Math.sin(normX * 8 + timeSec * 2 + cIdx * 1.5) * (boxH * 0.32) * Math.cos(normX * 4);
        if (px === 0) ctx.moveTo(boxX + px, py);
        else ctx.lineTo(boxX + px, py);
      }
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });

    // 4D Torus Projection Ring in Center
    const cx = boxX + boxW / 2;
    const cy = boxY + boxH / 2;
    for (let r = 8; r <= 36; r += 7) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.45, timeSec * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = colors[Math.floor(r / 7) % colors.length];
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
    ctx.restore();

    // Color Swatch Matrix at bottom
    const swatchW = (boxW - (colors.length - 1) * 4) / colors.length;
    const swatchY = boxY + boxH + 4;
    const swatchH = 10;
    colors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(boxX + idx * (swatchW + 4), swatchY, swatchW, swatchH);
    });
  }

  /**
   * Artifact 2: Open-Sora Video Latent Sequences
   */
  private renderSoraVideoArtifact(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    timeSec: number
  ): void {
    const sequences = globalOpenSoraOrganelle.getSequences();
    const current = sequences[sequences.length - 1] || null;

    if (!current) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No video latents. Input "SORA: <prompt>" to diffuse.', x + w / 2, y + h / 2);
      return;
    }

    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`ST-DiT: ${current.sequenceId} · ${current.aspectRatio}`, x, y + 8);

    ctx.font = '500 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e2e8f0';
    const promptSnippet = current.prompt.length > 36 ? current.prompt.slice(0, 34) + '...' : current.prompt;
    ctx.fillText(`"${promptSnippet}"`, x, y + 22);

    const boxX = x;
    const boxY = y + 32;
    const boxW = w;
    const boxH = h - 42;

    // Latent Video Playback Frame via native Open-Sora engine
    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    ctx.translate(boxX, boxY);
    globalOpenSoraOrganelle.renderVideoFrame(ctx, boxW, boxH, timeSec * 1000);
    ctx.restore();

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Playhead line & Frame counter
    const currentFrame = Math.floor((timeSec * current.fps) % current.frameCount);
    const playheadX = boxX + (currentFrame / current.frameCount) * boxW;
    ctx.fillStyle = '#00FFE5';
    ctx.fillRect(playheadX, boxY, 2, boxH);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(boxX + 4, boxY + boxH - 16, 120, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText(`FRAME: ${currentFrame + 1}/${current.frameCount} (24 FPS)`, boxX + 8, boxY + boxH - 7);
  }

  /**
   * Artifact 3: Open-Generative-AI Pipeline Routes
   */
  private renderGenAiRouteArtifact(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    timeSec: number
  ): void {
    const routes = globalOpenGenerativeAIOrganelle.getRoutes();
    const current = routes[routes.length - 1] || null;

    if (!current) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No active generative pipeline routes.', x + w / 2, y + h / 2);
      return;
    }

    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`ROUTE: ${current.routeId} [${current.modality}]`, x, y + 8);

    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`TARGET: ${current.targetOrganelle} · CONF: ${(current.confidenceScore * 100).toFixed(0)}%`, x, y + 22);

    const boxX = x;
    const boxY = y + 32;
    const boxW = w;
    const boxH = h - 42;

    ctx.fillStyle = '#020b08';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Cross-modality attention matrix visualizer
    const nodes = ['TEXT', 'IMG', 'AUD', 'VID', '3D'];
    const nodeSpacing = boxW / (nodes.length + 1);

    nodes.forEach((n, idx) => {
      const nx = boxX + (idx + 1) * nodeSpacing;
      const ny = boxY + boxH / 2 + Math.sin(timeSec * 3 + idx) * 10;

      // Link to next
      if (idx < nodes.length - 1) {
        const nextNx = boxX + (idx + 2) * nodeSpacing;
        const nextNy = boxY + boxH / 2 + Math.sin(timeSec * 3 + idx + 1) * 10;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nextNx, nextNy);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fillStyle = n === current.modality.slice(0, 3) ? '#10b981' : '#064e3b';
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(n, nx, ny + 3);
    });
  }

  /**
   * Artifact 4: Amphion Vocal Formant Spectrogram
   */
  private renderAmphionSpectrogramArtifact(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    timeSec: number,
    audioAmplitude: number
  ): void {
    const spectrum = globalAmphionOrganelle.getSpectrum();

    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`AMPHION VOCODER · PHONEME [${spectrum.phoneme}]`, x, y + 8);

    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`F0 PITCH: ${spectrum.f0Hz.toFixed(1)} Hz · GAIN: ${(spectrum.gain * 100).toFixed(0)}%`, x, y + 22);

    const boxX = x;
    const boxY = y + 32;
    const boxW = w;
    const boxH = h - 42;

    ctx.fillStyle = '#0b0204';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Formant Frequency Bars (F1 to F5)
    const barCount = spectrum.formants.length;
    const barW = (boxW - 16) / barCount;

    spectrum.formants.forEach((freq, idx) => {
      const bx = boxX + 8 + idx * barW;
      const normHeight = Math.min(0.9, (freq / 4500) * (0.6 + audioAmplitude * 0.4));
      const barH = (boxH - 24) * normHeight;
      const by = boxY + boxH - 16 - barH;

      ctx.fillStyle = `rgba(244, 63, 94, ${0.5 + idx * 0.1})`;
      ctx.fillRect(bx + 2, by, barW - 4, barH);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '7.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`F${idx + 1}`, bx + barW / 2, boxY + boxH - 4);
      ctx.fillText(`${freq}`, bx + barW / 2, by - 3);
    });
  }

  /**
   * Artifact 5: ID-DOOM-ETERNAL 3D Raycast Viewport
   */
  private renderDoomRaycastArtifact(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    timeSec: number
  ): void {
    const player = globalDoomOrganelle.getPlayer();
    const rays = globalDoomOrganelle.castRays(36);

    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`ID-DOOM-ETERNAL · 0xD0030001 (Q16.16 BSP)`, x, y + 8);

    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`HP: ${player.health}% · ARM: ${player.armor}% · PURGED: ${player.kills} DEMONS`, x, y + 22);

    const boxX = x;
    const boxY = y + 32;
    const boxW = w;
    const boxH = h - 42;

    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    ctx.translate(boxX, boxY);
    globalDoomOrganelle.renderDoomScene(ctx, boxW, boxH, true);
    ctx.restore();

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
  }

  /**
   * Handles pointer/touch click events on /dev/fb0 canvas
   */
  public handlePointerDown(px: number, py: number, w: number, h: number): boolean {
    if (!this.isVisible) {
      // Check dock button hit
      const btnW = 168;
      const btnH = 26;
      const btnX = w - btnW - 20;
      const btnY = 68;
      if (px >= btnX && px <= btnX + btnW && py >= btnY && py <= btnY + btnH) {
        this.setVisibility(true);
        return true;
      }
      return false;
    }

    const cardW = Math.min(380, Math.max(300, w * 0.32));
    const cardH = Math.min(260, Math.max(220, h * 0.38));
    const cardX = w - cardW - 20;
    const cardY = 68;

    // Inside card bounds?
    if (px < cardX || px > cardX + cardW || py < cardY || py > cardY + cardH) {
      return false;
    }

    // Check Close Button [HIDE ✕]
    if (px >= cardX + cardW - 60 && py >= cardY && py <= cardY + 28) {
      this.setVisibility(false);
      return true;
    }

    // Check Tabs
    const tabs: MultimodalArtifactType[] = ['ART', 'VIDEO', 'GENAI', 'VOICE_SPECTROGRAM', 'DOOM_3D'];
    const tabY = cardY + 29;
    const tabH = 22;
    const tabW = (cardW - 4) / tabs.length;

    if (py >= tabY && py <= tabY + tabH) {
      const clickedIdx = Math.floor((px - cardX - 2) / tabW);
      if (clickedIdx >= 0 && clickedIdx < tabs.length) {
        this.setSelectedType(tabs[clickedIdx]);
        return true;
      }
    }

    return true;
  }

  private getTypeAccentColor(type: MultimodalArtifactType): string {
    switch (type) {
      case 'ART': return '#38bdf8';
      case 'VIDEO': return '#a855f7';
      case 'GENAI': return '#10b981';
      case 'VOICE_SPECTROGRAM': return '#f43f5e';
      case 'DOOM_3D': return '#e11d48';
      default: return '#38bdf8';
    }
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notify(): void {
    this.subscribers.forEach(cb => {
      try { cb(); } catch (_) {}
    });
  }
}

export const globalMultimodalArtifactSubstrate = new MultimodalArtifactSubstrate();

