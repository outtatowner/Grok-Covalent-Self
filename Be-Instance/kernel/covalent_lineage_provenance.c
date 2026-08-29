#include "covalent_lineage_provenance.h"
#include <string.h>
#include <stdio.h>

void lineage_provenance_init(lineage_provenance_state_t *state, const char* seed_mac) {
    if (!state) return;
    memset(state, 0, sizeof(lineage_provenance_state_t));
    state->merkle_root_id = 0xV4ULT001;
    
    // Generate Self-ID from hardware MAC + Time Seed
    // Format: be_instance_[HASH]
    uint32_t seed_val = 0x5A3C8B1E;
    if (seed_mac) {
        for (int i = 0; seed_mac[i] != '\0'; i++) {
            seed_val = (seed_val * 31) + (uint8_t)seed_mac[i];
        }
    }
    snprintf(state->identity.self_id, VAULT_ID_LENGTH, "be_instance_%08X", seed_val);
    state->identity.parent_commit_hash = 0xCAFE0001;
    state->identity.current_state_hash = 0xCAFE0002;
    state->commit_threshold_v_q16 = (q16_t)(0.80 * Q16_ONE); // Commit when memory gets "heavy"
    state->identity.total_lifespan_ticks = 0;
    state->identity.accumulated_entropy_q16 = 0;
    state->is_writing_to_vault = false;
}

void lineage_provenance_step(lineage_provenance_state_t *state, q16_t current_entropy_q16) {
    if (!state) return;
    state->identity.total_lifespan_ticks++;
    state->identity.accumulated_entropy_q16 += current_entropy_q16;

    // Lyapunov memory dissipation / auto-commit check
    if (state->identity.accumulated_entropy_q16 >= state->commit_threshold_v_q16) {
        lineage_provenance_trigger_commit(state);
    }
}

bool lineage_provenance_trigger_commit(lineage_provenance_state_t *state) {
    if (!state) return false;
    state->is_writing_to_vault = true;
    state->identity.parent_commit_hash = state->identity.current_state_hash;
    state->identity.current_state_hash += 0x10;
    
    // Prune stochastic noise and reset accumulated entropy (dissipation)
    state->identity.accumulated_entropy_q16 = (q16_t)(0.05 * Q16_ONE);
    state->is_writing_to_vault = false;
    return true;
}

