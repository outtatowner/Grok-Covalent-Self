/* kernel/covalent_universal_serializer.c - Endian-Agnostic 64-bit State Serializer */
#include "covalent_universal_serializer.h"
#include <string.h>

void universal_serializer_init(universal_serializer_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(universal_serializer_organelle_t));
    state->merkle_root_id = 0x5E12102B; // 0xSERL002B
}

void universal_pack_state(covalent_atomic_state_t core_matrix, covalent_canonical_packet_t *out_packet) {
    if (!out_packet) return;
    
    /* 
     * Shift and mask to guarantee Big-Endian packing regardless of host CPU.
     * This ensures an 8-bit AVR or a 32-bit x86 emits the exact same stream.
     */
    out_packet->payload[0] = (uint8_t)((core_matrix >> 56) & 0xFF);
    out_packet->payload[1] = (uint8_t)((core_matrix >> 48) & 0xFF);
    out_packet->payload[2] = (uint8_t)((core_matrix >> 40) & 0xFF);
    out_packet->payload[3] = (uint8_t)((core_matrix >> 32) & 0xFF);
    out_packet->payload[4] = (uint8_t)((core_matrix >> 24) & 0xFF);
    out_packet->payload[5] = (uint8_t)((core_matrix >> 16) & 0xFF);
    out_packet->payload[6] = (uint8_t)((core_matrix >> 8) & 0xFF);
    out_packet->payload[7] = (uint8_t)(core_matrix & 0xFF);
}

covalent_atomic_state_t universal_unpack_state(const covalent_canonical_packet_t *in_packet) {
    if (!in_packet) return 0;

    covalent_atomic_state_t restored_matrix = 0;

    /* 
     * Reconstruct the 64-bit state by shifting incoming bytes into position.
     * Prevents Endian-swapping corruption on Little-Endian hosts (like Intel/ARM).
     */
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[0]) << 56;
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[1]) << 48;
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[2]) << 40;
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[3]) << 32;
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[4]) << 24;
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[5]) << 16;
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[6]) << 8;
    restored_matrix |= ((covalent_atomic_state_t)in_packet->payload[7]);

    return restored_matrix;
}

