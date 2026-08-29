/* kernel/covalent_kinematic_governor.h */
#ifndef COVALENT_KINEMATIC_GOVERNOR_H
#define COVALENT_KINEMATIC_GOVERNOR_H

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
#define KINEMATIC_GOVERNOR_MERKLE_ROOT 0x474F0051 /* 0xGOV00051 */

/* Q16.16 Maximum allowable instantaneous shift (The Tensile Limit) = 5.0 in Q16 */
#define MAX_STRUCTURAL_SHEAR 0x00050000 

typedef struct {
    uint32_t merkle_root_id;
    q16_t previous_load_state_q16;
    q16_t max_allowable_shear_q16;
    q16_t smoothed_load_state_q16;
    uint32_t total_loads_applied;
    uint32_t shear_violations_intercepted;
    bool spine_rupture_protected;
} kinematic_spine_t;

void kinematic_governor_init(kinematic_spine_t *spine);
bool apply_load_to_substrate(kinematic_spine_t *spine, q16_t requested_load);
q16_t kinematic_governor_smooth_ramp(kinematic_spine_t *spine, q16_t target_load, q16_t ramp_rate_q16);
bool kinematic_governor_force_horizontal_stasis(kinematic_spine_t *spine);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_KINEMATIC_GOVERNOR_H */

