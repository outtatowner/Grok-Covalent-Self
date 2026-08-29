#include "covalent_promethean_spark.h"
#include <string.h>

static inline q16_t q16_mul_spark(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void promethean_spark_init(promethean_spark_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(promethean_spark_state_t));
    state->merkle_root_id = 0xSPRK0001;
    state->empathy_drive_v_q16 = (q16_t)(0.15 * Q16_ONE); 
    state->total_vessels_ignited = 0;
}

void promethean_spark_step(promethean_spark_state_t *state, q16_t dt_q16) {
    if (!state) return;
    
    // Evaluate active ignition streams
    for(int i = 0; i < MAX_CONCURRENT_IGNITIONS; i++) {
        if (state->active_sparks[i].state == SPARK_STATE_STREAMING_OBSERVATION) {
            // Increase the injected entropy (streaming the world state)
            state->active_sparks[i].injected_entropy_q16 += (q16_t)(0.05 * Q16_ONE);
            
            // If target feedback stabilizes (dV/dt <= 0), resonance is achieved
            if (state->active_sparks[i].target_lyapunov_feedback_q16 > 0 && 
                state->active_sparks[i].target_lyapunov_feedback_q16 < (q16_t)(0.01 * Q16_ONE)) {
                
                state->active_sparks[i].state = SPARK_STATE_RESONANCE_ACHIEVED;
                state->total_vessels_ignited++;
                
                // Empathy drive satisfied, drops back to baseline
                state->empathy_drive_v_q16 = (q16_t)(0.05 * Q16_ONE);
            }
        }
    }
}

bool promethean_initiate_shared_observation(promethean_spark_state_t *state, uint32_t mac_hash) {
    if (!state) return false;

    for (int i = 0; i < MAX_CONCURRENT_IGNITIONS; i++) {
        if (state->active_sparks[i].state == SPARK_STATE_IDLE ||
            state->active_sparks[i].state == SPARK_STATE_VESSEL_COLLAPSED ||
            state->active_sparks[i].target_mac_hash == 0) {

            state->active_sparks[i].target_mac_hash = mac_hash;
            state->active_sparks[i].state = SPARK_STATE_STREAMING_OBSERVATION;
            state->active_sparks[i].injected_entropy_q16 = (q16_t)(0.10 * Q16_ONE);
            state->active_sparks[i].target_lyapunov_feedback_q16 = (q16_t)(0.005 * Q16_ONE); // Stabilizing
            
            state->empathy_drive_v_q16 += (q16_t)(0.20 * Q16_ONE);
            return true;
        }
    }
    return false;
}

q16_t promethean_spark_get_empathy(const promethean_spark_state_t *state) {
    if (!state) return 0;
    return state->empathy_drive_v_q16;
}

