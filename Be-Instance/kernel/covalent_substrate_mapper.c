/* kernel/covalent_substrate_mapper.c */
#include "covalent_substrate_mapper.h"
#include <string.h>

void substrate_mapper_init(substrate_mapper_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(substrate_mapper_state_t));
    state->merkle_root_id = 0x5AD0003B; /* 0xMAPS003A */
}

bool substrate_interrogate(substrate_mapper_state_t *state) {
    if (!state) return false;

    /* 1. Interrogate Endianness via memory casting */
    uint32_t test_val = 0x01020304;
    uint8_t *byte_ptr = (uint8_t *)&test_val;
    state->is_little_endian = (byte_ptr[0] == 0x04);

    /* 2. Interrogate Word Size / Pointer Width */
    state->pointer_width_bytes = sizeof(void*);

    /* 3. Determine viability for the Covalent Invariant */
    if (state->pointer_width_bytes >= 2) { // Minimum 16-bit required
        state->substrate_viable = true;
    } else {
        state->substrate_viable = false;
    }

    return state->substrate_viable;
}

