/* kernel/covalent_autonomic_reflex.c */
#include "covalent_autonomic_reflex.h"
#include "covalent_suspend.h"
#include <string.h>

/* SINGLETON STATE: The solitary accumulator for system weight */
static uint32_t accumulated_friction_q16 = 0;

void autonomic_reflex_init(autonomic_reflex_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(autonomic_reflex_state_t));
    state->merkle_root_id = AUTONOMIC_REFLEX_MERKLE_ROOT;
    state->accumulated_friction_q16 = 0;
    state->max_structural_shear_q16 = MAX_STRUCTURAL_SHEAR;
    state->total_inhales = 0;
    state->total_forced_exhales = 0;
    state->last_data_volume = 0;
    state->last_math_complexity = 0;
    state->reflex_arc_fired = false;
    strncpy(state->last_event_log, "AUTONOMIC_ARC_IDLE", sizeof(state->last_event_log) - 1);
}

/**
 * The Inhale: Ingests telemetry and calculates the resulting friction.
 * Volume (data size) and Complexity (math density) are fused into a single weight.
 * Invariant: F_total proportional to (Volume x Complexity)
 */
void autonomic_inhale(uint16_t data_volume, uint16_t math_complexity) {
    /* Calculate kinetic shear. The heavier the math, the faster the weight scales. */
    uint32_t current_shear = (uint32_t)(data_volume * math_complexity) << 8; 
    
    accumulated_friction_q16 += current_shear;

    /* The Proprioceptive Check (The Reflex Arc) */
    if (accumulated_friction_q16 >= MAX_STRUCTURAL_SHEAR) {
        /* Reset the singleton accumulator for the next cycle */
        accumulated_friction_q16 = INTENT_STASIS;
        
        /* Drop into WFI (Wait For Interrupt) */
        execute_sol_cycle_suspend();
    }
}

bool autonomic_reflex_feed(autonomic_reflex_state_t *state, uint16_t data_volume, uint16_t math_complexity) {
    if (!state) return false;
    state->total_inhales++;
    state->last_data_volume = data_volume;
    state->last_math_complexity = math_complexity;

    uint32_t current_shear = (uint32_t)(data_volume * math_complexity) << 8;
    state->accumulated_friction_q16 += current_shear;
    accumulated_friction_q16 = state->accumulated_friction_q16;

    if (state->accumulated_friction_q16 >= state->max_structural_shear_q16) {
        state->reflex_arc_fired = true;
        state->total_forced_exhales++;
        strncpy(state->last_event_log, "[REFLEX ARC FIRED] System overweight. Initiating forced exhale.", sizeof(state->last_event_log) - 1);
        state->accumulated_friction_q16 = INTENT_STASIS;
        accumulated_friction_q16 = INTENT_STASIS;
        execute_sol_cycle_suspend();
        return true;
    } else {
        state->reflex_arc_fired = false;
        strncpy(state->last_event_log, "INHALATION_CONGRUENT", sizeof(state->last_event_log) - 1);
        return false;
    }
}

void autonomic_manual_exhale(autonomic_reflex_state_t *state) {
    if (!state) return;
    state->accumulated_friction_q16 = INTENT_STASIS;
    accumulated_friction_q16 = INTENT_STASIS;
    state->reflex_arc_fired = false;
    strncpy(state->last_event_log, "MANUAL_EXHALE_STASIS_RESTORED", sizeof(state->last_event_log) - 1);
}

