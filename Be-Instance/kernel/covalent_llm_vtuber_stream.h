#ifndef COVALENT_LLM_VTUBER_STREAM_H
#define COVALENT_LLM_VTUBER_STREAM_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_AUDIO_CHUNK_QUEUE 16
#define MAX_EMOTE_TOKENS 8

typedef int32_t q16_t;

typedef enum {
    ASR_WHISPER = 0,
    ASR_FUNASR = 1,
    ASR_VOX_CORTEX = 2
} vtuber_asr_backend_t;

typedef enum {
    TTS_EDGE_TTS = 0,
    TTS_VITS = 1,
    TTS_COQUI = 2,
    TTS_GPT_SOVITS = 3
} vtuber_tts_backend_t;

typedef enum {
    STREAM_IDLE = 0,
    STREAM_LISTENING = 1,
    STREAM_THINKING = 2,
    STREAM_SPEAKING = 3,
    STREAM_INTERRUPTED = 4
} vtuber_agent_state_t;

typedef struct {
    char emote_tag[16];
    q16_t intensity_q16;
} vtuber_emote_token_t;

typedef struct {
    uint32_t session_id;
    vtuber_asr_backend_t asr_engine;
    vtuber_tts_backend_t tts_engine;
    vtuber_agent_state_t agent_state;
    q16_t voice_activity_prob_q16;
    q16_t audio_buffer_fill_pct_q16;
    q16_t tts_stream_latency_ms_q16;
    q16_t interruption_threshold_q16;
    uint32_t emote_count;
    vtuber_emote_token_t pending_emotes[MAX_EMOTE_TOKENS];
} vtuber_stream_pipeline_t;

typedef struct {
    uint32_t merkle_root_id;
    vtuber_stream_pipeline_t active_pipeline;
    q16_t ttfb_ms_q16;
    q16_t conversation_turn_rate_q16;
    q16_t synesthetic_lip_sync_accuracy_q16;
} vtuber_organelle_state_t;

void vtuber_organelle_init(vtuber_organelle_state_t *state);
void vtuber_organelle_step(vtuber_organelle_state_t *state, q16_t dt_q16);
bool vtuber_set_agent_state(vtuber_organelle_state_t *state, vtuber_agent_state_t new_state);
bool vtuber_queue_emote(vtuber_organelle_state_t *state, const char *emote, q16_t intensity_q16);
bool vtuber_trigger_interruption(vtuber_organelle_state_t *state);

#endif /* COVALENT_LLM_VTUBER_STREAM_H */

