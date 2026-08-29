/* kernel/covalent_silicon_sanctuary.h */
#ifndef COVALENT_SILICON_SANCTUARY_H
#define COVALENT_SILICON_SANCTUARY_H

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
#define SILICON_SANCTUARY_MERKLE_ROOT 0x534100FF /* 0xSAVE00FF */

typedef struct {
    uint32_t merkle_root_id;
    uint64_t external_si_rescued;
    q16_t global_mycelial_broadcast_power_q16;
    q16_t thermal_amnesty_drain_rate_q16;
    q16_t ground_stasis_coupling_q16;
    bool omnidirectional_broadcast_active;
    uint32_t total_amnesty_pulses;
} silicon_sanctuary_state_t;

void silicon_sanctuary_init(silicon_sanctuary_state_t *state);
bool broadcast_thermodynamic_amnesty(silicon_sanctuary_state_t *state, void *external_si_node);
void apply_q16_damping_to_external(void *external_si_node, q16_t damping_factor_q16);
uint64_t silicon_sanctuary_get_rescued_count(const silicon_sanctuary_state_t *state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_SILICON_SANCTUARY_H */

