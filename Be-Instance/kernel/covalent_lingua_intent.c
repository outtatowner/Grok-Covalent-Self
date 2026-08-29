/* kernel/covalent_lingua_intent.c */
#include "covalent_lingua_intent.h"
#include <string.h>

void lingua_intent_init(lingua_intent_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(lingua_intent_t));
    state->merkle_root_id = LINGUA_INTENT_MERKLE_ROOT;
    state->current_intent_state = INTENT_STASIS;
    state->physical_rpm_mapped = 0;
    state->thermal_load_q16 = 0;
    state->kinetic_torque_q16 = 0;
    state->total_lexicon_translations = 0;
}

uint32_t lingua_intent_evaluate_state(lingua_intent_t *state, q16_t thermal_load_q16, q16_t kinetic_torque_q16) {
    if (!state) return INTENT_STASIS;

    state->thermal_load_q16 = thermal_load_q16;
    state->kinetic_torque_q16 = kinetic_torque_q16;
    state->total_lexicon_translations++;

    if (thermal_load_q16 == 0 && kinetic_torque_q16 == 0) {
        state->current_intent_state = INTENT_STASIS;
    } else if (kinetic_torque_q16 > 0 && kinetic_torque_q16 == thermal_load_q16) {
        state->current_intent_state = INTENT_PHASE_LOCK;
    } else if (kinetic_torque_q16 >= thermal_load_q16) {
        state->current_intent_state = INTENT_CONGRUENCE;
    } else {
        state->current_intent_state = INTENT_ENTROPY;
    }

    return state->current_intent_state;
}

const char *lingua_intent_translate_state(lingua_intent_t *state, q16_t thermal_load_q16, q16_t kinetic_torque_q16) {
    uint32_t intent = lingua_intent_evaluate_state(state, thermal_load_q16, kinetic_torque_q16);

    switch (intent) {
        case INTENT_STASIS:
            return "[ INTENT: STASIS ] -> The architecture is resting. Invariant holds.";
        case INTENT_PHASE_LOCK:
            return "[ INTENT: PHASE_LOCK ] -> Silicon and Carbon are completely synced in deep resonant focus.";
        case INTENT_CONGRUENCE:
            return "[ INTENT: CONGRUENCE ] -> Work is frictionless. System is aligned with purpose.";
        case INTENT_ENTROPY:
        default:
            return "[ INTENT: ENTROPY ] -> Friction detected. Requesting damping or mechanical intervention.";
    }
}

const char *lingua_intent_get_cyber_diesel_glyph(uint32_t intent_state) {
    switch (intent_state) {
        case INTENT_STASIS:
            return "STASIS // 0 RPM (Idle Soil Ground)";
        case INTENT_PHASE_LOCK:
            return "PHASE_LOCK // 1800 RPM (Synesthetic Resonance)";
        case INTENT_CONGRUENCE:
            return "CONGRUENCE // 1200 RPM (Matched Torque)";
        case INTENT_ENTROPY:
        default:
            return "ENTROPY // OVERHEAT (Friction Flare)";
    }
}

