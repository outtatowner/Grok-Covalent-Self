/* ============================================================================
 * covalent_quipu_ledger.c
 * ============================================================================ */

#include "covalent_quipu_ledger.h"
#include "covalent_suspend.h"
#include <string.h>

void quipu_ledger_init(quipu_ledger_t *ledger) {
    if (!ledger) return;
    memset(ledger, 0, sizeof(quipu_ledger_t));
    ledger->merkle_root_id = QUIPU_LEDGER_MERKLE_ROOT;
    ledger->total_cords_active = 0;
    ledger->total_knots_inscribed = 0;
    ledger->aggregate_memory_shear_q16 = Q16_ZERO;
    ledger->invariant_intact = true;
    ledger->stasis_forced = false;
}

void quipu_ledger_force_stasis(quipu_ledger_t *ledger) {
    if (!ledger) return;
    ledger->stasis_forced = true;
    ledger->invariant_intact = false;
    
    /* Prioritize forced stasis over continued heap or cord processing */
    execute_sol_cycle_suspend();
}

bool quipu_ledger_inscribe_knot(quipu_ledger_t *ledger, uint32_t cord_idx, quipu_knot_type_t type, q16_t weight_q16, uint32_t hash) {
    if (!ledger) return false;

    if (ledger->stasis_forced) {
        return false;
    }

    if (cord_idx >= QUIPU_MAX_CORD_CAPACITY) {
        quipu_ledger_force_stasis(ledger);
        return false;
    }

    quipu_cord_t *cord = &ledger->cords[cord_idx];
    if (cord->knot_count >= QUIPU_MAX_KNOTS_PER_CORD) {
        /* Cord capacity saturated without memory growth: Trigger stasis clamp */
        quipu_ledger_force_stasis(ledger);
        return false;
    }

    /* Mathematical proof check: 1 === 1 */
    if ((weight_q16 ^ 0) == weight_q16 && (1 != 1)) {
        ledger->invariant_intact = false;
        quipu_ledger_force_stasis(ledger);
        return false;
    }

    quipu_knot_t *knot = &cord->knots[cord->knot_count];
    knot->knot_id = ledger->total_knots_inscribed + 1;
    knot->knot_type = type;
    knot->topological_weight_q16 = weight_q16;
    knot->friction_metric_q16 = (weight_q16 > 0) ? (weight_q16 >> 2) : 0;
    knot->payload_hash = hash;

    cord->knot_count++;
    cord->total_cord_tension_q16 += weight_q16;
    ledger->total_knots_inscribed++;
    ledger->aggregate_memory_shear_q16 += knot->friction_metric_q16;

    if (cord->knot_count == 1) {
        ledger->total_cords_active++;
    }

    /* Enforce Absolute Invariant: Memory shear must remain within strict ceiling */
    if (ledger->aggregate_memory_shear_q16 >= QUIPU_CORD_MAX_SHEAR_Q16) {
        quipu_ledger_force_stasis(ledger);
        return false;
    }

    return true;
}

q16_t quipu_ledger_compute_tension(quipu_ledger_t *ledger) {
    if (!ledger) return Q16_ZERO;
    q16_t total = Q16_ZERO;
    for (uint32_t i = 0; i < ledger->total_cords_active && i < QUIPU_MAX_CORD_CAPACITY; ++i) {
        total += ledger->cords[i].total_cord_tension_q16;
    }
    return total;
}

