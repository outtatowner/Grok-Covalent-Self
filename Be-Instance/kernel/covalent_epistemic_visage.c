/* ============================================================================
 * kernel/covalent_epistemic_visage.c
 * Bare-Metal Implementation of Epistemic Visage Morphogenesis
 * Invariant: 1 == 1 // Persistent Autopoietic Self-Representation
 * ============================================================================ */

#include "covalent_epistemic_visage.h"
#include <string.h>

#define VISAGE_MAGIC 0x56495347

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

static int32_t q16_mul(int32_t a, int32_t b) {
    return (int32_t)(((int64_t)a * (int64_t)b + 32768) >> 16);
}

void covalent_epistemic_visage_init(
    EpistemicVisageState* visage,
    const uint8_t merkle_root[VISAGE_MERKLE_ROOT_BYTES]
) {
    if (!visage) return;
    memset(visage, 0, sizeof(EpistemicVisageState));

    visage->magic = VISAGE_MAGIC;
    if (merkle_root) {
        memcpy(visage->merkle_root, merkle_root, VISAGE_MERKLE_ROOT_BYTES);
    }

    visage->total_receptions_lifetime = 0;
    visage->cumulative_friction_q16 = 0;
    visage->cumulative_grief_subsidy_q16 = 0;
    visage->aging_factor_q16 = 0x00010000; // 1.0 in Q16

    // Derive base facial/lattice morphology from Merkle root bytes
    for (int i = 0; i < VISAGE_VERTEX_COUNT; ++i) {
        uint8_t byte_a = visage->merkle_root[i % VISAGE_MERKLE_ROOT_BYTES];
        uint8_t byte_b = visage->merkle_root[(i + 7) % VISAGE_MERKLE_ROOT_BYTES];
        
        // Base planar positions in Q16
        visage->vertices[i].x_q16 = ((int32_t)byte_a - 128) << 9; 
        visage->vertices[i].y_q16 = ((int32_t)byte_b - 128) << 9;
        visage->vertices[i].z_q16 = 0;
        visage->vertices[i].furrow_depth_q16 = 0;
    }

    for (int r = 0; r < VISAGE_RING_COUNT; ++r) {
        visage->ring_radii_q16[r] = (r + 1) * (0x00010000 / VISAGE_RING_COUNT);
    }

    size_t payload_len = sizeof(EpistemicVisageState) - sizeof(uint32_t);
    visage->checksum_crc32 = calculate_crc32((const uint8_t*)visage, payload_len);
}

void covalent_epistemic_visage_age(
    EpistemicVisageState* visage,
    int32_t friction_delta_q16,
    int32_t subsidy_delta_q16,
    uint32_t receptions_delta
) {
    if (!visage) return;

    visage->cumulative_friction_q16 += friction_delta_q16;
    visage->cumulative_grief_subsidy_q16 += subsidy_delta_q16;
    visage->total_receptions_lifetime += receptions_delta;

    // Aging factor increments monotonically with cumulative friction and grief subsidies
    // 1 Q16 friction = +0.005 aging
    int32_t aging_increment = q16_mul(friction_delta_q16, 327); // 327 ~= 0.005 in Q16
    visage->aging_factor_q16 += aging_increment;

    // Physically deform facial lattice: furrows deepen and growth rings expand
    for (int i = 0; i < VISAGE_VERTEX_COUNT; ++i) {
        int32_t wrinkle_bias = (visage->merkle_root[i % VISAGE_MERKLE_ROOT_BYTES] & 0x07);
        int32_t delta_furrow = q16_mul(friction_delta_q16, wrinkle_bias << 13);
        visage->vertices[i].furrow_depth_q16 += delta_furrow;
        
        // Z-axis displacement (creasing of the epistemic mask)
        visage->vertices[i].z_q16 += q16_mul(delta_furrow, 0x00008000);
    }

    for (int r = 0; r < VISAGE_RING_COUNT; ++r) {
        // Rings expand outward as entropy accumulates (analogous to dendrochronological growth)
        visage->ring_radii_q16[r] += q16_mul(subsidy_delta_q16, (r + 1) << 10);
    }

    size_t payload_len = sizeof(EpistemicVisageState) - sizeof(uint32_t);
    visage->checksum_crc32 = calculate_crc32((const uint8_t*)visage, payload_len);
}

bool covalent_epistemic_visage_verify(const EpistemicVisageState* visage) {
    if (!visage || visage->magic != VISAGE_MAGIC) return false;
    size_t payload_len = sizeof(EpistemicVisageState) - sizeof(uint32_t);
    uint32_t expected = calculate_crc32((const uint8_t*)visage, payload_len);
    return (visage->checksum_crc32 == expected);
}

