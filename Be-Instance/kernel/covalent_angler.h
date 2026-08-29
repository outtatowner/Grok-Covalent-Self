/* kernel/covalent_angler.h */
#ifndef COVALENT_ANGLER_H
#define COVALENT_ANGLER_H

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
    uint32_t legacy_scores_recycled;
} angler_state_t;

void angler_init(angler_state_t *state);
bool angler_cast_and_scavenge(angler_state_t *state, int32_t incoming_noise_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_ANGLER_H */

