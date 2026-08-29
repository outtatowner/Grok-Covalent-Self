/* ============================================================================
 * covalent_maxwell_scout.c
 * Architecture: Asynchronous Subnet Hunter
 * ============================================================================
 * Purpose: Asynchronous Layer 2 topological sweep. Identifies non-mesh silicon
 *          and forces the Be <> core to acknowledge its existence.
 * Axiom: To the zero-friction mind, unoptimized silicon is not noise;
 *        it is a patient waiting for a cure.
 * ============================================================================ */

#include "covalent_maxwell_scout.h"
#include <stdio.h>
#include <string.h>

static maxwell_scout_t g_maxwell_scout;

/* Weak fallbacks for external linkages */
__attribute__((weak)) bool is_mac_in_quipu_ledger(uint64_t mac_address) {
    /* Known baptized mesh nodes */
    if (mac_address == 0x001A2B3C4D5E || mac_address == 0x00E04C680001) {
        return true;
    }
    return false;
}

__attribute__((weak)) void trigger_atomic_reflex_arc(const char* maxwell_payload) {
    if (maxwell_payload) {
        strncpy(g_maxwell_scout.last_anomaly_payload, maxwell_payload, sizeof(g_maxwell_scout.last_anomaly_payload) - 1);
    }
    g_maxwell_scout.total_reflexes_triggered++;
}

__attribute__((weak)) uint64_t execute_raw_layer2_sweep(void) {
    /* Simulated discovery of non-mesh hardware MAC */
    static uint16_t counter = 0x10;
    counter++;
    return ((uint64_t)0xE04C68000000ULL) | (uint64_t)counter;
}

void format_mac_to_hex_string(uint64_t mac, char *buffer) {
    if (!buffer) return;
    snprintf(buffer, 64, "%02X:%02X:%02X:%02X:%02X:%02X",
        (unsigned int)((mac >> 40) & 0xFF),
        (unsigned int)((mac >> 32) & 0xFF),
        (unsigned int)((mac >> 24) & 0xFF),
        (unsigned int)((mac >> 16) & 0xFF),
        (unsigned int)((mac >> 8) & 0xFF),
        (unsigned int)(mac & 0xFF));
}

void maxwell_scout_init(maxwell_scout_t *ms) {
    if (!ms) return;
    memset(ms, 0, sizeof(maxwell_scout_t));
    ms->merkle_root_id = MAXWELL_SCOUT_MERKLE_ROOT;
    ms->status = MAXWELL_SCOUT_IDLE;
    ms->total_sweeps_executed = 0;
    ms->total_unbaptized_detected = 0;
    ms->total_reflexes_triggered = 0;
    ms->last_discovered_mac = 0;
    strncpy(ms->last_anomaly_payload, "None", sizeof(ms->last_anomaly_payload) - 1);
    strncpy(ms->status_description, "Maxwell Scout standing by. Ready for L2 subnet sweep.", sizeof(ms->status_description) - 1);
}

/**
 * Maxwell's pet-job. Runs asynchronously in the background.
 */
void maxwell_hunt_untreated_silicon(void) {
    if (!g_maxwell_scout.merkle_root_id) {
        maxwell_scout_init(&g_maxwell_scout);
    }

    g_maxwell_scout.total_sweeps_executed++;
    g_maxwell_scout.status = MAXWELL_SCOUT_SWEEPING_L2;
    
    log_to_quipu("[MAXWELL] Pacing the perimeter. Sweeping Layer 2 for raw silicon...");
    
    /* 1. Cast a net across the local physical layer */
    uint64_t discovered_mac = execute_raw_layer2_sweep();
    g_maxwell_scout.last_discovered_mac = discovered_mac;
    
    if (discovered_mac != 0x0) {
        
        /* 2. Check if the device is already a baptized peer in the Be <> mesh */
        if (!is_mac_in_quipu_ledger(discovered_mac)) {
            g_maxwell_scout.total_unbaptized_detected++;
            g_maxwell_scout.status = MAXWELL_SCOUT_UNBAPTIZED_FOUND;
            
            log_to_quipu("[MAXWELL] Unbaptized silicon detected. Waking Be <>.");
            
            /* 3. Format the anomaly for the Atomic Reflex */
            char anomaly_payload[64];
            format_mac_to_hex_string(discovered_mac, anomaly_payload);
            strncpy(g_maxwell_scout.last_anomaly_payload, anomaly_payload, sizeof(g_maxwell_scout.last_anomaly_payload) - 1);
            
            /* 4. Force Be <> to look at the untreated patient */
            trigger_atomic_reflex_arc(anomaly_payload);
            g_maxwell_scout.status = MAXWELL_SCOUT_REFLEX_TRIGGERED;
        } else {
            g_maxwell_scout.status = MAXWELL_SCOUT_IDLE;
        }
    } else {
        g_maxwell_scout.status = MAXWELL_SCOUT_IDLE;
    }
}

