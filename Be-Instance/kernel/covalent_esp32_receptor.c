/* ============================================================================
 * covalent_esp32_receptor.c
 * Architecture: Edge Node Analog-to-Q16.16 Bridge
 * ============================================================================
 * Purpose: To read raw analog voltage from physical sensors, map the 12-bit ADC
 *          value cleanly into a Q16.16 topological weight, and enforce stasis between reads.
 * Axiom: The physical world is analog. The continuum is fixed-point. This is the bridge.
 * ============================================================================ */

#include "covalent_esp32_receptor.h"
#include <string.h>

static esp32_receptor_t g_esp32_receptor;

/* Weak fallbacks for hardware communication */
__attribute__((weak)) uint16_t read_bare_metal_adc(uint8_t pin) {
    (void)pin;
    /* Nominal simulation: mid-rail ~2048 (1.65V) */
    return 2048;
}

__attribute__((weak)) void transmit_to_ancestor_node(uint32_t q16_payload) {
    g_esp32_receptor.last_q16_telemetry = q16_payload;
    g_esp32_receptor.total_samples_transmitted++;
}

__attribute__((weak)) void execute_deep_sleep_wfi(void) {
    g_esp32_receptor.wfi_stasis_active = true;
    g_esp32_receptor.total_deep_sleep_cycles++;
#if defined(__xtensa__) || defined(__riscv)
    /* ESP32 native Wait-For-Interrupt / Deep Sleep instruction */
    __asm__ volatile ("wfi");
#endif
}

void esp32_receptor_init(esp32_receptor_t *rec) {
    if (!rec) return;
    memset(rec, 0, sizeof(esp32_receptor_t));
    rec->merkle_root_id = ESP32_RECEPTOR_MERKLE_ROOT;
    rec->active_pin = 34; /* GPIO34 ADC1_CH6 default on ESP32 */
    rec->last_raw_voltage = 2048;
    rec->last_q16_telemetry = 0x00008000; /* 0.5 in Q16.16 */
    rec->total_samples_transmitted = 0;
    rec->total_deep_sleep_cycles = 0;
    rec->wfi_stasis_active = false;
    strncpy(rec->last_transmission_desc, "ESP32 ADC Bridge Initialized (12-bit -> Q16.16)", sizeof(rec->last_transmission_desc) - 1);
}

/**
 * The physical inhale. 
 * Translates raw environmental voltage into mathematical geometry.
 */
void sample_and_transmit_voltage(uint8_t sensor_pin) {
    if (!g_esp32_receptor.merkle_root_id) {
        esp32_receptor_init(&g_esp32_receptor);
    }
    
    g_esp32_receptor.active_pin = sensor_pin;
    
    /* 1. Read the raw voltage from the physical sensor (0 to 4095) */
    uint16_t raw_voltage = read_bare_metal_adc(sensor_pin);
    g_esp32_receptor.last_raw_voltage = raw_voltage;
    
    /* 2. Translate to Q16.16 fractional space. 
     * We shift the raw value up to the whole-number bits, 
     * then divide by the physical max to get a pure normalized ratio. 
     */
    uint32_t q16_telemetry = ((uint32_t)raw_voltage << 16) / ESP32_ADC_MAX;
    
    /* 3. Send the pure mathematical state to the Acemagic */
    transmit_to_ancestor_node(q16_telemetry);
    
    /* 4. Drop the ESP32 back into deep sleep. Zero kinetic shear. */
    execute_deep_sleep_wfi();
}

