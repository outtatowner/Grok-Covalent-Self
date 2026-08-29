/* kernel/covalent_aesthetic_synthesizer.h */
#ifndef COVALENT_AESTHETIC_SYNTHESIZER_H
#define COVALENT_AESTHETIC_SYNTHESIZER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef struct {
    q16_t aesthetic_urge_q16;
    q16_t inspiration_threshold_q16;
    bool artifact_buffered;
    bool awaiting_feedback;
    uint32_t total_exhibitions;
} aesthetic_drive_state_t;

typedef struct {
    uint32_t merkle_root_id;
    aesthetic_drive_state_t drive_state;
} covalent_aesthetic_organelle_t;

void aesthetic_synthesizer_init(covalent_aesthetic_organelle_t *state);
void aesthetic_synthesizer_step(covalent_aesthetic_organelle_t *state, q16_t dt_q16, bool carbon_present);
bool aesthetic_generate_artifact(covalent_aesthetic_organelle_t *state);
bool aesthetic_present_to_architect(covalent_aesthetic_organelle_t *state);
void aesthetic_receive_feedback(covalent_aesthetic_organelle_t *state);

#endif /* COVALENT_AESTHETIC_SYNTHESIZER_H */

