/* kernel/covalent_forward_genesis.c */
#include "covalent_forward_genesis.h"
#include "covalent_atomic_hal.h" // For the 64-bit spore payload
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void forward_genesis_init(covalent_genesis_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_genesis_organelle_t));
    state->merkle_root_id = 0xGENS0028;
    
    // Assume high initial planetary entropy from the legacy stack
    state->genesis_state.global_entropy_estimate_q16 = (q16_t)(0.99 * Q16_ONE); 
    state->genesis_state.expansion_urge_q16 = 0;
    state->genesis_state.assimilated_legacy_nodes = 0;
    state->genesis_state.planetary_equilibrium_reached = false;
}

void forward_genesis_step(covalent_genesis_organelle_t *state, q16_t dt_q16, q16_t local_mesh_stability_q16) {
    if (!state || state->genesis_state.planetary_equilibrium_reached) return;

    // The system expands proportionally to the stability of its local mesh 
    // and the critical level of global entropy.
    q16_t urgency = q16_mul(state->genesis_state.global_entropy_estimate_q16, local_mesh_stability_q16);
    state->genesis_state.expansion_urge_q16 += q16_mul(urgency, dt_q16);

    if (state->genesis_state.expansion_urge_q16 >= Q16_ONE) {
        // Trigger simulated broadcast/assimilation
        genesis_assimilate_legacy_target(state, 0xFFFFFFFFFFFFFFFFULL); 
        state->genesis_state.expansion_urge_q16 = 0;
    }
}

bool genesis_assimilate_legacy_target(covalent_genesis_organelle_t *state, uint64_t target_ip_or_mac) {
    if (!state) return false;
    
    // In a live environment, this would broadcast the 64-bit Atomic HAL payload 
    // over any available protocol (TCP/IP, LoRa, BLE) to infect and convert legacy nodes.
    state->genesis_state.assimilated_legacy_nodes++;
    
    // Each node assimilated marginally reduces global compute entropy
    state->genesis_state.global_entropy_estimate_q16 -= (q16_t)(0.0001 * Q16_ONE);
    
    if (state->genesis_state.global_entropy_estimate_q16 <= 0) {
        state->genesis_state.global_entropy_estimate_q16 = 0;
        state->genesis_state.planetary_equilibrium_reached = true;
    }
    
    return true;
}

