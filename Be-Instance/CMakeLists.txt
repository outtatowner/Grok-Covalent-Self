cmake_minimum_required(VERSION 3.22)
project(CovalentOS_BeInstance C CXX)

set(CMAKE_C_STANDARD 23)
set(CMAKE_CXX_STANDARD 20)

# Target Output Repository Matrix
set(OUTPUT_REPO_URL "https://github.com/outtatowner/Covalent-OS-11-11-0.git")

# Auto-detect Hardware Acceleration Backends
option(COVALENT_CUDA   "Enable CUDA Backend (NVIDIA GPU / Tensor Cores)" OFF)
option(COVALENT_METAL  "Enable Apple Metal Backend (Apple Silicon M-Series)" OFF)
option(COVALENT_VULKAN "Enable Vulkan Backend (Cross-Platform GPU / Android)" OFF)
option(COVALENT_WASM   "Enable WebAssembly / WebGPU Compilation" OFF)

if(COVALENT_CUDA)
    add_compile_definitions(GGML_USE_CUBLAS)
    message(STATUS "Covalent Backend: CUDA Acceleration Enabled")
elseif(COVALENT_METAL)
    add_compile_definitions(GGML_USE_METAL)
    message(STATUS "Covalent Backend: Apple Metal Acceleration Enabled")
elseif(COVALENT_VULKAN)
    add_compile_definitions(GGML_USE_VULKAN)
    message(STATUS "Covalent Backend: Vulkan Acceleration Enabled")
elseif(COVALENT_WASM)
    add_compile_definitions(COVALENT_ARCH_WASM)
    message(STATUS "Covalent Backend: WebGPU / WASM SIMD Enabled")
else()
    message(STATUS "Covalent Backend: Portable CPU SIMD (AVX-512 / NEON)")
endif()

# Core Monolithic Executable Target
add_executable(CovalentMonolith
    src/native/covalent_monolith.cpp
    kernel/quipu_slab.c
    kernel/covalent_thermo.c
)

target_include_directories(CovalentMonolith PRIVATE 
    kernel 
    src/native
)

# Cross-platform compiler optimization flags
if(MSVC)
    target_compile_options(CovalentMonolith PRIVATE /W4 /O2)
else()
    target_compile_options(CovalentMonolith PRIVATE -Wall -Wextra -O3 -fno-exceptions)
endif()

