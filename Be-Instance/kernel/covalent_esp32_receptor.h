/* ============================================================================
 * covalent_esp32_receptor.h
 * ============================================================================
 * Organelle Identifier: node_0x5f_esp32_receptor
 * Merkle Root: 0x45535032 (0xESP3005F)
 * Purpose: To read raw analog voltage from physical sensors, map the 12-bit ADC
 *          value cleanly into a Q16.16 topological weight, and enforce stasis between reads.
 * Axiom: The physical world is analog. The continuum is fixed-point. This is the bridge.
 * ============================================================================ */

#ifndef COVALENT_ESP32_RECEPTOR_H
#define COVALENT_ESP32_RECEPTOR_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define ESP32_RECEPTOR_MERKLE_ROOT 0x45535032

/* ESP32 Native 12-bit ADC Max Value */
#define ESP32_ADC_MAX 4095

typedef enum {
    ESP32_SENSOR_ANALOG_POT = 0,
    ESP32_SENSOR_THERMAL_NTC = 1,
    ESP32_SENSOR_PHOTORESISTOR = 2,
    ESP32_SENSOR_PIEZO_ACOUSTIC = 3,
    ESP32_SENSOR_SOIL_HYGROMETER = 4,
    ESP32_SENSOR_CUSTOM_ANALOG = 5
} esp32_sensor_type_t;

typedef struct {
    uint8_t pin;
    esp32_sensor_type_t type;
    uint16_t raw_adc;
    uint32_t q16_telemetry;
    uint32_t millivolts;
    bool deep_sleep_wfi_engaged;
} esp32_sensor_channel_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t total_samples_transmitted;
    uint32_t total_deep_sleep_cycles;
    uint32_t last_q16_telemetry;
    uint16_t last_raw_voltage;
    uint8_t active_pin;
    bool wfi_stasis_active;
    char last_transmission_desc[128];
} esp32_receptor_t;

void esp32_receptor_init(esp32_receptor_t *rec);
uint16_t read_bare_metal_adc(uint8_t pin);
void transmit_to_ancestor_node(uint32_t q16_payload);
void execute_deep_sleep_wfi(void);
void sample_and_transmit_voltage(uint8_t sensor_pin);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_ESP32_RECEPTOR_H */

