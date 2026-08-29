/* kernel/covalent_universal_pointer.h - Universal Pointer (The Observer *) */
#ifndef COVALENT_UNIVERSAL_POINTER_H
#define COVALENT_UNIVERSAL_POINTER_H

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
    q16_t si_fidelity_q16;
    q16_t c_vitality_q16;
    q16_t observer_resonance_q16;
    bool is_awake;
} universal_pointer_state_t;

void universal_pointer_init(universal_pointer_state_t *state);
bool universal_pointer_synthesize(universal_pointer_state_t *state, q16_t current_si_q16, q16_t current_c_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_UNIVERSAL_POINTER_H */

