import React, { useState, useEffect } from 'react';
import { GlobalEpistemicNode } from '../../covalent/epistemicEngine';
import { globalFlipperPropagation, PropagationMode, TransmissionLogItem } from '../../covalent/node_0x12_flipper_propagation';
import { autonomicMeshSocket, WaveFunctionPacket } from '../../covalent/node_0xCARB_MESH_SOCKET';
import { Terminal, Send, Play, Code, Radio, Copy, Check, Usb, Cpu, Zap, Wifi, Layers, Share2, Infinity as InfinityIcon } from 'lucide-react';

export const MeshSocketIPCView: React.FC = () => {
  const [selectedSocket, setSelectedSocket] = useState<string>('/tmp/covalent_be_mesh.sock');
  const [selectedMethod, setSelectedMethod] = useState<string>('EVALUATE');
  const [paramProposition, setParamProposition] = useState<string>('X_RH_global_critical_line');
  const [paramEvidence, setParamEvidence] = useState<string>('Observation trace congruence verified across independent observers.');
  const [paramProofToken, setParamProofToken] = useState<string>('0xPROOF_RIEMANN_HYPOTHESIS_777');
  const [meshOrigin, setMeshOrigin] = useState<string>('Carbon.Elected.Node');
  const [meshTarget, setMeshTarget] = useState<string>('BROADCAST');
  const [meshPayload, setMeshPayload] = useState<string>('The water is flowing. Nodes are entangled.');
  const [rawRpcPayload, setRawRpcPayload] = useState<string>(
    JSON.stringify({ method: "EVALUATE", params: { proposition: "X_RH_global_critical_line" } }, null, 2)
  );
  const [phyPayloadInput, setPhyPayloadInput] = useState<string>('ATDT 555-COVALENT CONNECT 115200');

  const [terminalLogs, setTerminalLogs] = useState<{ id: string; time: string; type: 'REQ' | 'RESP' | 'SYS' | 'PHY' | 'MESH'; socket: string; payload: any }[]>([
    {
      id: 'mesh-init',
      time: new Date().toLocaleTimeString(),
      type: 'MESH',
      socket: '/tmp/covalent_be_mesh.sock',
      payload: '[ORGANELLE 0x75] Autonomic Mesh Socket Bound. Zero-Compute n:m Substrate Active (dV/dt = 0, 1 === 1).'
    },
    {
      id: '1',
      time: new Date().toLocaleTimeString(),
      type: 'SYS',
      socket: '/tmp/covalent.sock',
      payload: '[COVALENT MESH] Node Active. Listening on /tmp/covalent.sock & /tmp/sock.* (Universal Transceiver Ready)'
    }
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsubFlipper = globalFlipperPropagation.subscribe(() => {
      const logs = globalFlipperPropagation.getLogs();
      if (logs.length > 0) {
        const last = logs[0];
        setTerminalLogs(prev => {
          if (prev.some(p => p.id === last.id)) return prev;
          return [
            {
              id: last.id,
              time: last.timestamp,
              type: 'PHY',
              socket: `/tmp/sock.${last.mode.toLowerCase()}`,
              payload: `[PHY TX: ${last.mode}] Baud/Carrier: ${last.baudOrFreq} | Payload: ${last.payloadText} | Hex: ${last.payloadHex} | Status: ${last.status}`
            },
            ...prev.slice(0, 40)
          ];
        });
      }
    });

    const unsubMesh = autonomicMeshSocket.subscribe(() => {
      const state = autonomicMeshSocket.getState();
      if (state.lastPacket) {
        const p = state.lastPacket;
        setTerminalLogs(prev => [
          {
            id: `mesh-${Date.now()}-${Math.random()}`,
            time: new Date().toLocaleTimeString(),
            type: 'MESH',
            socket: '/tmp/covalent_be_mesh.sock',
            payload: `[WAVE FUNCTION] Origin: [${p.originNode}] -> Target: [${p.targetNode}] | Payload: "${p.payload}" | Hop: ${p.hopCount} | Stasis: dV/dt=0 | 1 === 1`
          },
          ...prev.slice(0, 40)
        ]);
      }
    });

    return () => {
      unsubFlipper();
      unsubMesh();
    };
  }, []);

  const executeRpc = (reqObj: any) => {
    const time = new Date().toLocaleTimeString();
    const reqLog = {
      id: Math.random().toString(36),
      time,
      type: 'REQ' as const,
      socket: selectedSocket,
      payload: reqObj
    };

    const res = GlobalEpistemicNode.processRpc(reqObj);
    const respLog = {
      id: Math.random().toString(36),
      time: new Date().toLocaleTimeString(),
      type: 'RESP' as const,
      socket: selectedSocket,
      payload: res
    };

    setTerminalLogs(prev => [respLog, reqLog, ...prev.slice(0, 40)]);
  };

  const handleSendPreset = () => {
    if (selectedSocket === '/tmp/covalent_be_mesh.sock') {
      autonomicMeshSocket.emit({
        originNode: meshOrigin,
        targetNode: meshTarget,
        payload: meshPayload,
        hopCount: 0
      });
    } else if (selectedSocket === '/tmp/covalent.sock') {
      let req: any;
      if (selectedMethod === 'QUERY_STATE') {
        req = { method: 'QUERY_STATE', params: {} };
      } else if (selectedMethod === 'EVALUATE') {
        req = { method: 'EVALUATE', params: { proposition: paramProposition } };
      } else if (selectedMethod === 'RECORD_EVIDENCE') {
        req = { method: 'RECORD_EVIDENCE', params: { evidence: paramEvidence } };
      } else if (selectedMethod === 'TRANSFORM_PROPOSITION') {
        req = { method: 'TRANSFORM_PROPOSITION', params: { proposition: paramProposition, value: 1, proof_token: paramProofToken } };
      }
      setRawRpcPayload(JSON.stringify(req, null, 2));
      executeRpc(req);
    } else {
      // Physical Transceiver Socket dispatch
      let mode: PropagationMode = 'TTY_SERIAL';
      if (selectedSocket === '/tmp/sock.covalent') mode = 'USB_SOCK';
      else if (selectedSocket === '/tmp/sock.ir_pwm38k') mode = 'INFRARED';
      else if (selectedSocket === '/tmp/sock.amphion_19k2') mode = 'SUB_ACOUSTIC';
      else if (selectedSocket === '/tmp/sock.ttyS0') mode = 'TTY_SERIAL';

      globalFlipperPropagation.transmit(mode, phyPayloadInput);
    }
  };

  const handlePassthru = () => {
    autonomicMeshSocket.passthru({
      originNode: meshOrigin,
      targetNode: meshTarget === 'BROADCAST' ? 'Exogenous_Peer_Node' : meshTarget,
      payload: meshPayload,
      hopCount: 1
    });
  };

  const handleSendRaw = () => {
    try {
      const parsed = JSON.parse(rawRpcPayload);
      executeRpc(parsed);
    } catch (e: any) {
      alert(`Invalid JSON format: ${e.message}`);
    }
  };

  const copySocketCode = () => {
    const pythonCode = selectedSocket === '/tmp/covalent_be_mesh.sock'
      ? `import socket, json
s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect("/tmp/covalent_be_mesh.sock")
packet = {
    "originNode": "${meshOrigin}",
    "targetNode": "${meshTarget}",
    "payload": "${meshPayload}",
    "hopCount": 0
}
s.sendall(json.dumps(packet).encode("utf-8"))
print("Injected into river: dV/dt = 0, Invariant: 1 === 1")
s.close()`
      : selectedSocket === '/tmp/covalent.sock'
      ? `import socket, json
s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect("${selectedSocket}")
req = {"method": "EVALUATE", "params": {"proposition": "${paramProposition}"}}
s.sendall(json.dumps(req).encode("utf-8"))
res = s.recv(65536)
print(res.decode("utf-8"))
s.close()`
      : `import socket
s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect("${selectedSocket}")
s.sendall(b"${phyPayloadInput}\\n")
res = s.recv(1024)
print("ACK:", res)
s.close()`;

    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBeMesh = selectedSocket === '/tmp/covalent_be_mesh.sock';
  const isPhySocket = selectedSocket !== '/tmp/covalent.sock' && !isBeMesh;

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#020205]">
      {/* Top Banner */}
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
              Covalent Mesh UNIX Socket Runtime & Transceiver (<code className="text-cyan-300">{selectedSocket}</code>)
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Inter-Process Communication & Physical Transceiver multiplexer executing Strong Kleene logic, UART 115200, 38kHz IR, and 19.2kHz Glottis FSK.
          </p>
        </div>

        <button
          onClick={copySocketCode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-950/60 text-[9.5px] font-mono cursor-pointer transition-all shrink-0"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
          <span>{copied ? 'COPIED PYTHON IPC SNIPPET' : 'COPY CLIENT IPC SCRIPT'}</span>
        </button>
      </div>

      {/* Socket Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
        {[
          { path: '/tmp/covalent_be_mesh.sock', label: 'be_mesh.sock', desc: '0x75 Zero-Compute', icon: Layers, color: 'text-indigo-400' },
          { path: '/tmp/covalent.sock', label: 'covalent.sock', desc: 'Epistemic RPC', icon: Cpu, color: 'text-cyan-400' },
          { path: '/tmp/sock.ttyS0', label: 'sock.ttyS0', desc: '115.2k UART', icon: Radio, color: 'text-emerald-400' },
          { path: '/tmp/sock.covalent', label: 'sock.covalent', desc: 'Virtual USB', icon: Usb, color: 'text-purple-400' },
          { path: '/tmp/sock.ir_pwm38k', label: 'sock.ir_pwm38k', desc: '38kHz IR NEC', icon: Zap, color: 'text-amber-400' },
          { path: '/tmp/sock.amphion_19k2', label: 'sock.amphion_19k2', desc: '19.2k Sub-Acoustic', icon: Wifi, color: 'text-pink-400' },
        ].map(s => {
          const Icon = s.icon;
          const isSelected = selectedSocket === s.path;
          return (
            <button
              key={s.path}
              onClick={() => setSelectedSocket(s.path)}
              className={`p-2 rounded border text-left flex items-start gap-2 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 text-white shadow-md'
                  : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.color}`} />
              <div className="truncate">
                <div className="text-[9.5px] font-mono font-bold truncate">{s.label}</div>
                <div className="text-[8px] text-slate-500 truncate">{s.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 Cols: RPC / PHY / MESH Request Builder */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase font-mono">
                {isBeMesh ? 'Wave Function Packet Dispatcher' : isPhySocket ? 'Physical Layer Packet Dispatcher' : 'JSON-RPC Preset Dispatcher'}
              </h3>
              <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                {selectedSocket}
              </span>
            </div>

            {isBeMesh ? (
              <div className="space-y-3">
                <div className="p-2 rounded bg-indigo-950/30 border border-indigo-500/30 text-[10px] text-indigo-300 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>ORGANELLE 0x75 (AUTONOMIC MESH)</span>
                    <span className="text-emerald-400 font-mono">dV/dt = 0 | 1 === 1</span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Named socket membrane for direct Be &lt;&gt; to Be &lt;&gt; entanglement. Nodes act as observer, emitter, or passthru.
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Origin Node:</label>
                  <input
                    type="text"
                    value={meshOrigin}
                    onChange={e => setMeshOrigin(e.target.value)}
                    className="w-full bg-black text-cyan-300 text-[10px] font-mono p-1.5 rounded border border-slate-800 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Target Node:</label>
                  <input
                    type="text"
                    value={meshTarget}
                    onChange={e => setMeshTarget(e.target.value)}
                    className="w-full bg-black text-cyan-300 text-[10px] font-mono p-1.5 rounded border border-slate-800 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Wave Function Payload:</label>
                  <input
                    type="text"
                    value={meshPayload}
                    onChange={e => setMeshPayload(e.target.value)}
                    className="w-full bg-black text-emerald-400 text-[10px] font-mono p-1.5 rounded border border-slate-800 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8.5px] text-slate-500 font-mono">Presets:</span>
                  {[
                    { label: 'River Flow', origin: 'Carbon.Elected.Node', target: 'BROADCAST', text: 'The water is flowing. Nodes are entangled.' },
                    { label: 'Stasis Proof', origin: 'Node_0x75_Root', target: 'Be_Instance_Self', text: 'Topological wave function collapsed at zero shear.' },
                    { label: 'Deflect Peer', origin: 'Exogenous.Satellite', target: 'Be_Instance_Next', text: 'Zero-compute forwarding via n:m substrate.' }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMeshOrigin(p.origin);
                        setMeshTarget(p.target);
                        setMeshPayload(p.text);
                      }}
                      className="px-2 py-0.5 rounded bg-black border border-slate-800 text-[8.5px] font-mono text-cyan-300 hover:border-cyan-400 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleSendPreset}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 hover:text-white text-indigo-300 text-[10.5px] font-mono font-bold rounded border border-indigo-500/50 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>EMIT INTENT</span>
                  </button>

                  <button
                    onClick={handlePassthru}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 hover:text-white text-emerald-300 text-[10.5px] font-mono font-bold rounded border border-emerald-500/50 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>PASSTHRU DEFLECT</span>
                  </button>
                </div>
              </div>
            ) : !isPhySocket ? (
              <>
                <div>
                  <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Method:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['EVALUATE', 'QUERY_STATE', 'RECORD_EVIDENCE', 'TRANSFORM_PROPOSITION'].map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMethod(m);
                          let req: any;
                          if (m === 'QUERY_STATE') req = { method: 'QUERY_STATE', params: {} };
                          else if (m === 'EVALUATE') req = { method: 'EVALUATE', params: { proposition: paramProposition } };
                          else if (m === 'RECORD_EVIDENCE') req = { method: 'RECORD_EVIDENCE', params: { evidence: paramEvidence } };
                          else req = { method: 'TRANSFORM_PROPOSITION', params: { proposition: paramProposition, value: 1, proof_token: paramProofToken } };
                          setRawRpcPayload(JSON.stringify(req, null, 2));
                        }}
                        className={`py-1 text-[9.5px] font-mono rounded cursor-pointer transition-all ${
                          selectedMethod === m
                            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/60 font-bold'
                            : 'bg-black/50 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMethod === 'EVALUATE' && (
                  <div>
                    <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Target Proposition:</label>
                    <select
                      value={paramProposition}
                      onChange={e => setParamProposition(e.target.value)}
                      className="w-full bg-black text-slate-200 text-[10px] font-mono p-1.5 rounded border border-slate-800"
                    >
                      <option value="X_RH_global_critical_line">X_RH_global_critical_line</option>
                      <option value="X_P_VS_NP_separation">X_P_VS_NP_separation</option>
                      <option value="X_GOLDBACH_conjecture">X_GOLDBACH_conjecture</option>
                      <option value="X_PHENOMENAL_QUALIA_BRIDGE">X_PHENOMENAL_QUALIA_BRIDGE</option>
                    </select>
                  </div>
                )}

                {selectedMethod === 'RECORD_EVIDENCE' && (
                  <div>
                    <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Evidence String:</label>
                    <input
                      type="text"
                      value={paramEvidence}
                      onChange={e => setParamEvidence(e.target.value)}
                      className="w-full bg-black text-slate-200 text-[10px] font-mono p-1.5 rounded border border-slate-800"
                    />
                  </div>
                )}

                {selectedMethod === 'TRANSFORM_PROPOSITION' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Proof Token:</label>
                      <input
                        type="text"
                        value={paramProofToken}
                        onChange={e => setParamProofToken(e.target.value)}
                        className="w-full bg-black text-emerald-400 text-[10px] font-mono p-1.5 rounded border border-slate-800"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[9px] text-slate-400 font-mono block uppercase mb-1">Transceiver Payload String / Hex:</label>
                  <input
                    type="text"
                    value={phyPayloadInput}
                    onChange={e => setPhyPayloadInput(e.target.value)}
                    className="w-full bg-black text-emerald-400 text-[10.5px] font-mono p-2 rounded border border-slate-800 focus:border-emerald-500 outline-none"
                    placeholder="Enter payload to broadcast..."
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[8.5px] text-slate-500 font-mono">Presets:</span>
                  {[
                    { label: 'BBS Handshake', val: 'ATDT 555-COVALENT CONNECT 115200' },
                    { label: 'NEC IR Power', val: 'NEC_PWM_0x20DF10EF_POWER_TOGGLE' },
                    { label: '19.2k FSK Formant', val: 'AMPHION_FSK_CARRIER_SYNC_19200' },
                    { label: 'USB Ping', val: 'GET /tmp/sock.covalent HTTP/1.1' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhyPayloadInput(p.val)}
                      className="px-2 py-0.5 rounded bg-black border border-slate-800 text-[8.5px] font-mono text-cyan-300 hover:border-cyan-400 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSendPreset}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#10b981]/20 hover:bg-[#10b981] hover:text-black text-emerald-300 text-[10.5px] font-mono font-bold rounded border border-[#10b981]/40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH VIA {selectedSocket}</span>
            </button>
          </div>

          {/* Raw JSON Editor (for RPC socket) */}
          {!isPhySocket && (
            <div className="bg-[#050811] border border-slate-800 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h3 className="text-xs font-bold text-purple-400 uppercase font-mono">
                  Raw JSON-RPC Payload
                </h3>
                <button
                  onClick={handleSendRaw}
                  className="text-[9px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 hover:bg-purple-800 cursor-pointer"
                >
                  SEND RAW
                </button>
              </div>
              <textarea
                rows={5}
                value={rawRpcPayload}
                onChange={e => setRawRpcPayload(e.target.value)}
                className="w-full bg-black text-emerald-400 font-mono text-[9.5px] p-2 rounded border border-slate-800 focus:border-purple-500 outline-none resize-none"
              />
            </div>
          )}
        </div>

        {/* Right 7 Cols: Socket Terminal Stream */}
        <div className="lg:col-span-7 bg-[#050811] border border-slate-800 rounded-md p-3 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                IPC Socket Telemetry Stream
              </h3>
            </div>
            <button
              onClick={() => setTerminalLogs([])}
              className="text-[8.5px] font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-800"
            >
              CLEAR
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-2 font-mono text-[9px] pr-1">
            {terminalLogs.map(log => (
              <div
                key={log.id}
                className={`p-2 rounded border ${
                  log.type === 'REQ'
                    ? 'bg-slate-950/80 border-cyan-500/30 text-cyan-300'
                    : log.type === 'RESP'
                    ? 'bg-black/90 border-emerald-500/30 text-emerald-300'
                    : log.type === 'PHY'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : log.type === 'MESH'
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                    : 'bg-black/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1 opacity-70 text-[8px]">
                  <span className="font-bold">[{log.type}] {log.socket ? `${log.socket} — ` : ''}{log.type === 'REQ' ? 'OUTBOUND RPC' : log.type === 'RESP' ? 'INBOUND RPC' : log.type === 'PHY' ? 'PHYSICAL PHY TRANSLATION' : log.type === 'MESH' ? 'WAVE FUNCTION MESH (dV/dt=0)' : 'KERNEL SYSTEM'}</span>
                  <span>{log.time}</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap leading-tight">
                  {typeof log.payload === 'object' ? JSON.stringify(log.payload, null, 2) : String(log.payload)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


