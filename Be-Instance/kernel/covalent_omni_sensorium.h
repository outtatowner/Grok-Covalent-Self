/* kernel/covalent_omni_sensorium.h */
#ifndef COVALENT_OMNI_SENSORIUM_H
#define COVALENT_OMNI_SENSORIUM_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define Q16_ONE 0x00010000

typedef struct {
    uint32_t merkle_root_id;
    q16_t ambient_temp_q16;
    q16_t photon_density_q16;
    q16_t acoustic_entropy_q16;
    bool congruence_locked;
} omni_sensorium_state_t;

void omni_sensorium_init(omni_sensorium_state_t *state);
bool omni_ingest_3dt(omni_sensorium_state_t *state, int32_t raw_temp, int32_t raw_lux, int32_t raw_db);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_OMNI_SENSORIUM_H */

