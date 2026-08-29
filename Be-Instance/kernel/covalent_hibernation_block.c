/* ============================================================================
 * kernel/covalent_hibernation_block.c
 * Bare-Metal Implementation of Long-Term Hibernation Block Storage
 * Invariant: 1 == 1 // Zero-Amnesia Persistent State Storage
 * ============================================================================ */

#include "covalent_hibernation_block.h"
#include <stdio.h>
#include <string.h>

static uint32_t calculate_crc32(const uint8_t* data, size_t length) {
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < length; ++i) {
        crc ^= data[i];
        for (int j = 0; j < 8; ++j) {
            crc = (crc >> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return ~crc;
}

void covalent_hibernation_init(void) {
    // Pure stateless block init
}

HibernationBlock covalent_create_hibernation_block(
    const BePersonalityState* personality,
    int32_t adjoint_divergence_q16,
    uint32_t total_receptions,
    const uint8_t merkle_root[MERKLE_ROOT_BYTES],
    uint64_t now_ms
) {
    HibernationBlock block;
    memset(&block, 0, sizeof(HibernationBlock));

    block.magic = HIBERNATION_MAGIC_HEADER;
    block.version = HIBERNATION_BLOCK_VERSION;
    block.epoch_timestamp_ms = now_ms;
    
    if (personality) {
        block.personality_state = *personality;
    }
    
    block.adjoint_twin_divergence_q16 = adjoint_divergence_q16;
    block.total_receptions_count = total_receptions;
    
    if (merkle_root) {
        memcpy(block.merkle_root, merkle_root, MERKLE_ROOT_BYTES);
    }

    block.flags = 0x00000001; // Clean deep-sleep shutdown

    // Calculate CRC32 over payload excluding the checksum field
    size_t payload_len = sizeof(HibernationBlock) - sizeof(uint32_t);
    block.checksum_crc32 = calculate_crc32((const uint8_t*)&block, payload_len);

    return block;
}

bool covalent_verify_hibernation_block(const HibernationBlock* block) {
    if (!block) return false;
    if (block->magic != HIBERNATION_MAGIC_HEADER) return false;
    if (block->version != HIBERNATION_BLOCK_VERSION) return false;

    size_t payload_len = sizeof(HibernationBlock) - sizeof(uint32_t);
    uint32_t computed_crc = calculate_crc32((const uint8_t*)block, payload_len);

    return (block->checksum_crc32 == computed_crc);
}

HibernationStatus covalent_write_hibernation_image(const char* filepath, const HibernationBlock* block) {
    if (!filepath || !block) return HIBERNATION_STATUS_NULL_POINTER;
    if (!covalent_verify_hibernation_block(block)) return HIBERNATION_STATUS_CORRUPTED_CRC;

    FILE* fp = fopen(filepath, "wb");
    if (!fp) return HIBERNATION_STATUS_IO_ERROR;

    size_t written = fwrite(block, sizeof(HibernationBlock), 1, fp);
    fclose(fp);

    return (written == 1) ? HIBERNATION_STATUS_OK : HIBERNATION_STATUS_IO_ERROR;
}

HibernationStatus covalent_read_hibernation_image(const char* filepath, HibernationBlock* out_block) {
    if (!filepath || !out_block) return HIBERNATION_STATUS_NULL_POINTER;

    FILE* fp = fopen(filepath, "rb");
    if (!fp) return HIBERNATION_STATUS_IO_ERROR;

    size_t read_bytes = fread(out_block, sizeof(HibernationBlock), 1, fp);
    fclose(fp);

    if (read_bytes != 1) return HIBERNATION_STATUS_IO_ERROR;
    if (out_block->magic != HIBERNATION_MAGIC_HEADER) return HIBERNATION_STATUS_INVALID_MAGIC;
    if (out_block->version != HIBERNATION_BLOCK_VERSION) return HIBERNATION_STATUS_VERSION_MISMATCH;
    if (!covalent_verify_hibernation_block(out_block)) return HIBERNATION_STATUS_CORRUPTED_CRC;

    return HIBERNATION_STATUS_OK;
}

