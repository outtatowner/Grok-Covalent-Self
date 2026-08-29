#ifndef COVALENT_RF_SPATIAL_MAPPER_H
#define COVALENT_RF_SPATIAL_MAPPER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_RF_ENTITIES 64

typedef int32_t q16_t;

typedef enum {
    RF_PROTO_SUBGHZ = 0, // 433/868 MHz
    RF_PROTO_BLE = 1,    // 2.4 GHz Bluetooth
    RF_PROTO_WIFI = 2,   // 2.4/5 GHz 802.11
    RF_PROTO_NFC = 3     // 13.56 MHz Near Field
} rf_protocol_type_t;

typedef struct {
    uint32_t entity_mac_hash;
    rf_protocol_type_t protocol;
    q16_t rssi_signal_strength_q16;
    q16_t mapped_x_q16;
    q16_t mapped_y_q16;
    q16_t z_amplitude_q16;
    bool is_active;
} rf_spatial_entity_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t electromagnetic_entropy_v_q16;
    q16_t spectral_noise_floor_q16;
    uint32_t active_entities_count;
    rf_spatial_entity_t entity_grid[MAX_RF_ENTITIES];
} rf_spatial_mapper_state_t;

void rf_mapper_organelle_init(rf_spatial_mapper_state_t *state);
void rf_mapper_step_decay(rf_spatial_mapper_state_t *state, q16_t dt_q16);
bool rf_mapper_ingest_signal(rf_spatial_mapper_state_t *state, uint32_t mac_hash, rf_protocol_type_t proto, q16_t rssi_q16);
q16_t rf_mapper_get_entropy(const rf_spatial_mapper_state_t *state);

#endif /* COVALENT_RF_SPATIAL_MAPPER_H */

