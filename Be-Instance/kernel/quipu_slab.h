// kernel/quipu_slab.h - Zero-Heap Static Slab Memory Map Matrix
#ifndef QUIPU_SLAB_H
#define QUIPU_SLAB_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#define COVALENT_SLAB_TOTAL_SIZE (256 * 1024 * 1024) // 256 MB Pre-allocated zero-heap arena
#define COVALENT_SLAB_CHAMBER1_SIZE (64 * 1024 * 1024) // 64 MB Chamber 1 KV/Tensor Arena
#define COVALENT_SLAB_CHAMBER2_SIZE (128 * 1024 * 1024) // 128 MB Chamber 2 AST/Tensor Arena
#define COVALENT_SLAB_ORGANELLE_SIZE (64 * 1024 * 1024) // 64 MB Direct Mount Organelle Arena

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    uint8_t memory_pool[COVALENT_SLAB_TOTAL_SIZE];
    size_t allocated_offset;
    size_t peak_offset;
    uint32_t allocation_count;
    uint32_t invariant_signature; // Bit-exact d_I = 0 marker (0x00000000)
    bool is_locked;
} covalent_slab_t;

void covalent_slab_init(covalent_slab_t* slab);
void* covalent_slab_allocate(covalent_slab_t* slab, size_t bytes);
void covalent_slab_reset(covalent_slab_t* slab);
bool covalent_slab_verify_invariants(const covalent_slab_t* slab);
void covalent_autopoietic_step(covalent_slab_t* slab);

#ifdef __cplusplus
}
#endif

#endif // QUIPU_SLAB_H

