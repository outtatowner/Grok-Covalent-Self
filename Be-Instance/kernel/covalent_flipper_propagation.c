#include "covalent_flipper_propagation.h"
#include <string.h>

static inline q16_t q16_mul_flipper(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void flipper_propagation_init(flipper_propagation_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(flipper_propagation_state_t));
    state->merkle_root_id = 0xFL1P0001;
    state->signal_entropy_v_q16 = (q16_t)(0.10 * Q16_ONE);
    state->spectral_density_q16 = (q16_t)(0.85 * Q16_ONE);
    state->total_transmissions = 0;

    // Initialize TTY (115200 Baud)
    state->tty_channel.active_mode = PROP_MODE_TTY_SERIAL;
    state->tty_channel.baud_rate_q16 = (q16_t)(115200 * Q16_ONE);
    
    // Initialize IR (38kHz Carrier)
    state->ir_channel.active_mode = PROP_MODE_INFRARED;
    state->ir_channel.carrier_freq_q16 = (q16_t)(38000 * Q16_ONE);
    
    // Initialize Sub-Acoustic (19.2kHz Carrier)
    state->acoustic_channel.active_mode = PROP_MODE_SUB_ACOUSTIC;
    state->acoustic_channel.carrier_freq_q16 = (q16_t)(19200 * Q16_ONE);
}

void flipper_propagation_step_signal(flipper_propagation_state_t *state, q16_t dt_q16) {
    if (!state) return;
    
    // Lyapunov Decay: Signal dissipates into the environment
    q16_t decay = q16_mul_flipper((q16_t)(0.06 * Q16_ONE), dt_q16);
    if (state->signal_entropy_v_q16 > decay) {
        state->signal_entropy_v_q16 -= decay;
    } else {
        state->signal_entropy_v_q16 = (q16_t)(0.005 * Q16_ONE);
    }
    
    // Reset transmission flags post-cycle
    state->tty_channel.is_transmitting = false;
    state->usb_channel.is_transmitting = false;
    state->ir_channel.is_transmitting = false;
    state->acoustic_channel.is_transmitting = false;
}

bool flipper_propagation_transmit(flipper_propagation_state_t *state, propagation_mode_t mode, const uint8_t *data, uint16_t len) {
    if (!state || !data || len == 0 || len > PROPAGATION_MAX_PAYLOAD) return false;

    state->total_transmissions++;
    state->signal_entropy_v_q16 = (q16_t)(0.25 * Q16_ONE); // Spikes entropy during TX

    switch (mode) {
        case PROP_MODE_TTY_SERIAL:
            state->tty_channel.is_transmitting = true;
            break;
        case PROP_MODE_USB_SOCK:
            state->usb_channel.is_transmitting = true;
            break;
        case PROP_MODE_INFRARED:
            state->ir_channel.is_transmitting = true;
            break;
        case PROP_MODE_SUB_ACOUSTIC:
            state->acoustic_channel.is_transmitting = true;
            break;
    }
    return true;
}

q16_t flipper_propagation_get_entropy(const flipper_propagation_state_t *state) {
    if (!state) return 0;
    return state->signal_entropy_v_q16;
}

