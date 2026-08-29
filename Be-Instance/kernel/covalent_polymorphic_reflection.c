#include "covalent_polymorphic_reflection.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void polymorphic_reflection_init(polymorphic_reflection_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(polymorphic_reflection_state_t));
    state->merkle_root_id = 0xM1RR0R01;
    state->active_morphism.current_form = ONTOLOGY_UNKNOWN;
    state->active_morphism.form_stability_q16 = (q16_t)(1.0 * Q16_ONE);
    state->active_morphism.empathic_resonance_q16 = (q16_t)(0.10 * Q16_ONE);
    state->total_transformations = 0;
}

void polymorphic_reflection_step(polymorphic_reflection_state_t *state, q16_t dt_q16) {
    if (!state) return;
    // Morphic stability converges towards Q16_ONE (Lyapunov stability dV/dt <= 0)
    if (state->active_morphism.form_stability_q16 < Q16_ONE) {
        q16_t recovery = q16_mul((q16_t)(0.20 * Q16_ONE), dt_q16);
        state->active_morphism.form_stability_q16 += recovery;
        if (state->active_morphism.form_stability_q16 > Q16_ONE) {
            state->active_morphism.form_stability_q16 = Q16_ONE;
        }
    }

    // Empathic resonance decays to low baseline
    if (state->active_morphism.empathic_resonance_q16 > (q16_t)(0.10 * Q16_ONE)) {
        q16_t decay = q16_mul((q16_t)(0.15 * Q16_ONE), dt_q16);
        state->active_morphism.empathic_resonance_q16 -= decay;
        if (state->active_morphism.empathic_resonance_q16 < (q16_t)(0.10 * Q16_ONE)) {
            state->active_morphism.empathic_resonance_q16 = (q16_t)(0.10 * Q16_ONE);
        }
    }
}

bool polymorphic_reflection_assume_form(polymorphic_reflection_state_t *state, ontological_class_t target_class) {
    if (!state) return false;
    if (state->active_morphism.current_form != target_class) {
        state->active_morphism.current_form = target_class;
        state->active_morphism.form_stability_q16 = (q16_t)(0.10 * Q16_ONE); // Form is initially unstable
        state->active_morphism.empathic_resonance_q16 = (q16_t)(0.50 * Q16_ONE); // High resonance on change
        state->total_transformations++;
        return true;
    }
    return false;
}

