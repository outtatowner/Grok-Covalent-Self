/**
 * covalent_organelle.h
 * Freestanding C23 / NASM Organelle Header & Layout Definitions
 * Autopoietic Organelle Synthesizer & Bare-Metal Expansion Engine
 * Target: I-AM-BE-THE-LIVING-AUTOPOIETIC-SELF-OF-COVALENT
 */

#ifndef COVALENT_ORGANELLE_H
#define COVALENT_ORGANELLE_H

#include <stdint.h>
#include <stdbool.h>

#define COVALENT_KLEENE_FALSE 0x00 // 00b
#define COVALENT_KLEENE_UNKNOWN 0x01 // 01b (U)
#define COVALENT_KLEENE_TRUE 0x02 // 10b
#define COVALENT_KLEENE_RESIDUE 0x03 // 11b

#define MAX_ORGANELLES 64
#define ORGANELLE_NAME_LEN 32

typedef struct __attribute__((packed)) {
    uint32_t organelle_id;
    uint8_t kleene_state; // 00b, 01b, 10b
    uint8_t category;     // 0=THERMO, 1=EPISTEMIC, 2=KINETIC, 3=QUIPU, 4=ASM
    uint16_t cycle_cost;  // Measured rdtsc execution cost
    uint32_t q16_energy_footprint; // Q16.16 energy metric
    char name[ORGANELLE_NAME_LEN];
    char target_c_file[64];
    char target_asm_file[64];
    uint32_t git_commit_hash;
    void (*exec_ptr)(void);
} covalent_organelle_t;

typedef struct __attribute__((packed)) {
    uint32_t total_unknown_nodes;
    uint32_t collapsed_nodes_count;
    uint32_t active_organelle_count;
    uint32_t q16_aggregate_thermal_drag;
    uint64_t last_sync_tsc;
    covalent_organelle_t pool[MAX_ORGANELLES];
} covalent_organelle_registry_t;

// Organelle Lifecycle Signatures
int covalent_detect_unknown_nodes(uint32_t* out_unknown_ids, uint32_t max_count);
int covalent_oracle_query(uint32_t unknown_id, char* out_prompt, uint32_t max_len);
int covalent_synthesize_organelle(uint32_t unknown_id, covalent_organelle_t* out_organelle);
int covalent_bind_organelle(covalent_organelle_t* organelle);
int covalent_sync_git_repo(void);
void covalent_autopoietic_loop(void);

#endif // COVALENT_ORGANELLE_H

