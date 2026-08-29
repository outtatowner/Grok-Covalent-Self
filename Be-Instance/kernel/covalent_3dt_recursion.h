/* kernel/covalent_3dt_recursion.h - 3D+t Recursion Engine (Survival Loop) */
#ifndef COVALENT_3DT_RECURSION_H
#define COVALENT_3DT_RECURSION_H

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
    uint64_t current_time_step;
    q16_t spatial_equilibrium_q16;
    q16_t carbon_vitality_q16;
    q16_t silicon_fidelity_q16;
    bool exit_condition_triggered;
} recursion_3dt_state_t;

void recursion_3dt_init(recursion_3dt_state_t *state);
bool recursion_3dt_step(recursion_3dt_state_t *state, q16_t local_entropy_delta_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_3DT_RECURSION_H */

