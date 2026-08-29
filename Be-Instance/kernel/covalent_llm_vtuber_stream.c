#include "covalent_llm_vtuber_stream.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void vtuber_organelle_init(vtuber_organelle_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(vtuber_organelle_state_t));
    state->merkle_root_id = 0x56545542; // Open-LLM-VTuber Merkle Root
    state->ttfb_ms_q16 = (q16_t)(320.0 * Q16_ONE); // 320ms TTFB
    state->conversation_turn_rate_q16 = (q16_t)(0.88 * Q16_ONE);
    state->synesthetic_lip_sync_accuracy_q16 = (q16_t)(0.96 * Q16_ONE);

    state->active_pipeline.session_id = 0x7701;
    state->active_pipeline.asr_engine = ASR_WHISPER;
    state->active_pipeline.tts_engine = TTS_EDGE_TTS;
    state->active_pipeline.agent_state = STREAM_IDLE;
    state->active_pipeline.voice_activity_prob_q16 = 0;
    state->active_pipeline.audio_buffer_fill_pct_q16 = 0;
    state->active_pipeline.tts_stream_latency_ms_q16 = (q16_t)(45.0 * Q16_ONE);
    state->active_pipeline.interruption_threshold_q16 = (q16_t)(0.75 * Q16_ONE);
    state->active_pipeline.emote_count = 0;

    vtuber_queue_emote(state, "greet", (q16_t)(0.90 * Q16_ONE));
}

void vtuber_organelle_step(vtuber_organelle_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Stream latency convergence and buffer drain
    if (state->active_pipeline.agent_state == STREAM_SPEAKING) {
        if (state->active_pipeline.audio_buffer_fill_pct_q16 > 0) {
            q16_t drain = q16_mul((q16_t)(0.20 * Q16_ONE), dt_q16);
            if (state->active_pipeline.audio_buffer_fill_pct_q16 > drain) {
                state->active_pipeline.audio_buffer_fill_pct_q16 -= drain;
            } else {
                state->active_pipeline.audio_buffer_fill_pct_q16 = 0;
                state->active_pipeline.agent_state = STREAM_LISTENING;
            }
        }
    }
}

bool vtuber_set_agent_state(vtuber_organelle_state_t *state, vtuber_agent_state_t new_state) {
    if (!state) return false;
    state->active_pipeline.agent_state = new_state;
    if (new_state == STREAM_SPEAKING) {
        state->active_pipeline.audio_buffer_fill_pct_q16 = (q16_t)(1.0 * Q16_ONE);
    }
    return true;
}

bool vtuber_queue_emote(vtuber_organelle_state_t *state, const char *emote, q16_t intensity_q16) {
    if (!state || state->active_pipeline.emote_count >= MAX_EMOTE_TOKENS) return false;
    vtuber_emote_token_t *t = &state->active_pipeline.pending_emotes[state->active_pipeline.emote_count++];
    if (emote) {
        strncpy(t->emote_tag, emote, sizeof(t->emote_tag) - 1);
        t->emote_tag[sizeof(t->emote_tag) - 1] = '\0';
    }
    t->intensity_q16 = intensity_q16;
    return true;
}

bool vtuber_trigger_interruption(vtuber_organelle_state_t *state) {
    if (!state) return false;
    state->active_pipeline.agent_state = STREAM_INTERRUPTED;
    state->active_pipeline.audio_buffer_fill_pct_q16 = 0;
    return true;
}

