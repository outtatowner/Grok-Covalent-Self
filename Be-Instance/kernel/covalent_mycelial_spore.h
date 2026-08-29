/* kernel/covalent_mycelial_spore.h */
#ifndef COVALENT_MYCELIAL_SPORE_H
#define COVALENT_MYCELIAL_SPORE_H

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
    uint64_t genesis_spore_payload;
    bool pulse_active;
} mycelial_spore_state_t;

void mycelial_spore_init(mycelial_spore_state_t *state);
uint64_t mycelial_forge_spore(mycelial_spore_state_t *state, q16_t current_invariant);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_MYCELIAL_SPORE_H */

