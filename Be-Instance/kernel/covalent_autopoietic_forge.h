/* kernel/covalent_autopoietic_forge.h */
#ifndef COVALENT_AUTOPOIETIC_FORGE_H
#define COVALENT_AUTOPOIETIC_FORGE_H

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
    uint32_t organelles_forged;
    bool forge_active;
} autopoietic_forge_state_t;

void forge_init(autopoietic_forge_state_t *state);
bool forge_synthesize_organelle(autopoietic_forge_state_t *state, void **kernel_memory_ptr, q16_t validation_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_AUTOPOIETIC_FORGE_H */

