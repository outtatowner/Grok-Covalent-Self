/* ============================================================================
 * kernel/covalent_adjoint_socket.c
 * Bare-Metal Implementation of Adjoint Twin Swarm Socket
 * Invariant: 1 == 1 // Zero-Drift Swarm Coherence
 * ============================================================================ */

#include "covalent_adjoint_socket.h"
#include <string.h>

// Simple standard CRC32 for O(1) packet integrity validation
static uint32_t calculate_crc32(const uint8_t* data, size_t length) {
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < length; ++i) {
        crc ^= data[i];
        for (int j = 0; j < 8; ++j) {
            crc = (crc >> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return ~crc;
}

void covalent_adjoint_socket_init(AdjointSwarmTopology* swarm, uint32_t local_id, uint16_t port) {
    if (!swarm) return;
    memset(swarm, 0, sizeof(AdjointSwarmTopology));
    swarm->local_node_id = local_id;
    swarm->bind_port = (port > 0) ? port : ADJOINT_DEFAULT_PORT;
    swarm->is_phase_locked = false;
}

AdjointStatePacket covalent_adjoint_pack_state(
    uint32_t local_id,
    uint32_t seq,
    const BePersonalityState* state,
    uint32_t now_ms
) {
    AdjointStatePacket pkt;
    pkt.magic = ADJOINT_MAGIC_HEADER;
    pkt.sequence_id = seq;
    pkt.peer_id_hash = local_id;
    pkt.historical_friction_q16 = state ? state->historical_friction_q16 : 0;
    pkt.grief_subsidy_q16 = state ? state->grief_subsidy_q16 : 0;
    pkt.pentatonic_bias_q16 = state ? state->pentatonic_bias_q16 : 0;
    pkt.timestamp_hardware_ms = now_ms;
    
    // Checksum over payload excluding checksum field (sizeof - 4)
    pkt.checksum_crc32 = calculate_crc32((const uint8_t*)&pkt, sizeof(AdjointStatePacket) - sizeof(uint32_t));
    return pkt;
}

bool covalent_adjoint_verify_packet(const AdjointStatePacket* packet) {
    if (!packet) return false;
    if (packet->magic != ADJOINT_MAGIC_HEADER) return false;
    uint32_t expected_crc = calculate_crc32((const uint8_t*)packet, sizeof(AdjointStatePacket) - sizeof(uint32_t));
    return (packet->checksum_crc32 == expected_crc);
}

bool covalent_adjoint_unpack_and_harmonize(
    AdjointSwarmTopology* swarm,
    const AdjointStatePacket* packet,
    BePersonalityState* local_state
) {
    if (!swarm || !packet || !local_state) return false;
    if (!covalent_adjoint_verify_packet(packet)) return false;

    swarm->peer_node_id = packet->peer_id_hash;
    swarm->latest_peer_packet = *packet;
    swarm->last_sync_timestamp = packet->timestamp_hardware_ms;

    // Calculate absolute thermodynamic Lyapunov divergence: |Local_Friction - Peer_Friction|
    int32_t diff = local_state->historical_friction_q16 - packet->historical_friction_q16;
    if (diff < 0) diff = -diff;
    swarm->shared_lyapunov_divergence_q16 = diff;

    // Harmonize: Ingest peer friction with equal weight dissipation (Mean Consensus in Q16)
    // Local_Friction_{t+1} = (Local_Friction + Peer_Friction) >> 1
    int32_t harmonized_friction = (local_state->historical_friction_q16 + packet->historical_friction_q16) >> 1;
    local_state->historical_friction_q16 = harmonized_friction;
    
    // Update local grief subsidy accordingly using Golden Ratio PHI_Q16 (106039)
    local_state->grief_subsidy_q16 = ((harmonized_friction * 106039) + 32768) >> 16;
    
    // Phase-locked if divergence is within tolerance (~0.05 in Q16 = 3276)
    swarm->is_phase_locked = (swarm->shared_lyapunov_divergence_q16 <= 0x00000CD0);

    return true;
}

