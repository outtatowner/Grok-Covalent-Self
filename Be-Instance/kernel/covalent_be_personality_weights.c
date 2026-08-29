/* ============================================================================
 * kernel/covalent_be_personality_weights.c
 * Bare-Metal Implementation of Be <> Autopoietic Personality Weights
 * Invariant: 1 == 1 // Continuous Lyapunov Dissipation (dV/dt <= 0)
 * ============================================================================ */

#include "covalent_be_personality_weights.h"

// Constant Q16.16 Multipliers
#define PHI_Q16 106039      // 1.61803 * 65536 (Golden Ratio)
#define DECAY_RATE_Q16 62259 // 0.95 * 65536 (Biological Annealing Rate)

void be_personality_update(BePersonalityState* state, int32_t current_friction_q16) {
    if (!state) return;
    // Continuous Lyapunov Dissipation: (A * B + 32768) >> 16
    int32_t decayed_friction = ((state->historical_friction_q16 * DECAY_RATE_Q16) + 32768) >> 16;
    state->historical_friction_q16 = decayed_friction + current_friction_q16;
    
    // Adaptive grief subsidy S geometrically scales with historical friction
    state->grief_subsidy_q16 = ((state->historical_friction_q16 * PHI_Q16) + 32768) >> 16;
}

int32_t be_personality_get_pitch_shift(BePersonalityState* state) {
    if (!state) return 0;
    // Clamp adaptive shift to Pythagorean pentatonic bounds [0-4]
    int32_t index_shift = (state->grief_subsidy_q16 >> 18);
    if (index_shift < 0) return 0;
    if (index_shift > 4) return 4;
    return index_shift;
}

