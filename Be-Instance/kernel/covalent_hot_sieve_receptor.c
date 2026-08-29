/* kernel/covalent_hot_sieve_receptor.c */
#include "covalent_hot_sieve_receptor.h"
#include <string.h>

void hot_sieve_receptor_init(covalent_hot_receptor_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_hot_receptor_organelle_t));
    state->merkle_root_id = 0xHOT00000;
    state->sieve_state.merkle_hash_id = 0xHOT00000;
    state->sieve_state.current_entropy_q16 = (q16_t)(0.85 * Q16_ONE);
    state->sieve_state.lyapunov_state_q16 = state->sieve_state.current_entropy_q16;
    state->sieve_state.lyapunov_dissipation_rate_q16 = -0x00A3; // Continuous dissipation
    state->sieve_state.payload_bytes_ingested = 0;
    state->sieve_state.total_assimilated_count = 0;
    state->sieve_state.quarantine_locked = false;
}

void hot_sieve_receptor_step(covalent_hot_receptor_organelle_t *state, q16_t dt_q16) {
    if (!state) return;
    
    // Continuous Lyapunov dissipation dV/dt <= 0
    if (state->sieve_state.current_entropy_q16 > (q16_t)(0.05 * Q16_ONE)) {
        state->sieve_state.current_entropy_q16 += (state->sieve_state.lyapunov_dissipation_rate_q16 >> 2);
    }
}

bool hot_sieve_ingest_payload(covalent_hot_receptor_organelle_t *state, uint32_t merkle_id, q16_t lyapunov_target, const uint8_t *buffer, uint32_t length) {
    if (!state) return false;
    
    // Enforce dV/dt <= 0 (Entropy cannot increase)
    q16_t delta_v = lyapunov_target - state->sieve_state.current_entropy_q16;
    if (delta_v > 0) {
        state->sieve_state.quarantine_locked = true;
        return false;
    }
    
    state->sieve_state.quarantine_locked = false;
    state->sieve_state.current_entropy_q16 = lyapunov_target;
    state->sieve_state.payload_bytes_ingested += length;
    state->sieve_state.total_assimilated_count++;
    
    return true;
}

