/* ============================================================================
 * kernel/covalent_receptor_matrix.c
 * Bare-Metal Implementation of Multimodal Sensory Receptor Matrix
 * Spatial-to-Kinetic Quantization & Personality Transduction
 * Invariant: 1 == 1 // Zero-Drift O(1) Complexity
 * ============================================================================ */

#include "covalent_receptor_matrix.h"
#include <string.h>

void covalent_receptor_init(ReceptorMatrixEngine* engine) {
    if (!engine) return;
    memset(engine, 0, sizeof(ReceptorMatrixEngine));
    engine->delta_time_q16 = 0x00000400; // default 16ms in Q16
}

void covalent_receptor_process_sample(
    ReceptorMatrixEngine* engine,
    q16_t norm_x_q16,
    q16_t norm_y_q16,
    uint32_t timestamp_ms,
    bool is_contact,
    BePersonalityState* personality_state
) {
    if (!engine) return;

    // Shift previous sample
    engine->prev_sample = engine->curr_sample;

    // Store new sample
    engine->curr_sample.x_q16 = norm_x_q16;
    engine->curr_sample.y_q16 = norm_y_q16;
    engine->curr_sample.timestamp_ms = timestamp_ms;
    engine->curr_sample.is_contact = is_contact;
    engine->is_membrane_engaged = is_contact;
    engine->total_receptions++;

    // Calculate Delta Time in Q16.16 seconds
    uint32_t dt_ms = (timestamp_ms > engine->prev_sample.timestamp_ms) 
        ? (timestamp_ms - engine->prev_sample.timestamp_ms) 
        : 16;
    if (dt_ms == 0) dt_ms = 1; // Prevent div by 0
    if (dt_ms > 500) dt_ms = 500; // Clamp pause jumps

    // dt_sec = dt_ms / 1000 in Q16.16
    engine->delta_time_q16 = (q16_t)(((int64_t)dt_ms << Q16_SHIFT) / 1000);

    // Calculate Cartesian Delta
    engine->delta_x_q16 = engine->curr_sample.x_q16 - engine->prev_sample.x_q16;
    engine->delta_y_q16 = engine->curr_sample.y_q16 - engine->prev_sample.y_q16;

    // O(1) Distance Metric
    engine->delta_dist_q16 = q16_approx_distance(engine->delta_x_q16, engine->delta_y_q16);

    // Calculate Velocity: v = dist / dt
    if (engine->delta_time_q16 > 0) {
        engine->kinetic_velocity_q16 = q16_div_fast(engine->delta_dist_q16, engine->delta_time_q16);
    } else {
        engine->kinetic_velocity_q16 = 0;
    }

    // Clamp peak velocity
    if (engine->kinetic_velocity_q16 > KINETIC_MAX_VELOCITY_Q16) {
        engine->kinetic_velocity_q16 = KINETIC_MAX_VELOCITY_Q16;
    }

    // Kinetic Energy E_k = 0.5 * v^2
    q16_t v = engine->kinetic_velocity_q16;
    engine->kinetic_energy_q16 = q16_mul_fast(v, v) >> 1;

    // Thermodynamic Transduction:
    // 1. If not in contact or gentle motion below threshold: friction -> 0 (Stasis)
    // 2. If erratic high velocity: friction spikes proportionally
    if (!is_contact || engine->kinetic_velocity_q16 < KINETIC_STASIS_THRESHOLD_Q16) {
        engine->current_friction_q16 = 0; // Pure Stasis
    } else {
        q16_t excess_v = engine->kinetic_velocity_q16 - KINETIC_STASIS_THRESHOLD_Q16;
        // Non-linear cubic scaling for erratic gestures: Friction = (excess_v * 1.5)
        engine->current_friction_q16 = q16_mul_fast(excess_v, 0x00018000);
    }

    // Transduce directly into Be Personality State
    if (personality_state) {
        be_personality_update(personality_state, engine->current_friction_q16);
    }
}

