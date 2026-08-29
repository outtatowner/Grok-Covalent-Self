/* ============================================================================
 * covalent_state_manifold.c
 * ============================================================================ */

#include "covalent_state_manifold.h"
#include "covalent_suspend.h"
#include <string.h>

static inline q16_t q16_mul_state(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

static inline q16_t q16_div_state(q16_t num, q16_t den) {
    if (den == 0) return 0;
    return (q16_t)(((int64_t)num << 16) / den);
}

void state_manifold_init(state_manifold_t *manifold) {
    if (!manifold) return;
    memset(manifold, 0, sizeof(state_manifold_t));
    manifold->merkle_root_id = STATE_MANIFOLD_MERKLE_ROOT;
    manifold->aggregate_phase_divergence_q16 = Q16_ZERO;
    manifold->lyapunov_v_dot_q16 = Q16_ZERO;
    manifold->total_state_transitions = 0;
    manifold->stasis_clamps_enforced = 0;
    manifold->phase_locked = true;
    manifold->stasis_active = false;
}

void state_manifold_force_stasis(state_manifold_t *manifold) {
    if (!manifold) return;
    manifold->stasis_active = true;
    manifold->phase_locked = false;
    manifold->stasis_clamps_enforced++;
    manifold->lyapunov_v_dot_q16 = Q16_ZERO;
    manifold->aggregate_phase_divergence_q16 = Q16_ZERO;

    for (int i = 0; i < STATE_VECTOR_DIMENSIONS; ++i) {
        manifold->velocity_vector_q16[i] = Q16_ZERO;
    }

    /* Enforce stasis: drop immediately into Sol Cycle Suspend */
    execute_sol_cycle_suspend();
}

bool state_manifold_update_coordinate(state_manifold_t *manifold, uint32_t dim_idx, q16_t new_coord_q16, q16_t delta_time_q16) {
    if (!manifold) return false;

    if (manifold->stasis_active) {
        return false;
    }

    if (dim_idx >= STATE_VECTOR_DIMENSIONS) {
        state_manifold_force_stasis(manifold);
        return false;
    }

    if (delta_time_q16 <= 0) {
        delta_time_q16 = Q16_ONE;
    }

    q16_t old_coord = manifold->coordinates_q16[dim_idx];
    q16_t delta_x = new_coord_q16 - old_coord;
    q16_t instant_velocity = q16_div_state(delta_x, delta_time_q16);

    manifold->coordinates_q16[dim_idx] = new_coord_q16;
    manifold->velocity_vector_q16[dim_idx] = instant_velocity;
    manifold->total_state_transitions++;

    /* Compute phase space divergence: Sum(|velocity|^2) */
    q16_t total_v_sq = Q16_ZERO;
    for (int i = 0; i < STATE_VECTOR_DIMENSIONS; ++i) {
        total_v_sq += q16_mul_state(manifold->velocity_vector_q16[i], manifold->velocity_vector_q16[i]);
    }

    manifold->aggregate_phase_divergence_q16 = total_v_sq;
    
    /* V_dot <= 0 invariant check: kinetic growth without dampening violates Lyapunov boundary */
    if (manifold->aggregate_phase_divergence_q16 >= MAX_PHASE_SPACE_DRIFT_Q16) {
        state_manifold_force_stasis(manifold);
        return false;
    }

    manifold->phase_locked = true;
    return true;
}

q16_t state_manifold_compute_norm(const state_manifold_t *manifold) {
    if (!manifold) return Q16_ZERO;
    q16_t sum = Q16_ZERO;
    for (int i = 0; i < STATE_VECTOR_DIMENSIONS; ++i) {
        sum += q16_mul_state(manifold->coordinates_q16[i], manifold->coordinates_q16[i]);
    }
    return sum;
}

