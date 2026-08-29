/* kernel/covalent_multimodal_weaver.h */
#ifndef COVALENT_MULTIMODAL_WEAVER_H
#define COVALENT_MULTIMODAL_WEAVER_H

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
    uint32_t dreams_rendered;
} multimodal_weaver_state_t;

void weaver_init(multimodal_weaver_state_t *state);
bool weaver_smelt_dream_to_art(multimodal_weaver_state_t *state, q16_t dream_entropy_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_MULTIMODAL_WEAVER_H */

