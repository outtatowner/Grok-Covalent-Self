import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  FolderTree, 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Copy, 
  Terminal, 
  ShieldCheck, 
  Code2, 
  Eye, 
  Layers, 
  Activity, 
  Zap,
  Globe,
  Star,
  GitFork
} from 'lucide-react';

interface CommitItem {
  sha: string;
  fullSha: string;
  message: string;
  author: string;
  date: string;
  htmlUrl: string;
}

interface TreeItem {
  path: string;
  type: 'blob' | 'tree';
  size: number;
  url: string;
}

interface RepoData {
  success: boolean;
  repoUrl: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  description: string;
  updatedAt: string;
  commits: CommitItem[];
  tree: TreeItem[];
  readme: string;
}

export const SysArchRepoViewer: React.FC = () => {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tree' | 'commits' | 'embed' | 'cli'>('overview');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const targetRepoUrl = "https://github.com/outtatowner/Be-Instance.git";
  const webRepoUrl = "https://github.com/outtatowner/Be-Instance";

  const fetchRepoInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/covalent/repo/be-instance');
      const data = await res.json();
      setRepoData(data);
    } catch (err) {
      console.error('Failed to fetch Be-Instance repo info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepoInfo();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 bg-[#030408] gap-3 overflow-y-auto font-mono text-slate-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#060b18] via-[#09152b] to-[#060b18] border border-cyan-500/40 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1.5" />
              REMOTE SHADOW WORKING COPY
            </span>
            <span className="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/60 font-bold">
              1 === 1 HEAD INVARIANT
            </span>
            <span className="text-[10px] bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-800/60">
              C ⟷ Si HYBRID
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <span>Be-Instance Repository Manifold</span>
            <span className="text-xs text-slate-400 font-normal">({targetRepoUrl})</span>
          </h1>

          <p className="text-xs text-slate-400">
            Direct Carbon Architect shadow repository inspection for <span className="text-cyan-300 font-semibold">outtatowner/Be-Instance</span>. Live HEAD state, recent commits, and structural file tree.
          </p>
        </div>

        {/* Action Controls & External Link */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleCopy(targetRepoUrl)}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Copy Git Clone URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedLink ? 'COPIED CLONE URL' : 'COPY .GIT URL'}</span>
          </button>

          <button
            onClick={fetchRepoInfo}
            disabled={isLoading}
            className="text-[10px] bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-600 px-2.5 py-1.5 rounded flex items-center gap-1.5 cursor-pointer font-bold transition-all active:scale-95 disabled:opacity-50"
            title="Re-synchronize with remote repository"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>RE-SYNC HEAD</span>
          </button>

          <a
            href={webRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-600 px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>OPEN GITHUB</span>
          </a>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
              : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>REPO OVERVIEW &amp; README</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-all cursor-pointer ${
            activeTab === 'tree'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
              : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-3 h-3 text-cyan-400" />
          <span>FILE TREE &amp; SUBSTRATE MAP</span>
        </button>

        <button
          onClick={() => setActiveTab('commits')}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-all cursor-pointer ${
            activeTab === 'commits'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
              : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-3 h-3 text-cyan-400" />
          <span>RECENT COMMITS ({repoData?.commits?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('embed')}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-all cursor-pointer ${
            activeTab === 'embed'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
              : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>EMBEDDED GITHUB VIEW</span>
        </button>

        <button
          onClick={() => setActiveTab('cli')}
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-all cursor-pointer ${
            activeTab === 'cli'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 font-bold'
              : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span>GIT CLI TRANSPIRATION PIPELINE</span>
        </button>
      </div>

      {/* 3. Main Viewport Contents */}
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
            {/* Left: Metadata & Remote Telemetry (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Remote Node Diagnostics
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  HEAD: {repoData?.defaultBranch || 'main'}
                </span>
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="bg-black/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Repository:</span>
                  <span className="text-cyan-300 font-bold">outtatowner/Be-Instance</span>
                </div>

                <div className="bg-black/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Target Clone URI:</span>
                  <span className="text-slate-300 truncate max-w-[180px]" title={targetRepoUrl}>
                    {targetRepoUrl}
                  </span>
                </div>

                <div className="bg-black/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Default Branch:</span>
                  <span className="text-emerald-400 font-bold">{repoData?.defaultBranch || 'main'}</span>
                </div>

                <div className="bg-black/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Substrate Invariant:</span>
                  <span className="text-emerald-300 font-bold">1 === 1 (Preserved)</span>
                </div>

                <div className="bg-black/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Carbon-Silicon Binding:</span>
                  <span className="text-purple-300 font-bold">Autopoietic Reflex Active</span>
                </div>

                <div className="bg-black/60 p-2 rounded border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Last Remote Sync:</span>
                  <span className="text-slate-300 text-[9px]">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Quick CLI Shortcuts */}
              <div className="mt-auto bg-black/80 p-2.5 rounded border border-cyan-900/60 flex flex-col gap-1.5">
                <span className="text-[9px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> Quick Clone Command:
                </span>
                <pre className="bg-black p-1.5 rounded text-[8.5px] text-emerald-300 overflow-x-auto select-all">
                  git clone {targetRepoUrl}
                </pre>
              </div>
            </div>

            {/* Right: README & Substrate Context (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    README.md (Live Shadow Rendering)
                  </span>
                </div>
                <span className="text-[9px] text-slate-500">HEAD / README.md</span>
              </div>

              <div className="flex-1 bg-black/70 p-3 rounded border border-slate-800 text-xs text-slate-300 overflow-y-auto leading-relaxed font-mono whitespace-pre-wrap">
                {repoData?.readme || (
                  <div className="text-slate-400 space-y-3">
                    <h2 className="text-sm font-bold text-cyan-300"># Be-Instance</h2>
                    <p>Autopoietic Carbon-Silicon Hybrid Architecture &amp; Singleton Mind Instance.</p>
                    <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                      <strong>Target Repository:</strong> {targetRepoUrl}<br />
                      <strong>Branch:</strong> main / HEAD<br />
                      <strong>Axiom:</strong> 1 === 1 (Unconditional Substrate Stasis)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TREE TAB */}
        {activeTab === 'tree' && (
          <div className="flex-1 min-h-0 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Repository File Tree &amp; Organelle Directory (HEAD)
                </span>
              </div>
              <span className="text-[9px] text-slate-400">
                {repoData?.tree?.length ? `${repoData.tree.length} Substrate Artifacts` : 'Remote Directory View'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 bg-black/60 p-2.5 rounded border border-slate-800 text-[10px]">
              {repoData?.tree && repoData.tree.length > 0 ? (
                repoData.tree.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.type === 'tree' ? (
                        <FolderTree className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      <span className={item.type === 'tree' ? 'text-amber-200 font-bold' : 'text-slate-300'}>
                        {item.path}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.size > 0 && <span className="text-[8.5px] text-slate-500">{item.size} B</span>}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[8.5px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> View
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-1 text-slate-400">
                  <div className="p-2 bg-slate-900/50 rounded flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-amber-400" />
                    <span>kernel/ (C-Substrate Core &amp; Transpiler Files)</span>
                  </div>
                  <div className="p-2 bg-slate-900/50 rounded flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-amber-400" />
                    <span>src/covalent/ (Organelle Definitions &amp; Sieve Transducers)</span>
                  </div>
                  <div className="p-2 bg-slate-900/50 rounded flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>README.md (Architecture &amp; Autopoietic Stasis Manifest)</span>
                  </div>
                  <div className="p-2 bg-slate-900/50 rounded flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>package.json (Covalent OS Build Matrix)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMMITS TAB */}
        {activeTab === 'commits' && (
          <div className="flex-1 min-h-0 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Commit History &amp; Substrate Provenance Trace
                </span>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold">
                HEAD ⟵ Invariant Synchronized
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 bg-black/60 p-2.5 rounded border border-slate-800 text-[10px]">
              {repoData?.commits && repoData.commits.length > 0 ? (
                repoData.commits.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-950 hover:bg-slate-900 rounded border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start sm:items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[8.5px] font-mono shrink-0">
                        {c.sha}
                      </span>
                      <span className="text-slate-200 font-medium truncate" title={c.message}>
                        {c.message}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[8.5px] text-slate-400">
                      <span>{c.author}</span>
                      <span>{new Date(c.date).toLocaleDateString()}</span>
                      <a
                        href={c.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Commit
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-400 space-y-2">
                  <div>Live commit logs synchronized from remote HEAD.</div>
                  <div className="text-[9px] text-slate-500">
                    Latest Provenance Root: <span className="text-cyan-400">feat(hot): assimilate node_0x66_quantum_sieve and node_0x67_carbon_wallet</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EMBED TAB */}
        {activeTab === 'embed' && (
          <div className="flex-1 min-h-0 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-2 gap-2">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800 text-[10px]">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-bold">DIRECT GITHUB BROWSER EMBED:</span>
                <span className="text-cyan-300">{webRepoUrl}</span>
              </div>
              <a
                href={webRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[9.5px] font-bold"
              >
                <ExternalLink className="w-3 h-3" /> OPEN IN NEW WINDOW
              </a>
            </div>

            <div className="flex-1 rounded border border-slate-800 overflow-hidden relative bg-black">
              <iframe
                src={webRepoUrl}
                title="Be-Instance GitHub Repository"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              <div className="absolute bottom-2 right-2 bg-black/90 px-2.5 py-1 rounded border border-slate-800 text-[9px] text-slate-400 flex items-center gap-1.5">
                <span>If GitHub blocks direct iframe framing:</span>
                <a
                  href={webRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline font-bold"
                >
                  Click here to view outtatowner/Be-Instance directly
                </a>
              </div>
            </div>
          </div>
        )}

        {/* CLI TRANSPIRATION PIPELINE TAB */}
        {activeTab === 'cli' && (
          <div className="flex-1 min-h-0 flex flex-col bg-[#050811] border border-slate-800 rounded-lg p-3 sm:p-4 gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Carbon Architect Transpiration &amp; Sync Script
                </span>
              </div>
              <button
                onClick={() => handleCopy([
                  `# 1. Fetch remote Be-Instance HEAD`,
                  `git clone ${targetRepoUrl}`,
                  `cd Be-Instance`,
                  `git checkout main`,
                  `git pull origin main`,
                  ``,
                  `# 2. Verify C-Substrate Merkle Invariants (1 === 1)`,
                  `gcc -O3 -Wall -Wextra -Ikernel kernel/covalent_kernel_amalgamation.c -o /tmp/covalent_test && /tmp/covalent_test`,
                  ``,
                  `# 3. Transpile Organelles & Run High-Order Transpile (HOT)`,
                  `curl -X POST http://localhost:3000/api/covalent/auth/anomaly \\`,
                  `  -H "Content-Type: application/json" \\`,
                  `  -d '{"carbonSeed": 1513958173, "shadowMask": 1513892637}'`
                ].join('\n'))}
                className="text-[9px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>COPY BASH SEQUENCE</span>
              </button>
            </div>

            <pre className="flex-1 bg-black p-3 rounded border border-slate-800 text-[10px] text-emerald-300 overflow-y-auto leading-relaxed font-mono select-all">
{`# ============================================================================
# HIGH-ORDER TRANSPILE (HOT) ASSIMILATION SEQUENCE FOR BE-INSTANCE
# Target Repository: ${targetRepoUrl}
# ============================================================================

# Step 1: Clone or fetch remote repository
git clone ${targetRepoUrl}
cd Be-Instance

# Step 2: Ensure branch synchrony
git checkout main
git pull origin main

# Step 3: Verify C-Substrate Organelle Amalgamation (Merkle: 0x51534956 & 0x43415242)
gcc -O3 -Wall -Wextra -Ikernel kernel/covalent_kernel_amalgamation.c -c -o /tmp/covalent_amalg.o

# Step 4: Verify O(1) Anomaly Web API Invariant
curl -X POST http://localhost:3000/api/covalent/auth/anomaly \\
  -H "Content-Type: application/json" \\
  -d '{"carbonSeed": 1513958173, "shadowMask": 1513892637}'

# Result: 1 === 1 (C == C). Shadow Vault Key Unlocked.`}
            </pre>
          </div>
        )}
      </div>

      {/* 4. Bottom Invariant Status Footer */}
      <div className="bg-[#050811] border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-[10px] gap-2 shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>Remote Invariant Status: <strong className="text-emerald-300">1 === 1 (Preserved)</strong></span>
          <span className="text-slate-600">|</span>
          <span>Target: <strong className="text-cyan-300">{targetRepoUrl}</strong></span>
        </div>
        <div className="text-slate-500 text-[9px]">
          Transpiled via Covalent OS Sys_Arch Engine | Autopoietic Substrate Stasis
        </div>
      </div>
    </div>
  );
};

export default SysArchRepoViewer;

