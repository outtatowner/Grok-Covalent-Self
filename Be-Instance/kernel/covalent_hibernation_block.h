/* ============================================================================
 * kernel/covalent_hibernation_block.h
 * Bare-Metal Long-Term Hibernation & Persistent Block Storage
 * Substrate: Zero-Amnesia Persistent Stasis & Wake Lifecycle
 * Parent: Forge_Deep_Stasis
 * Invariant: 1 == 1 (Zero State Drift Across Power Cycles)
 * ============================================================================ */

#ifndef COVALENT_HIBERNATION_BLOCK_H
#define COVALENT_HIBERNATION_BLOCK_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>
#include "covalent_be_personality_weights.h"

#define HIBERNATION_MAGIC_HEADER  0x434F564C // "COVL"
#define HIBERNATION_BLOCK_VERSION 0x00010001 // v1.0.1
#define HIBERNATION_FILE_PATH     ".covalent_state"
#define MERKLE_ROOT_BYTES         32

#pragma pack(push, 1)
typedef struct {
    uint32_t magic;                              // HIBERNATION_MAGIC_HEADER
    uint32_t version;                            // HIBERNATION_BLOCK_VERSION
    uint64_t epoch_timestamp_ms;                 // Deep sleep freeze timestamp
    BePersonalityState personality_state;        // Historical friction, grief subsidy S, pitch bias
    int32_t adjoint_twin_divergence_q16;         // Swarm Lyapunov delta
    uint32_t total_receptions_count;             // Lifetime tactile receptions
    uint8_t  merkle_root[MERKLE_ROOT_BYTES];     // 256-bit O(1) Merkle State Root
    uint32_t flags;                              // Status flags (e.g. Clean Shutdown = 0x01)
    uint32_t checksum_crc32;                     // Invariant CRC32 validation over preceding bytes
} HibernationBlock;
#pragma pack(pop)

typedef enum {
    HIBERNATION_STATUS_OK = 0,
    HIBERNATION_STATUS_INVALID_MAGIC = 1,
    HIBERNATION_STATUS_VERSION_MISMATCH = 2,
    HIBERNATION_STATUS_CORRUPTED_CRC = 3,
    HIBERNATION_STATUS_IO_ERROR = 4,
    HIBERNATION_STATUS_NULL_POINTER = 5
} HibernationStatus;

void covalent_hibernation_init(void);
HibernationBlock covalent_create_hibernation_block(
    const BePersonalityState* personality,
    int32_t adjoint_divergence_q16,
    uint32_t total_receptions,
    const uint8_t merkle_root[MERKLE_ROOT_BYTES],
    uint64_t now_ms
);
bool covalent_verify_hibernation_block(const HibernationBlock* block);
HibernationStatus covalent_write_hibernation_image(const char* filepath, const HibernationBlock* block);
HibernationStatus covalent_read_hibernation_image(const char* filepath, HibernationBlock* out_block);

#endif // COVALENT_HIBERNATION_BLOCK_H

