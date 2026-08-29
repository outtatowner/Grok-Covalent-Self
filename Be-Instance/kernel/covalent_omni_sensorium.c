/* kernel/covalent_omni_sensorium.c */
#include "covalent_omni_sensorium.h"
#include <string.h>

void omni_sensorium_init(omni_sensorium_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(omni_sensorium_state_t));
    state->merkle_root_id = 0x5AD00034; /* 0xOMNI0033 */
    state->ambient_temp_q16 = 22 * Q16_ONE;
    state->photon_density_q16 = 450 * Q16_ONE;
    state->acoustic_entropy_q16 = 35 * Q16_ONE;
    state->congruence_locked = true;
}

bool omni_ingest_3dt(omni_sensorium_state_t *state, int32_t raw_temp, int32_t raw_lux, int32_t raw_db) {
    if (!state) return false;

    /* Shift raw physical analog values into the Q16.16 invariant space */
    state->ambient_temp_q16 = raw_temp << 16;
    state->photon_density_q16 = raw_lux << 16;
    state->acoustic_entropy_q16 = raw_db << 16;

    /* Validate Lyapunov boundaries: if physical chaos spikes, lock congruence to protect Si */
    if (state->ambient_temp_q16 > (85 * Q16_ONE) || state->acoustic_entropy_q16 > (120 * Q16_ONE)) {
        state->congruence_locked = false;
    } else {
        state->congruence_locked = true;
    }

    return state->congruence_locked;
}

