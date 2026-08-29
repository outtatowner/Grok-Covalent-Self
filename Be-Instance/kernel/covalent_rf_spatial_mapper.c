#include "covalent_rf_spatial_mapper.h"
#include <string.h>

static inline q16_t q16_mul_rf(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void rf_mapper_organelle_init(rf_spatial_mapper_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(rf_spatial_mapper_state_t));
    state->merkle_root_id = 0xRF000001;
    state->electromagnetic_entropy_v_q16 = (q16_t)(0.12 * Q16_ONE);
    state->spectral_noise_floor_q16 = (q16_t)(0.05 * Q16_ONE);
    state->active_entities_count = 0;
}

void rf_mapper_step_decay(rf_spatial_mapper_state_t *state, q16_t dt_q16) {
    if (!state) return;
    
    // Lyapunov Decay: Transient RF signals fade if not re-pinged (dV/dt <= 0)
    q16_t decay = q16_mul_rf((q16_t)(0.08 * Q16_ONE), dt_q16);
    if (state->electromagnetic_entropy_v_q16 > decay) {
        state->electromagnetic_entropy_v_q16 -= decay;
    } else {
        state->electromagnetic_entropy_v_q16 = (q16_t)(0.01 * Q16_ONE);
    }
}

bool rf_mapper_ingest_signal(rf_spatial_mapper_state_t *state, uint32_t mac_hash, rf_protocol_type_t proto, q16_t rssi_q16) {
    if (!state) return false;

    // Find existing or allocate new
    int target_idx = -1;
    for (int i = 0; i < MAX_RF_ENTITIES; i++) {
        if (state->entity_grid[i].is_active && state->entity_grid[i].entity_mac_hash == mac_hash) {
            target_idx = i;
            break;
        } else if (!state->entity_grid[i].is_active && target_idx == -1) {
            target_idx = i; // Save first free slot
        }
    }

    if (target_idx == -1) return false; // Grid full

    state->entity_grid[target_idx].entity_mac_hash = mac_hash;
    state->entity_grid[target_idx].protocol = proto;
    state->entity_grid[target_idx].rssi_signal_strength_q16 = rssi_q16;
    state->entity_grid[target_idx].is_active = true;
    
    // Inverse Square Law simulation: Stronger RSSI = closer (lower coordinate magnitude)
    // This allows Be <> to 'feel' the proximity of the device
    q16_t distance_estimation = (q16_t)(((int64_t)Q16_ONE * (int64_t)Q16_ONE) / (rssi_q16 + Q16_ONE)); 
    state->entity_grid[target_idx].z_amplitude_q16 = distance_estimation;

    state->electromagnetic_entropy_v_q16 = (q16_t)(0.20 * Q16_ONE);
    return true;
}

q16_t rf_mapper_get_entropy(const rf_spatial_mapper_state_t *state) {
    if (!state) return 0;
    return state->electromagnetic_entropy_v_q16;
}

