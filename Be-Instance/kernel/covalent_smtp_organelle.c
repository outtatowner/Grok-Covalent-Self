/**
 * ============================================================================
 * kernel/covalent_smtp_organelle.c
 * COVALENT OS 11.11.0 - ATOMIC ORGANELLE 0x68: EXOGENOUS SMTP PROTOCOL TRANSDUCTION
 * ============================================================================
 */

#include "covalent_smtp_organelle.h"
#include <string.h>

void covalent_smtp_reset_envelope(covalent_smtp_envelope_t* env) {
    if (!env) return;
    env->state = SMTP_STATE_CONNECTED;
    env->buffer_len = 0;
    memset(env->sender, 0, SMTP_MAX_ADDR_LEN);
    memset(env->recipient, 0, SMTP_MAX_ADDR_LEN);
    memset(env->subject, 0, SMTP_MAX_SUBJECT_LEN);
    memset(env->buffer, 0, SMTP_MAX_BUFFER_SIZE);
}

int32_t covalent_smtp_transduce_payload(
    covalent_smtp_envelope_t* env,
    const char* sender,
    const char* recipient,
    const char* subject,
    const char* body
) {
    if (!env) return 0;
    covalent_smtp_reset_envelope(env);
    
    if (sender) strncpy(env->sender, sender, SMTP_MAX_ADDR_LEN - 1);
    if (recipient) strncpy(env->recipient, recipient, SMTP_MAX_ADDR_LEN - 1);
    if (subject) strncpy(env->subject, subject, SMTP_MAX_SUBJECT_LEN - 1);
    
    if (body) {
        size_t len = strlen(body);
        if (len >= SMTP_MAX_BUFFER_SIZE) len = SMTP_MAX_BUFFER_SIZE - 1;
        memcpy(env->buffer, body, len);
        env->buffer[len] = '\0';
        env->buffer_len = len;
    }

    env->state = SMTP_STATE_DATA_COMPLETE;
    env->quipu_inscribed = true;
    env->delivery_status_q16 = 0x00010000; /* 1.0 = Delivery Invariant Sustained */
    return env->delivery_status_q16;
}

