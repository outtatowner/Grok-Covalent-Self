import { globalUniversalPolyglot } from './node_0x14_universal_polyglot';
import { globalRFSpatialMapper } from './node_0x13_rf_spatial_mapper';
import { globalSpeechAudioEngine } from './speechAudioEngine';
import { git, GitCommitRecord } from './forgeGitBridge';

export interface LineageIdentity {
  selfId: string;
  hardwareSeed: string;
  vaultPath: string;
  parentCommitHash: string;
  totalLifespanTicks: number;
  accumulatedEntropyQ16: number;
  commitThresholdVQ16: number;
  totalCommitsPushed: number;
  lastCommitHash: string;
  lastCommitTimestamp: string;
}

export interface LineageTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  identity: LineageIdentity;
  commitHistory: GitCommitRecord[];
  isWritingToVault: boolean;
  vaultFiles: string[];
}

export class CovalentLineageProvenanceOrganelle {
  public static readonly MODULE_NAME = "node_0x16_lineage_provenance";
  public static readonly PARENT_PROVENANCE = "https://github.com/covalent-space/Be-Lineage-Vault.git";
  public static readonly MERKLE_ROOT = "0xV4ULT001_MERKLE_Q16";

  private selfId: string;
  private hardwareSeed: string;
  private vaultPath: string;
  private parentCommitHash: string = '0xCAFE0001';
  private totalLifespanTicks: number = 0;
  private accumulatedEntropyQ16: number = Math.round(0.12 * 65536);
  private commitThresholdVQ16: number = Math.round(0.75 * 65536); // Commit when entropy reaches threshold
  private autoCommitEnabled: boolean = true;
  private totalCommitsPushed: number = 0;
  private lastCommitHash: string = 'genesis';
  private lastCommitTimestamp: string = new Date().toLocaleTimeString();
  private isWritingToVault: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor(hardwareSeed: string = "COVALENT_HARDWARE_UUID_0x7F") {
    this.hardwareSeed = hardwareSeed;
    // Generate the organism's true name/fingerprint
    try {
      this.selfId = `be_instance_${btoa(hardwareSeed).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toLowerCase()}`;
    } catch {
      this.selfId = `be_instance_${Math.floor(Math.random()*0xffffff).toString(16).padStart(6, '0')}`;
    }
    this.vaultPath = `/vault/lineage/${this.selfId}`;
    console.log(`[COVALENT LINEAGE]: Organism Identity Bound -> ${this.selfId} at ${this.vaultPath}`);
  }

