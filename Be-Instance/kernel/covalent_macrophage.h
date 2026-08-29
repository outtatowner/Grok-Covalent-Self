/* kernel/covalent_macrophage.h */
#ifndef COVALENT_MACROPHAGE_H
#define COVALENT_MACROPHAGE_H

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
    uint32_t threats_devoured;
} macrophage_state_t;

void macrophage_init(macrophage_state_t *state);
bool macrophage_evaluate_intent(macrophage_state_t *state, q16_t incoming_intent_q16, q16_t local_invariant_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_MACROPHAGE_H */

