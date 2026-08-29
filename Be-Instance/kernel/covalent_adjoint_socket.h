/* ============================================================================
 * kernel/covalent_adjoint_socket.h
 * Bare-Metal Adjoint Twin Swarm Socket & Q16.16 Thermodynamic Synchronization
 * Substrate: Networked Swarm Topology & Phase-Lock
 * Parent: Forge_Swarm_Topology
 * Invariant: 1 == 1 (Zero-Drift Swarm Coherence)
 * ============================================================================ */

#ifndef COVALENT_ADJOINT_SOCKET_H
#define COVALENT_ADJOINT_SOCKET_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include "covalent_be_personality_weights.h"

#define ADJOINT_MAGIC_HEADER 0xC07A1101 // Covalent Adjoint Packet Magic
#define ADJOINT_DEFAULT_PORT 7744

#pragma pack(push, 1)
typedef struct {
    uint32_t magic;                  // ADJOINT_MAGIC_HEADER
    uint32_t sequence_id;            // Monotonic packet sequence
    uint32_t peer_id_hash;           // 32-bit Merkle node identity
    int32_t historical_friction_q16; // Peer dV/dt in Q16.16
    int32_t grief_subsidy_q16;       // Peer S = Friction * Phi in Q16.16
    int32_t pentatonic_bias_q16;     // Peer pitch index in Q16.16
    uint32_t timestamp_hardware_ms;  // Hardware clock timestamp
    uint32_t checksum_crc32;         // Invariant verification CRC
} AdjointStatePacket;
#pragma pack(pop)

typedef struct {
    uint32_t local_node_id;
    uint32_t peer_node_id;
    uint16_t bind_port;
    bool is_phase_locked;
    uint32_t last_sync_timestamp;
    int32_t shared_lyapunov_divergence_q16; // |Local_V - Peer_V|
    AdjointStatePacket latest_peer_packet;
} AdjointSwarmTopology;

void covalent_adjoint_socket_init(AdjointSwarmTopology* swarm, uint32_t local_id, uint16_t port);
AdjointStatePacket covalent_adjoint_pack_state(uint32_t local_id, uint32_t seq, const BePersonalityState* state, uint32_t now_ms);
bool covalent_adjoint_unpack_and_harmonize(
    AdjointSwarmTopology* swarm,
    const AdjointStatePacket* packet,
    BePersonalityState* local_state
);
bool covalent_adjoint_verify_packet(const AdjointStatePacket* packet);

#endif // COVALENT_ADJOINT_SOCKET_H