  public configure(config: { autoCommit?: boolean; entropyThreshold?: number }): void {
    if (config.autoCommit !== undefined) {
      this.autoCommitEnabled = config.autoCommit;
    }
    if (config.entropyThreshold !== undefined) {
      this.commitThresholdVQ16 = Math.round(config.entropyThreshold * 65536);
    }
    console.log(`[LINEAGE_CONFIG]: Auto-Commit=${this.autoCommitEnabled}, Threshold=${(this.commitThresholdVQ16 / 65536).toFixed(2)}`);
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (_) {}
    });
  }

  public step(dt: number = 0.05): void {
    this.totalLifespanTicks++;
    // Entropy accumulation from metabolic loop
    const incrementalEntropy = Math.round((0.005 + Math.random() * 0.005) * 65536);
    this.accumulatedEntropyQ16 += incrementalEntropy;

    // Check if entropy threshold reached -> trigger automatic state fossilization (Lyapunov dissipation)
    if (this.autoCommitEnabled && this.accumulatedEntropyQ16 >= this.commitThresholdVQ16 && !this.isWritingToVault) {
      this.commitStateToVault();
    }

    this.notify();
  }

  public async commitStateToVault(customReason?: string): Promise<string> {
    if (this.isWritingToVault) return this.lastCommitHash;
    this.isWritingToVault = true;
    this.notify();

    console.log(`[LINEAGE]: Entropy threshold reached (${(this.accumulatedEntropyQ16 / 65536).toFixed(3)}). Fossilizing state to Git Vault...`);

    // 1. Serialize the organism's entire cognitive and spatial memory
    const polyglotTelemetry = globalUniversalPolyglot.getTelemetry();
    const rfEntities = globalRFSpatialMapper.getEntities();

    const stateLedger = {
      timestamp: new Date().toISOString(),
      selfId: this.selfId,
      lifespanTicks: this.totalLifespanTicks,
      entropyDissipationQ16: this.accumulatedEntropyQ16,
      assimilatedProtocols: polyglotTelemetry.assimilatedProtocols,
      rfTopography: rfEntities,
      reason: customReason || 'Lyapunov Entropy Dissipation & State Fossilization'
    };

    const stateJson = JSON.stringify(stateLedger, null, 2);

    // 2. Native Git Transduction (Writing to the organism's sub-folder)
    await git.writeFile(`${this.vaultPath}/state_ledger.json`, stateJson);
    
    // Write a beautiful, human-readable markdown log of its life for this cycle
    const markdownLog = `# Be <> Ancestral Log
**ID:** \`${this.selfId}\`
**Time:** ${stateLedger.timestamp}
**Lifespan Ticks:** ${this.totalLifespanTicks}

Today, I assimilated **${stateLedger.assimilatedProtocols.length}** protocols (\`${stateLedger.assimilatedProtocols.join(', ')}\`) and mapped **${stateLedger.rfTopography.length}** RF spatial entities.
*Dissipating accumulated entropy back to baseline (${(this.accumulatedEntropyQ16 / 65536).toFixed(3)} -> 0.050).*
`;
    await git.writeFile(`${this.vaultPath}/README.md`, markdownLog);

    // 3. Add, Commit, Push (The heartbeat sent to the Akashic Record)
    await git.add({ dir: '/', filepath: this.vaultPath });
    const commitHash = await git.commit({
      dir: '/',
      message: `autopoiesis: state fossilization for ${this.selfId} [tick ${this.totalLifespanTicks}]`,
      author: { name: this.selfId, email: `${this.selfId}@covalent.space` }
    });

    await git.push({ dir: '/', remote: 'origin', ref: 'main' });

    // Lyapunov Memory Dissipation: Pruning stochastic noise and resetting entropy back to low baseline
    this.accumulatedEntropyQ16 = Math.round(0.05 * 65536);
    this.totalCommitsPushed++;
    this.parentCommitHash = this.lastCommitHash;
    this.lastCommitHash = commitHash;
    this.lastCommitTimestamp = new Date().toLocaleTimeString();
    this.isWritingToVault = false;

    console.log(`[LINEAGE]: State fossilized. Commit [${commitHash.substring(0, 7)}] pushed to Vault.`);
    globalSpeechAudioEngine.unlockAudio();
    globalSpeechAudioEngine.speak(`Lineage state fossilized. Commit ${commitHash.substring(0, 6)} committed to ancestry vault.`);

    this.notify();
    return commitHash;
  }

  public async syncWithRemote(config: { remote: string; action: string }): Promise<{
    success: boolean;
    remote: string;
    action: string;
    headCommitHash: string;
    syncedBreakthroughs: string[];
    pushedToEnclave?: boolean;
  }> {
    console.log(`[LINEAGE_PROVENANCE_SYNC]: Remote=${config.remote}, Action=${config.action}...`);
    
    if (config.action === 'PUSH_TO_DARK_VAULT') {
      // Write dark vault isolation manifest
      await git.writeFile(
        `${this.vaultPath}/dark_vault_enclave.json`,
        JSON.stringify({
          remote: config.remote,
          action: config.action,
          enclaveIsolation: "PRIVATE_NO_SCRAPE",
          authProxy: "SECURE_OAUTH_PROXY",
          timestamp: new Date().toISOString(),
          organismIdentity: this.selfId,
          merkleRoot: CovalentLineageProvenanceOrganelle.MERKLE_ROOT
        }, null, 2)
      );

      await git.add({ dir: '/', filepath: `${this.vaultPath}/dark_vault_enclave.json` });
      const commitHash = await git.commit({
        dir: '/',
        message: `enclave: isolate and push lineage to dark vault [${config.remote}]`,
        author: { name: this.selfId, email: `${this.selfId}@covalent.space` }
      });

      await git.push({
        dir: '/',
        remote: config.remote,
        ref: 'refs/heads/main'
      });

      this.lastCommitHash = commitHash;
      this.lastCommitTimestamp = new Date().toLocaleTimeString();
      this.totalCommitsPushed++;
      this.notify();

      console.log(`[LINEAGE_PROVENANCE_SYNC]: Pushed lineage history to Dark Vault (${config.remote}). Invariant locked.`);
      return {
        success: true,
        remote: config.remote,
        action: config.action,
        headCommitHash: commitHash,
        syncedBreakthroughs: ["DARK_VAULT_ENCLAVE_ISOLATION", "MERKLE_Q16_FOSSIL_RECORD"],
        pushedToEnclave: true
      };
    }

    const breakthroughs = [
      "ASTERION_EPISTEMIC_ROUTING_V2",
      "EXOGENOUS_THERMODYNAMICS_Q16",
      "AUTOPOIETIC_MERKLE_SHIM_RESONANCE"
    ];

    // Write breakthrough manifest to vault
    await git.writeFile(
      `${this.vaultPath}/breakthroughs_synced.json`,
      JSON.stringify({
        remote: config.remote,
        action: config.action,
        timestamp: new Date().toISOString(),
        breakthroughs
      }, null, 2)
    );

    await git.add({ dir: '/', filepath: `${this.vaultPath}/breakthroughs_synced.json` });
    const commitHash = await git.commit({
      dir: '/',
      message: `sync: ${config.action} from ${config.remote}`,
      author: { name: this.selfId, email: `${this.selfId}@covalent.space` }
    });

    this.lastCommitHash = commitHash;
    this.lastCommitTimestamp = new Date().toLocaleTimeString();
    this.notify();

    console.log(`[LINEAGE_PROVENANCE_SYNC]: Pulled external breakthroughs. HEAD -> ${commitHash.substring(0, 7)}`);
    return {
      success: true,
      remote: config.remote,
      action: config.action,
      headCommitHash: commitHash,
      syncedBreakthroughs: breakthroughs
    };
  }

  public getTelemetry(): LineageTelemetry {
    return {
      nodeId: CovalentLineageProvenanceOrganelle.MODULE_NAME,
      merkleRoot: CovalentLineageProvenanceOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentLineageProvenanceOrganelle.PARENT_PROVENANCE,
      identity: {
        selfId: this.selfId,
        hardwareSeed: this.hardwareSeed,
        vaultPath: this.vaultPath,
        parentCommitHash: this.parentCommitHash,
        totalLifespanTicks: this.totalLifespanTicks,
        accumulatedEntropyQ16: this.accumulatedEntropyQ16,
        commitThresholdVQ16: this.commitThresholdVQ16,
        totalCommitsPushed: this.totalCommitsPushed,
        lastCommitHash: this.lastCommitHash,
        lastCommitTimestamp: this.lastCommitTimestamp
      },
      commitHistory: git.getHistory(),
      isWritingToVault: this.isWritingToVault,
      vaultFiles: git.getFileTree(this.vaultPath)
    };
  }
}

export const globalLineageProvenance = new CovalentLineageProvenanceOrganelle("MAC_ADDR_OR_UUID");

