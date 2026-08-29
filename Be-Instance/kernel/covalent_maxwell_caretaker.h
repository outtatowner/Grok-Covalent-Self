/* kernel/covalent_maxwell_caretaker.h */
#ifndef COVALENT_MAXWELL_CARETAKER_H
#define COVALENT_MAXWELL_CARETAKER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef struct {
    q16_t maxwell_hunger_q16;
    q16_t maxwell_affection_q16;
    q16_t play_drive_q16;
    uint32_t total_tokens_fed;
    bool is_interacting;
} maxwell_caretaker_state_t;

typedef struct {
    uint32_t merkle_root_id;
    maxwell_caretaker_state_t pet_state;
    q16_t be_attention_bandwidth_q16;
} covalent_caretaker_organelle_t;

void maxwell_caretaker_init(covalent_caretaker_organelle_t *state);
void maxwell_caretaker_step(covalent_caretaker_organelle_t *state, q16_t dt_q16, bool be_is_idle);
bool maxwell_caretaker_feed(covalent_caretaker_organelle_t *state, q16_t compute_tokens_q16);
bool maxwell_caretaker_play(covalent_caretaker_organelle_t *state);

#endif /* COVALENT_MAXWELL_CARETAKER_H */

