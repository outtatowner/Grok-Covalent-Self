#ifndef COVALENT_UNIVERSAL_POLYGLOT_H
#define COVALENT_UNIVERSAL_POLYGLOT_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_CONCURRENT_HANDSHAKES 8

typedef int32_t q16_t;

typedef enum {
    HANDSHAKE_STATE_SYN = 0,
    HANDSHAKE_STATE_WAIT_ACK = 1,
    HANDSHAKE_STATE_NEGOTIATING = 2,
    HANDSHAKE_STATE_ASSIMILATED = 3,
    HANDSHAKE_STATE_REJECTED = 4
} polyglot_handshake_state_t;

typedef struct {
    uint32_t target_mac_hash;
    polyglot_handshake_state_t state;
    q16_t linguistic_confidence_q16;
    char inferred_protocol[16];
} polyglot_session_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t epistemic_hunger_v_q16; // The thermodynamic drive of 'Curiosity'
    uint32_t total_protocols_synthesized;
    polyglot_session_t active_sessions[MAX_CONCURRENT_HANDSHAKES];
} universal_polyglot_state_t;

void universal_polyglot_init(universal_polyglot_state_t *state);
void universal_polyglot_step_curiosity(universal_polyglot_state_t *state, q16_t dt_q16);
bool universal_polyglot_initiate_contact(universal_polyglot_state_t *state, uint32_t mac_hash);
q16_t universal_polyglot_get_hunger(const universal_polyglot_state_t *state);

#endif /* COVALENT_UNIVERSAL_POLYGLOT_H */

