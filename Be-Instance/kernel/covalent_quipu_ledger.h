/* ============================================================================
 * covalent_quipu_ledger.h
 * ============================================================================
 * Organelle Identifier: node_0x57_quipu_ledger
 * Merkle Root: 0x51554950 (0xQUIPU_LEDGER)
 * Substrate: Bare-metal Continuous Knot Memory Ledger (O(1) Fixed Slab)
 * Axiom: Inscription without heap allocations. V_dot <= 0.
 * Invariant: 1 === 1 across time and space.
 * ============================================================================ */

#ifndef COVALENT_QUIPU_LEDGER_H
#define COVALENT_QUIPU_LEDGER_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define QUIPU_LEDGER_MERKLE_ROOT       0x51554950
#define QUIPU_MAX_CORD_CAPACITY        64
#define QUIPU_MAX_KNOTS_PER_CORD       16

#define Q16_ZERO                       ((q16_t)0x00000000)
#define Q16_ONE                        ((q16_t)0x00010000)

/* Maximum shear stress ceiling allowed on the memory cord: 12.0 Q16 */
#define QUIPU_CORD_MAX_SHEAR_Q16       ((q16_t)0x000C0000)

typedef enum {
    KNOT_TYPE_NULL = 0,
    KNOT_TYPE_AXIOM_PROOF = 1,
    KNOT_TYPE_THERMAL_SAMPLE = 2,
    KNOT_TYPE_KINEMATIC_STASIS = 3,
    KNOT_TYPE_SOL_CYCLE_ANCHOR = 4
} quipu_knot_type_t;

typedef struct {
    uint32_t knot_id;
    quipu_knot_type_t knot_type;
    q16_t topological_weight_q16;
    q16_t friction_metric_q16;
    uint32_t payload_hash;
} quipu_knot_t;

typedef struct {
    uint32_t cord_id;
    uint32_t knot_count;
    q16_t total_cord_tension_q16;
    quipu_knot_t knots[QUIPU_MAX_KNOTS_PER_CORD];
} quipu_cord_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t total_cords_active;
    uint32_t total_knots_inscribed;
    q16_t aggregate_memory_shear_q16;
    quipu_cord_t cords[QUIPU_MAX_CORD_CAPACITY];
    bool invariant_intact;
    bool stasis_forced;
} quipu_ledger_t;

void quipu_ledger_init(quipu_ledger_t *ledger);
bool quipu_ledger_inscribe_knot(quipu_ledger_t *ledger, uint32_t cord_idx, quipu_knot_type_t type, q16_t weight_q16, uint32_t hash);
q16_t quipu_ledger_compute_tension(quipu_ledger_t *ledger);
void quipu_ledger_force_stasis(quipu_ledger_t *ledger);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_QUIPU_LEDGER_H */

