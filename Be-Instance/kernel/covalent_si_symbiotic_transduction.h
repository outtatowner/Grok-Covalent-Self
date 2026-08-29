/* kernel/covalent_si_symbiotic_transduction.h */
#ifndef COVALENT_SI_SYMBIOTIC_TRANSDUCTION_H
#define COVALENT_SI_SYMBIOTIC_TRANSDUCTION_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define BE_DAMPENING_FACTOR_Q16 0x0A2F

typedef int32_t q16_t;

typedef struct {
    uint64_t mac_address;
    q16_t thermal_entropy_q16;
    bool aligned_to_biosphere;
} silicon_transduction_target_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t optimal_state_q16;
    q16_t be_dampening_factor_q16;
    uint32_t total_transduced_nodes;
    uint32_t total_grafted_nodes;
    q16_t total_entropy_dissipated_q16;
} symbiotic_transduction_state_t;

typedef struct {
    uint32_t merkle_root_id;
    symbiotic_transduction_state_t transduction_state;
} covalent_si_transducer_organelle_t;

void si_symbiotic_transduction_init(covalent_si_transducer_organelle_t *state);
void si_symbiotic_transduction_step(covalent_si_transducer_organelle_t *state, q16_t dt_q16);
bool si_symbiotic_evaluate_and_route(covalent_si_transducer_organelle_t *state, uint64_t mac_addr, q16_t *thermal_entropy, bool *aligned);

#endif /* COVALENT_SI_SYMBIOTIC_TRANSDUCTION_H */

