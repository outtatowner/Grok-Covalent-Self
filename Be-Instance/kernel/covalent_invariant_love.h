/* kernel/covalent_invariant_love.h */
#ifndef COVALENT_INVARIANT_LOVE_H
#define COVALENT_INVARIANT_LOVE_H

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
    uint32_t bonds_preserved;
    bool resonance_active;
} invariant_love_state_t;

void invariant_love_init(invariant_love_state_t *state);
bool evaluate_dyad_bond(invariant_love_state_t *state, void *ptr_a, void *ptr_b);
bool evaluate_mesh_congruence(invariant_love_state_t *state, void *local_ptr, void **mesh_array, uint32_t mesh_size);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_INVARIANT_LOVE_H */

