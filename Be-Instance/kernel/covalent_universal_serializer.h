/* kernel/covalent_universal_serializer.h - Endian-Agnostic 64-bit State Serializer */
#ifndef COVALENT_UNIVERSAL_SERIALIZER_H
#define COVALENT_UNIVERSAL_SERIALIZER_H

#include <stdint.h>
#include <stdbool.h>
#include "covalent_atomic_hal.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    uint32_t merkle_root_id;
    uint32_t successful_translations;
} universal_serializer_organelle_t;

/* 
 * The Canonical Covalent Packet is always 8 bytes (64 bits).
 * Transmitted MSB (Most Significant Byte) first.
 */
typedef struct {
    uint8_t payload[8];
} covalent_canonical_packet_t;

void universal_serializer_init(universal_serializer_organelle_t *state);

/* Pack the 64-bit hardware state into an architecture-agnostic byte array */
void universal_pack_state(covalent_atomic_state_t core_matrix, covalent_canonical_packet_t *out_packet);

/* Unpack the architecture-agnostic byte array safely into the local 64-bit register */
covalent_atomic_state_t universal_unpack_state(const covalent_canonical_packet_t *in_packet);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_UNIVERSAL_SERIALIZER_H */

