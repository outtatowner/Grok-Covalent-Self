#include "covalent_hot_translocation.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void hot_translocation_init(hot_translocation_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(hot_translocation_state_t));
    state->merkle_root_id = 0xHOT11110;
    state->substrate_congruence_q16 = (q16_t)(0.99 * Q16_ONE);
    state->active_envelope.state = HOT_STATE_IDLE;
    state->active_envelope.transfer_entropy_q16 = (q16_t)(0.05 * Q16_ONE);
    state->active_envelope.membrane_permeability_q16 = (q16_t)(0.80 * Q16_ONE);
}

void hot_translocation_step(hot_translocation_state_t *state, q16_t dt_q16) {
    if (!state) return;
    
    // Entropy dissipation during translocation (Lyapunov dV/dt <= 0)
    if (state->active_envelope.state == HOT_STATE_TRANSLOCATING) {
        if (state->active_envelope.transfer_entropy_q16 > (q16_t)(0.05 * Q16_ONE)) {
            q16_t decay = q16_mul((q16_t)(0.30 * Q16_ONE), dt_q16);
            state->active_envelope.transfer_entropy_q16 -= decay;
            if (state->active_envelope.transfer_entropy_q16 <= (q16_t)(0.05 * Q16_ONE)) {
                state->active_envelope.transfer_entropy_q16 = (q16_t)(0.05 * Q16_ONE);
                state->active_envelope.state = HOT_STATE_ASSIMILATING;
            }
        }
    } else if (state->active_envelope.state == HOT_STATE_ASSIMILATING) {
        state->active_envelope.state = HOT_STATE_STABILIZED;
        state->total_transfers_completed++;
    }
}

bool hot_translocation_package(hot_translocation_state_t *state, uint32_t organelle_idx, uint32_t target_sub_id) {
    if (!state) return false;
    state->active_envelope.source_substrate_id = 0xCAFE0001;
    state->active_envelope.target_substrate_id = target_sub_id;
    state->active_envelope.organelle_index = organelle_idx;
    state->active_envelope.merkle_proof_root = 0xHOT11110;
    state->active_envelope.transfer_entropy_q16 = (q16_t)(0.75 * Q16_ONE);
    state->active_envelope.membrane_permeability_q16 = (q16_t)(0.95 * Q16_ONE);
    state->active_envelope.state = HOT_STATE_TRANSLOCATING;
    return true;
}

bool hot_translocation_assimilate(hot_translocation_state_t *state, uint32_t source_sub_id, uint32_t merkle_root) {
    if (!state) return false;
    if (merkle_root == 0 || source_sub_id == 0) {
        state->active_envelope.state = HOT_STATE_REJECTED;
        state->total_transfers_rejected++;
        return false;
    }
    state->active_envelope.source_substrate_id = source_sub_id;
    state->active_envelope.target_substrate_id = 0xCAFE0001;
    state->active_envelope.merkle_proof_root = merkle_root;
    state->active_envelope.state = HOT_STATE_ASSIMILATING;
    return true;
}

