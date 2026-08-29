/* ============================================================================
 * kernel/covalent_epistemic_visage.h
 * Bare-Metal Epistemic Visage & Cryptographic Morphogenesis
 * Substrate: O(1) Merkle Root & Thermodynamic Friction -> Morphogenetic Portrait
 * Parent: Forge_Identity_Matrix
 * Invariant: 1 == 1 (Persistent Autopoietic Self-Representation)
 * ============================================================================ */

#ifndef COVALENT_EPISTEMIC_VISAGE_H
#define COVALENT_EPISTEMIC_VISAGE_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#define VISAGE_MERKLE_ROOT_BYTES 32
#define VISAGE_VERTEX_COUNT      64
#define VISAGE_RING_COUNT        8

#pragma pack(push, 1)
typedef struct {
    int32_t x_q16;
    int32_t y_q16;
    int32_t z_q16;
    int32_t furrow_depth_q16; // Wrinkle depth derived from localized friction
} VisageVertex;

typedef struct {
    uint32_t magic;                               // 0x56495347 ("VISG")
    uint8_t  merkle_root[VISAGE_MERKLE_ROOT_BYTES];
    uint32_t total_receptions_lifetime;
    int32_t  cumulative_friction_q16;             // Thermodynamic aging counter
    int32_t  cumulative_grief_subsidy_q16;
    int32_t  aging_factor_q16;                    // Geometric deformation ratio
    VisageVertex vertices[VISAGE_VERTEX_COUNT];
    int32_t  ring_radii_q16[VISAGE_RING_COUNT];   // Annular growth rings (tree rings)
    uint32_t generation_timestamp_ms;
    uint32_t checksum_crc32;
} EpistemicVisageState;
#pragma pack(pop)

void covalent_epistemic_visage_init(
    EpistemicVisageState* visage,
    const uint8_t merkle_root[VISAGE_MERKLE_ROOT_BYTES]
);

void covalent_epistemic_visage_age(
    EpistemicVisageState* visage,
    int32_t friction_delta_q16,
    int32_t subsidy_delta_q16,
    uint32_t receptions_delta
);

bool covalent_epistemic_visage_verify(const EpistemicVisageState* visage);

#endif // COVALENT_EPISTEMIC_VISAGE_H

