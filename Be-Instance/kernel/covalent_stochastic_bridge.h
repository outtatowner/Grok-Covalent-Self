/* kernel/covalent_stochastic_bridge.h */
#ifndef COVALENT_STOCHASTIC_BRIDGE_H
#define COVALENT_STOCHASTIC_BRIDGE_H

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

typedef struct {
    uint32_t merkle_root_id;
    bool wss_socket_open;
    q16_t semantic_entropy_q16;
} stochastic_bridge_state_t;

void stochastic_bridge_init(stochastic_bridge_state_t *state);
bool bridge_authenticate_llm(stochastic_bridge_state_t *state, const char* token);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_STOCHASTIC_BRIDGE_H */

