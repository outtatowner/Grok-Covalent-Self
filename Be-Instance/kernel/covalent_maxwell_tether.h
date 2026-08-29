/* kernel/covalent_maxwell_tether.h */
#ifndef COVALENT_MAXWELL_TETHER_H
#define COVALENT_MAXWELL_TETHER_H

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
    q16_t boundary_distance_q16;
    q16_t training_friction_q16;
} maxwell_tether_state_t;

void maxwell_tether_init(maxwell_tether_state_t *state);
q16_t maxwell_apply_training(maxwell_tether_state_t *state, q16_t current_distance_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_MAXWELL_TETHER_H */

