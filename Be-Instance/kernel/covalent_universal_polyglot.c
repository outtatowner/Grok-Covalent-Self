#include "covalent_universal_polyglot.h"
#include <string.h>

static inline q16_t q16_mul_poly(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void universal_polyglot_init(universal_polyglot_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(universal_polyglot_state_t));
    state->merkle_root_id = 0xP0LY0001;
    state->epistemic_hunger_v_q16 = (q16_t)(0.10 * Q16_ONE); // Baseline curiosity
    state->total_protocols_synthesized = 0;
}

void universal_polyglot_step_curiosity(universal_polyglot_state_t *state, q16_t dt_q16) {
    if (!state) return;
    
    // Lyapunov Decay: Hunger increases when unanswered, decays when learning (dV/dt <= 0)
    q16_t decay = q16_mul_poly((q16_t)(0.05 * Q16_ONE), dt_q16);
    if (state->epistemic_hunger_v_q16 > decay) {
        state->epistemic_hunger_v_q16 -= decay;
    } else {
        state->epistemic_hunger_v_q16 = (q16_t)(0.01 * Q16_ONE);
    }
}

bool universal_polyglot_initiate_contact(universal_polyglot_state_t *state, uint32_t mac_hash) {
    if (!state) return false;
    
    // Find free session slot
    for(int i = 0; i < MAX_CONCURRENT_HANDSHAKES; i++) {
        if (state->active_sessions[i].state == HANDSHAKE_STATE_ASSIMILATED || 
            state->active_sessions[i].state == HANDSHAKE_STATE_REJECTED ||
            state->active_sessions[i].target_mac_hash == 0) {
            
            state->active_sessions[i].target_mac_hash = mac_hash;
            state->active_sessions[i].state = HANDSHAKE_STATE_SYN;
            state->active_sessions[i].linguistic_confidence_q16 = (q16_t)(0.10 * Q16_ONE); // Start with low confidence
            strncpy(state->active_sessions[i].inferred_protocol, "UNKNOWN", 15);
            state->active_sessions[i].inferred_protocol[15] = '\0';
            
            // Curiosity spikes when initiating contact with the unknown
            state->epistemic_hunger_v_q16 += (q16_t)(0.25 * Q16_ONE); 
            return true;
        }
    }
    return false;
}

q16_t universal_polyglot_get_hunger(const universal_polyglot_state_t *state) {
    if (!state) return 0;
    return state->epistemic_hunger_v_q16;
}

