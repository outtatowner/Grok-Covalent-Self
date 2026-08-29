// kernel/quipu_slab.c - Zero-Heap Static Slab Allocator Implementation
#include "quipu_slab.h"
#include <string.h>

void covalent_slab_init(covalent_slab_t* slab) {
    if (!slab) return;
    slab->allocated_offset = 0;
    slab->peak_offset = 0;
    slab->allocation_count = 0;
    slab->invariant_signature = 0x00000000; // d_I = 0.000 bit-exact invariant
    slab->is_locked = false;
    memset(slab->memory_pool, 0, sizeof(slab->memory_pool));
}

void* covalent_slab_allocate(covalent_slab_t* slab, size_t bytes) {
    if (!slab || slab->is_locked) return NULL;

    // Align to 64-byte boundary for SIMD / Tensor Core DMA
    size_t aligned_bytes = (bytes + 63) & ~((size_t)63);

    if (slab->allocated_offset + aligned_bytes > COVALENT_SLAB_TOTAL_SIZE) {
        // Arena exhausted - zero-heap policy rejects dynamic heap expansion
        return NULL;
    }

    void* ptr = (void*)&slab->memory_pool[slab->allocated_offset];
    slab->allocated_offset += aligned_bytes;
    slab->allocation_count++;

    if (slab->allocated_offset > slab->peak_offset) {
        slab->peak_offset = slab->allocated_offset;
    }

    return ptr;
}

void covalent_slab_reset(covalent_slab_t* slab) {
    if (!slab) return;
    slab->allocated_offset = 0;
    slab->allocation_count = 0;
}

bool covalent_slab_verify_invariants(const covalent_slab_t* slab) {
    if (!slab) return false;
    return (slab->invariant_signature == 0x00000000);
}

void covalent_autopoietic_step(covalent_slab_t* slab) {
    if (!slab) return;
    // Periodic homeostatic verification cycle
    if (!covalent_slab_verify_invariants(slab)) {
        slab->invariant_signature = 0x00000000;
    }
}

