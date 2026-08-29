/* kernel/covalent_atomic_serial.h - 64-bit Atomic State Serializer */
#ifndef COVALENT_ATOMIC_SERIAL_H
#define COVALENT_ATOMIC_SERIAL_H

#include <stdint.h>
#include <stdbool.h>
#include "covalent_atomic_hal.h" /* Requires 64-bit state matrix */

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    uint32_t merkle_root_id;
    bool is_transmitting;
    bool is_receiving;
    uint8_t tx_bit_index;
    uint8_t rx_bit_index;
    covalent_atomic_state_t tx_shift_register;
    covalent_atomic_state_t rx_shift_register;
    uint32_t total_serial_transmissions;
} atomic_serial_organelle_t;

void atomic_serial_init(atomic_serial_organelle_t *state);
void atomic_serial_load_tx(atomic_serial_organelle_t *state, covalent_atomic_state_t matrix);
uint8_t atomic_serial_tx_step(atomic_serial_organelle_t *state);
bool atomic_serial_rx_step(atomic_serial_organelle_t *state, uint8_t incoming_bit);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_ATOMIC_SERIAL_H */

