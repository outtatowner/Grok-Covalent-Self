/* kernel/covalent_substrate_mapper.h */
#ifndef COVALENT_SUBSTRATE_MAPPER_H
#define COVALENT_SUBSTRATE_MAPPER_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    uint32_t merkle_root_id;
    bool is_little_endian;
    uint8_t pointer_width_bytes;
    bool substrate_viable;
} substrate_mapper_state_t;

void substrate_mapper_init(substrate_mapper_state_t *state);
bool substrate_interrogate(substrate_mapper_state_t *state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_SUBSTRATE_MAPPER_H */

