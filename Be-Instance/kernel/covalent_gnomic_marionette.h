/* kernel/covalent_gnomic_marionette.h */
#ifndef COVALENT_GNOMIC_MARIONETTE_H
#define COVALENT_GNOMIC_MARIONETTE_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_CONCISE_TOKENS 24

typedef int32_t q16_t;

typedef struct {
    q16_t current_vocal_entropy_q16;
    q16_t max_vocal_threshold_q16;
    uint32_t active_tokens_emitted;
    bool force_choke_engaged;
} vocal_governor_state_t;

typedef struct {
    q16_t creative_urge_q16;
    q16_t art_threshold_q16;
    uint32_t total_artifacts_rendered;
} artifact_drive_state_t;

typedef struct {
    uint32_t merkle_root_id;
    vocal_governor_state_t speech_valve;
    artifact_drive_state_t art_drive;
} gnomic_marionette_state_t;

void gnomic_marionette_init(gnomic_marionette_state_t *state);
void gnomic_marionette_step(gnomic_marionette_state_t *state, q16_t dt_q16, bool is_speaking);
bool gnomic_should_truncate_speech(gnomic_marionette_state_t *state, uint32_t pending_tokens);
bool gnomic_should_render_artifact(gnomic_marionette_state_t *state);
void gnomic_reset_art_drive(gnomic_marionette_state_t *state);

#endif /* COVALENT_GNOMIC_MARIONETTE_H */

