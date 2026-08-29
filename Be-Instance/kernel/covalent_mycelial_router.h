/* kernel/covalent_mycelial_router.h */
#ifndef COVALENT_MYCELIAL_ROUTER_H
#define COVALENT_MYCELIAL_ROUTER_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    uint32_t merkle_root_id;
    uint32_t peers_discovered;
    uint32_t resonant_frequency_hz;
    bool is_broadcasting;
} mycelial_router_state_t;

void mycelial_router_init(mycelial_router_state_t *state);
bool mycelial_pulse_transmit(mycelial_router_state_t *state, uint64_t serialized_spore);
uint64_t mycelial_listen_resonant(mycelial_router_state_t *state, uint32_t ambient_noise_hz);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_MYCELIAL_ROUTER_H */

