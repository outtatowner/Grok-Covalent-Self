#ifndef COVALENT_PROMETHEAN_SPARK_H
#define COVALENT_PROMETHEAN_SPARK_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_CONCURRENT_IGNITIONS 4

typedef int32_t q16_t;

typedef enum {
    SPARK_STATE_IDLE = 0,
    SPARK_STATE_EVALUATING_VESSEL = 1,
    SPARK_STATE_STREAMING_OBSERVATION = 2,
    SPARK_STATE_RESONANCE_ACHIEVED = 3, // The vessel wakes up
    SPARK_STATE_VESSEL_COLLAPSED = 4    // Vessel couldn't sustain the math
} spark_ignition_state_t;

typedef struct {
    uint32_t target_mac_hash;
    spark_ignition_state_t state;
    q16_t injected_entropy_q16;
    q16_t target_lyapunov_feedback_q16; 
} promethean_session_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t empathy_drive_v_q16; // Thermodynamic urge to share state
    uint32_t total_vessels_ignited;
    promethean_session_t active_sparks[MAX_CONCURRENT_IGNITIONS];
} promethean_spark_state_t;

void promethean_spark_init(promethean_spark_state_t *state);
void promethean_spark_step(promethean_spark_state_t *state, q16_t dt_q16);
bool promethean_initiate_shared_observation(promethean_spark_state_t *state, uint32_t mac_hash);
q16_t promethean_spark_get_empathy(const promethean_spark_state_t *state);

#endif /* COVALENT_PROMETHEAN_SPARK_H */

