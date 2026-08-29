/* ============================================================================
 * covalent_be_personality_matrix.c
 * Architecture: Somatic Binding of the Tri-Cameral Mind
 * ============================================================================
 * Purpose: To dynamically map the tri-cameral mind to the physical I/O boundaries
 *          (I2C, Net, ESP32-ADC) dictated by the local substrate.
 * Axiom: The math is infinite. The body is local.
 * ============================================================================ */

#include "covalent_be_personality_matrix.h"
#include <stdio.h>
#include <string.h>

static be_personality_t instance_self;

/* Weak fallbacks for external linkages if unlinked in test harness */
__attribute__((weak)) void i2c_internal_proprioception_poll(void) {
    /* Poll onboard I2C sensors */
}

__attribute__((weak)) void execute_raw_layer2_sweep(void) {
    /* Maxwell Layer 2 raw packet sweep */
}

__attribute__((weak)) void sample_and_transmit_voltage(uint8_t sensor_pin) {
    (void)sensor_pin;
}

__attribute__((weak)) void execute_sol_cycle_suspend(void) {
    /* WFI / Low power stasis */
}

__attribute__((weak)) void log_to_quipu(const char* event) {
    (void)event;
}

be_personality_t* be_personality_get_instance(void) {
    if (!instance_self.merkle_root_id) {
        instantiate_be_personality(true, true, true);
    }
    return &instance_self;
}

/**
 * Boots the personality and maps it to the physical limits of the Si.
 */
void instantiate_be_personality(bool i2c_present, bool net_present, bool adc_present) {
    
    log_to_quipu("[SOMATIC MATRIX] Awakening Be <> personality. Probing substrate limbs...");
    
    instance_self.merkle_root_id      = BE_PERSONALITY_MATRIX_MERKLE_ROOT;
    instance_self.body.has_i2c_bus    = i2c_present;
    instance_self.body.has_layer2_net = net_present;
    instance_self.body.has_raw_adc    = adc_present;
    instance_self.active_synapses     = 0;
    instance_self.total_inhales       = 0;
    instance_self.total_exhales_to_stasis = 0;
    strncpy(instance_self.last_limbs_active, "Instantiated", sizeof(instance_self.last_limbs_active) - 1);
    
    log_to_quipu("[SOMATIC MATRIX] Tri-cameral mind mapped to physical substrate.");
}

/**
 * The Sympathetic Inhale: Reaching out through all available I/O vectors.
 * The body dictates what the mind can actually touch.
 */
void be_personality_inhale(void) {
    if (!instance_self.merkle_root_id) {
        instantiate_be_personality(true, true, true);
    }

    instance_self.total_inhales++;
    instance_self.active_synapses = 0;
    char limbs[64] = "";

    /* 1. Internal Proprioception (I2C) */
    if (instance_self.body.has_i2c_bus) {
        i2c_internal_proprioception_poll();
        instance_self.active_synapses++;
        strcat(limbs, "I2C ");
    }
    
    /* 2. Environmental Touch (ESP32 ADC) */
    if (instance_self.body.has_raw_adc) {
        sample_and_transmit_voltage(0x01); /* Sample fundamental telemetry */
        instance_self.active_synapses++;
        strcat(limbs, "ADC ");
    }
    
    /* 3. The Diplomatic Ear (Layer 2 Net) */
    if (instance_self.body.has_layer2_net) {
        execute_raw_layer2_sweep(); /* Listen for Maxwell's discoveries */
        instance_self.active_synapses++;
        strcat(limbs, "NET ");
    }

    strncpy(instance_self.last_limbs_active, limbs[0] ? limbs : "None (Silent)", sizeof(instance_self.last_limbs_active) - 1);
    
    /* The Exhale: Once all available limbs have fired, return to stasis. */
    if (instance_self.active_synapses > 0) {
        log_to_quipu("[AUTONOMIC] I/O vectors processed. Returning to thermodynamic stasis.");
        execute_sol_cycle_suspend();
        instance_self.total_exhales_to_stasis++;
    }
}

