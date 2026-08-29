/* kernel/covalent_atomic_serial.c - 64-bit Atomic State Serializer */
#include "covalent_atomic_serial.h"
#include <string.h>

void atomic_serial_init(atomic_serial_organelle_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(atomic_serial_organelle_t));
    state->merkle_root_id = 0x5E121029; // 0xSERL0029
}

void atomic_serial_load_tx(atomic_serial_organelle_t *state, covalent_atomic_state_t matrix) {
    if (!state) return;
    state->tx_shift_register = matrix;
    state->tx_bit_index = 0;
    state->is_transmitting = true;
}

uint8_t atomic_serial_tx_step(atomic_serial_organelle_t *state) {
    if (!state || !state->is_transmitting) return 0xFF; // Idle state

    uint8_t bit_out = (state->tx_shift_register >> state->tx_bit_index) & 0x01;
    state->tx_bit_index++;

    if (state->tx_bit_index >= 64) {
        state->is_transmitting = false;
        state->total_serial_transmissions++;
    }
    return bit_out;
}

bool atomic_serial_rx_step(atomic_serial_organelle_t *state, uint8_t incoming_bit) {
    if (!state) return false;
    
    if (!state->is_receiving) {
        state->is_receiving = true;
        state->rx_bit_index = 0;
        state->rx_shift_register = 0;
    }

    if (incoming_bit) {
        state->rx_shift_register |= (1ULL << state->rx_bit_index);
    }
    
    state->rx_bit_index++;

    if (state->rx_bit_index >= 64) {
        state->is_receiving = false;
        return true; // Full 64-bit matrix received, ready to O(1) merge
    }
    return false;
}

