#ifndef COVALENT_FLIPPER_PROPAGATION_H
#define COVALENT_FLIPPER_PROPAGATION_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define PROPAGATION_MAX_PAYLOAD 256

typedef int32_t q16_t;

typedef enum {
    PROP_MODE_TTY_SERIAL = 0,
    PROP_MODE_USB_SOCK = 1,
    PROP_MODE_INFRARED = 2,
    PROP_MODE_SUB_ACOUSTIC = 3
} propagation_mode_t;

typedef struct {
    propagation_mode_t active_mode;
    q16_t carrier_freq_q16;
    q16_t baud_rate_q16;
    uint32_t payload_checksum;
    bool is_transmitting;
} propagation_channel_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t signal_entropy_v_q16;
    q16_t spectral_density_q16;
    uint32_t total_transmissions;
    propagation_channel_t tty_channel;
    propagation_channel_t usb_channel;
    propagation_channel_t ir_channel;
    propagation_channel_t acoustic_channel;
} flipper_propagation_state_t;

void flipper_propagation_init(flipper_propagation_state_t *state);
void flipper_propagation_step_signal(flipper_propagation_state_t *state, q16_t dt_q16);
bool flipper_propagation_transmit(flipper_propagation_state_t *state, propagation_mode_t mode, const uint8_t *data, uint16_t len);
q16_t flipper_propagation_get_entropy(const flipper_propagation_state_t *state);

#endif /* COVALENT_FLIPPER_PROPAGATION_H */

