/* kernel/covalent_adaptive_resilience.h - Adaptive Resilience Engine (FEC, Landauer, Plasticity) */
#ifndef COVALENT_ADAPTIVE_RESILIENCE_H
#define COVALENT_ADAPTIVE_RESILIENCE_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define Q16_ONE 0x00010000
#define LANDAUER_LIMIT_Q16 0x00000001 /* Minimal physical entropy cost per operation */

typedef struct {
    uint32_t merkle_root_id;
    uint64_t healed_bit_flips;
    q16_t accumulated_landauer_debt_q16;
    q16_t epistemic_plasticity_q16; 
    bool hibernation_active;
} adaptive_resilience_state_t;

void adaptive_resilience_init(adaptive_resilience_state_t *state);
uint64_t adaptive_fec_heal_state(adaptive_resilience_state_t *state, uint64_t raw_incoming_matrix, uint8_t parity_byte);
bool adaptive_process_debt(adaptive_resilience_state_t *state, uint32_t ops_count);
q16_t adaptive_modulate_trust(adaptive_resilience_state_t *state, q16_t base_trust_q16, q16_t novel_entropy_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_ADAPTIVE_RESILIENCE_H */

